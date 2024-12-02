import { useEffect, useRef, useState } from 'react';
import { AudioProcessor } from '@/utils/audioProcessor';
import { SESSION_CONFIG } from '@/constants/config';

interface AudioProcessingState {
  isInitialized: boolean;
  isProcessing: boolean;
  currentEnergy: number;
  speechProbability: number;
  error: Error | null;
}

interface AudioProcessingConfig {
  onAudioData?: (buffer: Float32Array) => void;
  onSpeechDetected?: () => void;
  onSpeechEnded?: () => void;
  onError?: (error: Error) => void;
}

export const useAudioProcessing = (config: AudioProcessingConfig = {}) => {
  const [state, setState] = useState<AudioProcessingState>({
    isInitialized: false,
    isProcessing: false,
    currentEnergy: 0,
    speechProbability: 0,
    error: null
  });

  const processorRef = useRef<AudioProcessor | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const initializeProcessor = async () => {
      try {
        const processor = new AudioProcessor({
          onAudioData: handleAudioData,
          onEnergyChange: handleEnergyChange,
          onSpeechProbability: handleSpeechProbability,
          onError: handleError
        });

        await processor.initialize();
        processorRef.current = processor;

        setState(prev => ({
          ...prev,
          isInitialized: true,
          error: null
        }));
      } catch (error) {
        handleError(error as Error);
      }
    };

    initializeProcessor();

    return () => {
      cleanup();
    };
  }, []);

  const handleAudioData = (buffer: Float32Array) => {
    config.onAudioData?.(buffer);
  };

  const handleEnergyChange = (energy: number) => {
    setState(prev => ({
      ...prev,
      currentEnergy: energy
    }));
  };

  const handleSpeechProbability = (probability: number) => {
    setState(prev => ({
      ...prev,
      speechProbability: probability
    }));

    // Handle speech detection
    if (probability > SESSION_CONFIG.VAD.DEFAULT_THRESHOLD) {
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      config.onSpeechDetected?.();
    } else {
      // Set timeout for speech end
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
      speechTimeoutRef.current = setTimeout(() => {
        config.onSpeechEnded?.();
      }, SESSION_CONFIG.VAD.DEFAULT_SILENCE_DURATION);
    }
  };

  const handleError = (error: Error) => {
    setState(prev => ({
      ...prev,
      error,
      isInitialized: false
    }));
    config.onError?.(error);
  };

  const startProcessing = async () => {
    if (!processorRef.current) {
      await initializeProcessor();
    }

    processorRef.current?.start();
    setState(prev => ({
      ...prev,
      isProcessing: true
    }));
  };

  const stopProcessing = () => {
    processorRef.current?.stop();
    setState(prev => ({
      ...prev,
      isProcessing: false
    }));
  };

  const cleanup = () => {
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    processorRef.current?.cleanup();
    processorRef.current = null;
  };

  const initializeProcessor = async () => {
    const processor = new AudioProcessor({
      onAudioData: handleAudioData,
      onEnergyChange: handleEnergyChange,
      onSpeechProbability: handleSpeechProbability,
      onError: handleError
    });

    await processor.initialize();
    processorRef.current = processor;

    setState(prev => ({
      ...prev,
      isInitialized: true,
      error: null
    }));
  };

  return {
    ...state,
    startProcessing,
    stopProcessing,
    cleanup
  };
};
