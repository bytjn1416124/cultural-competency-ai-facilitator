import { useState, useCallback, useEffect, useRef } from 'react';
import { RealtimeAPI } from '@/utils/realtimeAPI';
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection';

interface SessionState {
  isActive: boolean;
  currentSection: string;
  isSpeaking: boolean;
  frequency: number;
  error: string | null;
  transcription: string;
  lastResponse: string;
}

interface UseSessionOptions {
  onFrequencyChange?: (frequency: number) => void;
  onError?: (error: string) => void;
}

const SECTIONS = {
  INTRODUCTION: 'introduction',
  UNDERSTANDING_POPULATION: 'understanding_population',
  ASSESSING_SERVICE: 'assessing_service',
  ENHANCING_COMPETENCE: 'enhancing_competence',
  IMPROVING_ACCESS: 'improving_access',
  MONITORING: 'monitoring',
  WORKFORCE_DEVELOPMENT: 'workforce_development',
  ACTION_PLANNING: 'action_planning',
};

export const useSession = (options: UseSessionOptions = {}) => {
  const [state, setState] = useState<SessionState>({
    isActive: false,
    currentSection: SECTIONS.INTRODUCTION,
    isSpeaking: false,
    frequency: 0,
    error: null,
    transcription: '',
    lastResponse: '',
  });

  const realtimeAPIRef = useRef<RealtimeAPI | null>(null);
  const vadRef = useRef<VoiceActivityDetector | null>(null);

  // Initialize RealtimeAPI
  const initializeAPI = useCallback(async () => {
    if (!process.env.NEXT_PUBLIC_OPENAI_API_KEY) {
      setState(prev => ({ ...prev, error: 'OpenAI API key not found' }));
      return;
    }

    realtimeAPIRef.current = new RealtimeAPI(
      {
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
        voice: 'alloy',
        modalities: ['text', 'audio'],
      },
      handleMessage,
      handleError
    );

    try {
      await realtimeAPIRef.current.connect();
    } catch (error) {
      handleError(error);
    }
  }, []);

  // Handle messages from RealtimeAPI
  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'conversation.item.input_audio_transcription.completed':
        setState(prev => ({
          ...prev,
          transcription: message.transcript
        }));
        break;

      case 'response.text.delta':
        setState(prev => ({
          ...prev,
          lastResponse: prev.lastResponse + message.delta
        }));
        break;

      case 'input_audio_buffer.speech_started':
        setState(prev => ({ ...prev, isSpeaking: true }));
        break;

      case 'input_audio_buffer.speech_stopped':
        setState(prev => ({ ...prev, isSpeaking: false }));
        break;

      // Handle frequency data for animations
      case 'response.audio.delta':
        const frequency = calculateFrequency(message.delta);
        setState(prev => ({ ...prev, frequency }));
        options.onFrequencyChange?.(frequency);
        break;
    }
  }, [options]);

  // Handle errors
  const handleError = useCallback((error: any) => {
    const errorMessage = error?.message || 'An unknown error occurred';
    setState(prev => ({ ...prev, error: errorMessage }));
    options.onError?.(errorMessage);
  }, [options]);

  // Calculate frequency from audio data for animations
  const calculateFrequency = (audioData: string): number => {
    // Convert base64 audio to array buffer
    const buffer = Buffer.from(audioData, 'base64');
    const array = new Float32Array(buffer.buffer);
    
    // Calculate RMS to get rough frequency measure
    const rms = Math.sqrt(array.reduce((acc, val) => acc + val * val, 0) / array.length);
    return Math.min(Math.floor(rms * 100), 100);
  };

  // Start session
  const startSession = useCallback(async () => {
    try {
      await initializeAPI();

      vadRef.current = new VoiceActivityDetector({
        onSpeechStart: () => {
          setState(prev => ({ ...prev, isSpeaking: true }));
        },
        onSpeechEnd: () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
        },
        onVADMissingError: () => {
          handleError(new Error('Voice detection not available'));
        },
      });

      await vadRef.current.start();
      realtimeAPIRef.current?.startSession();
      setState(prev => ({ ...prev, isActive: true, error: null }));
    } catch (error) {
      handleError(error);
    }
  }, [initializeAPI, handleError]);

  // End session
  const endSession = useCallback(() => {
    vadRef.current?.stop();
    realtimeAPIRef.current?.disconnect();
    setState(prev => ({
      ...prev,
      isActive: false,
      isSpeaking: false,
      frequency: 0,
      transcription: '',
      lastResponse: '',
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      endSession();
    };
  }, [endSession]);

  // Listen for processed audio from VAD
  useEffect(() => {
    const handleProcessedAudio = (event: CustomEvent<{ buffer: ArrayBuffer }>) => {
      realtimeAPIRef.current?.sendAudioChunk(event.detail.buffer);
    };

    window.addEventListener('processedAudio', handleProcessedAudio as EventListener);

    return () => {
      window.removeEventListener('processedAudio', handleProcessedAudio as EventListener);
    };
  }, []);

  return {
    ...state,
    startSession,
    endSession,
    SECTIONS,
  };
};
