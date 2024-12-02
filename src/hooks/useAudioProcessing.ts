import { useState, useEffect, useCallback } from 'react';
import { useSession } from '@/contexts/SessionContext';

interface AudioProcessingConfig {
  onSpeechDetected?: () => void;
  onSpeechEnded?: () => void;
  onError?: (error: Error) => void;
}

export const useAudioProcessing = (config: AudioProcessingConfig = {}) => {
  const { state, controls } = useSession();
  const [isProcessing, setIsProcessing] = useState(false);
  const [audioContext, setAudioContext] = useState<AudioContext | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Start audio processing
  const startProcessing = useCallback(async () => {
    try {
      // Check if the browser supports AudioContext
      if (typeof window === 'undefined' || !window.AudioContext) {
        throw new Error('AudioContext is not supported in this browser');
      }

      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Create audio context
      const context = new AudioContext();
      setAudioContext(context);

      // Create analyzer node
      const analyzer = context.createAnalyser();
      analyzer.fftSize = 2048;

      // Create source from microphone
      const source = context.createMediaStreamSource(stream);
      source.connect(analyzer);

      // Start processing
      setIsProcessing(true);
      setError(null);

      // Setup audio processing loop
      const bufferLength = analyzer.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const processAudio = () => {
        if (!isProcessing) return;

        analyzer.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((acc, value) => acc + value, 0) / bufferLength;
        const frequency = Math.min(100, (average / 255) * 100);

        // Update frequency in session state
        controls.updateFrequency(frequency);

        requestAnimationFrame(processAudio);
      };

      processAudio();

      // Listen for spacebar
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.code === 'Space' && !e.repeat && isProcessing) {
          e.preventDefault();
          config.onSpeechDetected?.();
        }
      };

      const handleKeyUp = (e: KeyboardEvent) => {
        if (e.code === 'Space' && isProcessing) {
          e.preventDefault();
          config.onSpeechEnded?.();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('keyup', handleKeyUp);

      return () => {
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('keyup', handleKeyUp);
      };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start audio processing';
      setError(errorMessage);
      config.onError?.(new Error(errorMessage));
      throw err;
    }
  }, [config, isProcessing, controls]);

  // Stop audio processing
  const stopProcessing = useCallback(() => {
    setIsProcessing(false);
    if (audioContext?.state !== 'closed') {
      audioContext?.close();
    }
    setAudioContext(null);
  }, [audioContext]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopProcessing();
    };
  }, [stopProcessing]);

  return {
    isProcessing,
    error,
    startProcessing,
    stopProcessing,
  };
};
