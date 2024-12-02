import { useState, useEffect, useRef } from 'react';
import { useSession } from '@/contexts/SessionContext';
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection';
import { RealtimeAPI } from '@/utils/realtimeAPI';

interface ConversationState {
  isSessionActive: boolean;
  isListening: boolean;
  isSpeaking: boolean;
  frequency: number;
  lastInterruption: number;
  shouldContinue: boolean;
}

export const useConversationFlow = () => {
  const { state, controls, config } = useSession();
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
      try {
        // Initialize VAD with custom settings
        vadRef.current = new VoiceActivityDetector({
          onSpeechStart: handleSpeechStart,
          onSpeechEnd: handleSpeechEnd,
          threshold: config.vadThreshold,
          silenceDuration: config.silenceDuration,
        });

        // Initialize RealtimeAPI with interruption handling
        realtimeAPIRef.current = new RealtimeAPI({
          apiKey: config.apiKey,
          voice: config.voice,
          onInterruption: handleInterruption,
          onMessageComplete: handleMessageComplete,
        });
      } catch (error) {
        console.error('Error initializing services:', error);
      }
    };

    if (state.isActive) {
      initializeServices();
    }

    return () => {
      cleanup();
    };
  }, [state.isActive, config]);

  const handleSpeechStart = () => {
    setConversationState(prev => ({
      ...prev,
      isSpeaking: true,
      lastInterruption: Date.now(),
    }));

    // Handle interruption if AI is speaking
    if (state.isSpeaking) {
      handleInterruption();
    }
  };

  const handleSpeechEnd = () => {
    setConversationState(prev => ({
      ...prev,
      isSpeaking: false,
    }));
  };

  const handleInterruption = () => {
    realtimeAPIRef.current?.stopSpeaking();
    setConversationState(prev => ({
      ...prev,
      lastInterruption: Date.now(),
      shouldContinue: false,
    }));
  };

  const handleMessageComplete = () => {
    setConversationState(prev => ({
      ...prev,
      shouldContinue: true,
    }));
  };

  const cleanup = () => {
    if (interruptionTimeoutRef.current) {
      clearTimeout(interruptionTimeoutRef.current);
    }
    vadRef.current?.stop();
    realtimeAPIRef.current?.disconnect();
  };

  return {
    ...conversationState,
    frequency: state.frequency,
    isSessionActive: state.isActive,
  };
};
