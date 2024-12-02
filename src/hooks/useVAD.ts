import { useState, useEffect, useCallback, useRef } from 'react';
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection';
import { SESSION_CONFIG } from '@/constants/config';

interface UseVADOptions {
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (error: Error) => void;
  onAudioData?: (buffer: ArrayBuffer) => void;
  threshold?: number;
  silenceDuration?: number;
}

interface VADState {
  isListening: boolean;
  isSpeaking: boolean;
  error: string | null;
  audioLevel: number;
}

export function useVAD(options: UseVADOptions = {}) {
  const [state, setState] = useState<VADState>({
    isListening: false,
    isSpeaking: false,
    error: null,
    audioLevel: 0,
  });

  const vadRef = useRef<VoiceActivityDetector | null>(null);

  // Initialize VAD with options
  const initializeVAD = useCallback(async () => {
    try {
      vadRef.current = new VoiceActivityDetector({
        onSpeechStart: () => {
          setState(prev => ({ ...prev, isSpeaking: true }));
          options.onSpeechStart?.();
        },
        onSpeechEnd: () => {
          setState(prev => ({ ...prev, isSpeaking: false }));
          options.onSpeechEnd?.();
        },
        onVADMissingError: () => {
          const error = new Error(SESSION_CONFIG.ERRORS.VAD_NOT_AVAILABLE);
          handleError(error);
        },
        threshold: options.threshold || SESSION_CONFIG.DEFAULT_VAD_THRESHOLD,
        silenceDuration: options.silenceDuration || SESSION_CONFIG.DEFAULT_SILENCE_DURATION,
      });

      // Set up audio data event listener
      window.addEventListener('processedAudio', handleProcessedAudio as EventListener);

      return true;
    } catch (error) {
      handleError(error as Error);
      return false;
    }
  }, [options]);

  // Start listening
  const startListening = useCallback(async () => {
    try {
      if (!vadRef.current) {
        const initialized = await initializeVAD();
        if (!initialized) return;
      }

      await vadRef.current?.start();
      setState(prev => ({ ...prev, isListening: true, error: null }));
    } catch (error) {
      handleError(error as Error);
    }
  }, [initializeVAD]);

  // Stop listening
  const stopListening = useCallback(() => {
    vadRef.current?.stop();
    setState(prev => ({
      ...prev,
      isListening: false,
      isSpeaking: false,
      audioLevel: 0,
    }));
  }, []);

  // Handle processed audio data
  const handleProcessedAudio = useCallback((event: CustomEvent<{ buffer: ArrayBuffer }>) => {
    // Calculate audio level for visualization
    const buffer = event.detail.buffer;
    const view = new Float32Array(buffer);
    const rms = Math.sqrt(
      view.reduce((acc, val) => acc + val * val, 0) / view.length
    );
    const normalizedLevel = Math.min(Math.floor(rms * 100), 100);

    setState(prev => ({ ...prev, audioLevel: normalizedLevel }));
    options.onAudioData?.(buffer);
  }, [options]);

  // Error handling
  const handleError = useCallback((error: Error) => {
    setState(prev => ({ ...prev, error: error.message }));
    options.onError?.(error);
  }, [options]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopListening();
      window.removeEventListener('processedAudio', handleProcessedAudio as EventListener);
    };
  }, [stopListening, handleProcessedAudio]);

  // Pause/resume methods
  const pause = useCallback(() => {
    if (vadRef.current && state.isListening) {
      vadRef.current.stop();
      setState(prev => ({ ...prev, isListening: false }));
    }
  }, [state.isListening]);

  const resume = useCallback(() => {
    if (vadRef.current && !state.isListening) {
      vadRef.current.start();
      setState(prev => ({ ...prev, isListening: true }));
    }
  }, [state.isListening]);

  // Reset error state
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    startListening,
    stopListening,
    pause,
    resume,
    clearError,
  };
}
