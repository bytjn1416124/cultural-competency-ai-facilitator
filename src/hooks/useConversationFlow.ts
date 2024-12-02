import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection';
import { RealtimeAPI } from '@/utils/realtimeAPI';
import { SESSION_CONFIG } from '@/constants/config';

interface ConversationState {
  isSessionActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  frequency: number;
  lastInterruption: number;
  shouldContinue: boolean;
}

export const useConversationFlow = () => {
  const { state, controls } = useSession();
  const [conversationState, setConversationState] = useState<ConversationState>({
    isSessionActive: false,
    isListening: false,
    isSpeaking: false,
    frequency: 0,
    lastInterruption: 0,
    shouldContinue: true,
  });

  const vadRef = useRef<VoiceActivityDetector | null>(null);
  const realtimeAPIRef = useRef<RealtimeAPI | null>(null);
  const interruptionTimeoutRef = useRef<NodeJS.Timeout>();

  // Initialize VAD and RealtimeAPI
  useEffect(() => {
    const initializeServices = async () => {
      // Initialize VAD with custom settings
      vadRef.current = new VoiceActivityDetector({
        onSpeechStart: handleSpeechStart,
        onSpeechEnd: handleSpeechEnd,
        threshold: SESSION_CONFIG.DEFAULT_VAD_THRESHOLD,
        silenceDuration: SESSION_CONFIG.DEFAULT_SILENCE_DURATION,
      });

      // Initialize RealtimeAPI with interruption handling
      realtimeAPIRef.current = new RealtimeAPI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY!,
        voice: SESSION_CONFIG.VOICE_OPTIONS[0].id,
        onInterruption: handleInterruption,
        onMessageComplete: handleMessageComplete,
      });
    };

    initializeServices();

    return () => {
      vadRef.current?.stop();
      realtimeAPIRef.current?.disconnect();
    };
  }, []);

  // Handle speech detection
  const handleSpeechStart = () => {
    setConversationState(prev => ({
      ...prev,
      isSpeaking: true,
      lastInterruption: Date.now(),
    }));

    // Check if AI is speaking and handle interruption
    if (state.isAISpeaking) {
      handleInterruption();
    }
  };

  const handleSpeechEnd = () => {
    setConversationState(prev => ({
      ...prev,
      isSpeaking: false,
    }));

    // Add delay before continuing to ensure no immediate speech
    interruptionTimeoutRef.current = setTimeout(() => {
      if (conversationState.shouldContinue) {
        continueScript();
      }
    }, SESSION_CONFIG.SPEECH_END_DELAY);
  };

  // Handle AI interruptions
  const handleInterruption = () => {
    realtimeAPIRef.current?.stopSpeaking();
    setConversationState(prev => ({
      ...prev,
      lastInterruption: Date.now(),
      shouldContinue: false,
    }));
  };

  // Handle message completion
  const handleMessageComplete = () => {
    setConversationState(prev => ({
      ...prev,
      shouldContinue: true,
    }));

    if (!conversationState.isSpeaking) {
      continueScript();
    }
  };

  // Continue with script
  const continueScript = () => {
    if (!conversationState.isSessionActive || !conversationState.shouldContinue) {
      return;
    }

    controls.moveToNextStep();
  };

  // Start session
  const startSession = async () => {
    try {
      await vadRef.current?.start();
      await realtimeAPIRef.current?.connect();
      
      setConversationState(prev => ({
        ...prev,
        isSessionActive: true,
        isListening: true,
      }));

      controls.startSession();
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  // End session
  const endSession = () => {
    vadRef.current?.stop();
    realtimeAPIRef.current?.disconnect();
    
    setConversationState({
      isSessionActive: false,
      isListening: false,
      isSpeaking: false,
      frequency: 0,
      lastInterruption: 0,
      shouldContinue: true,
    });

    controls.endSession();
  };

  return {
    ...conversationState,
    startSession,
    endSession,
  };
};
