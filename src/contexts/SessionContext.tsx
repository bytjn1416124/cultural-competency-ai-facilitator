import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { SessionState, SessionControls, SessionConfig, SessionProgress } from '@/types/session';
import { ScriptManager } from '@/utils/scriptManager';
import { RealtimeAPI } from '@/utils/realtimeAPI';
import { VoiceActivityDetector } from '@/utils/voiceActivityDetection';
import { getEnvVar } from '@/types/env';

interface SessionContextType {
  state: SessionState;
  controls: SessionControls;
  progress: SessionProgress;
  config: SessionConfig;
}

type SessionAction =
  | { type: 'START_SESSION' }
  | { type: 'END_SESSION' }
  | { type: 'PAUSE_SESSION' }
  | { type: 'RESUME_SESSION' }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' }
  | { type: 'SET_SPEAKING'; payload: boolean }
  | { type: 'SET_LISTENING'; payload: boolean }
  | { type: 'SET_FREQUENCY'; payload: number }
  | { type: 'SET_TRANSCRIPTION'; payload: string }
  | { type: 'SET_RESPONSE'; payload: string }
  | { type: 'UPDATE_PROGRESS'; payload: Partial<SessionProgress> };

const initialState: SessionState = {
  isActive: false,
  currentSection: '',
  currentExercise: '',
  currentStep: 0,
  isSpeaking: false,
  isListening: false,
  isPaused: false,
  error: null,
  lastResponse: '',
  transcription: '',
  frequency: 0,
};

const initialProgress: SessionProgress = {
  totalSections: 0,
  currentSectionIndex: 0,
  totalExercisesInSection: 0,
  currentExerciseIndex: 0,
  totalStepsInExercise: 0,
  currentStepIndex: 0,
  timeElapsed: 0,
  timeRemaining: 0,
};

const SessionContext = createContext<SessionContextType | null>(null);

function sessionReducer(state: SessionState, action: SessionAction): SessionState {
  switch (action.type) {
    case 'START_SESSION':
      return { ...state, isActive: true, error: null };
    case 'END_SESSION':
      return { ...initialState };
    case 'PAUSE_SESSION':
      return { ...state, isPaused: true };
    case 'RESUME_SESSION':
      return { ...state, isPaused: false };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'SET_SPEAKING':
      return { ...state, isSpeaking: action.payload };
    case 'SET_LISTENING':
      return { ...state, isListening: action.payload };
    case 'SET_FREQUENCY':
      return { ...state, frequency: action.payload };
    case 'SET_TRANSCRIPTION':
      return { ...state, transcription: action.payload };
    case 'SET_RESPONSE':
      return { ...state, lastResponse: action.payload };
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  const [progress, setProgress] = React.useState<SessionProgress>(initialProgress);
  
  const scriptManager = React.useRef(new ScriptManager());
  const realtimeAPI = React.useRef<RealtimeAPI | null>(null);
  const vad = React.useRef<VoiceActivityDetector | null>(null);

  const config: SessionConfig = {
    apiKey: getEnvVar.asString('NEXT_PUBLIC_OPENAI_API_KEY'),
    voice: getEnvVar.asVoice('NEXT_PUBLIC_DEFAULT_VOICE'),
    vadThreshold: getEnvVar.asNumber('NEXT_PUBLIC_VAD_THRESHOLD'),
    silenceDuration: getEnvVar.asNumber('NEXT_PUBLIC_VAD_SILENCE_DURATION'),
    maxSessionDuration: getEnvVar.asNumber('NEXT_PUBLIC_MAX_SESSION_DURATION'),
    breakDuration: getEnvVar.asNumber('NEXT_PUBLIC_DEFAULT_BREAK_DURATION'),
  };

  const startSession = useCallback(async () => {
    try {
      // Initialize RealtimeAPI
      realtimeAPI.current = new RealtimeAPI(
        {
          apiKey: config.apiKey,
          voice: config.voice,
          modalities: ['text', 'audio'],
        },
        handleMessage,
        handleError
      );

      // Initialize VAD
      vad.current = new VoiceActivityDetector({
        onSpeechStart: () => dispatch({ type: 'SET_SPEAKING', payload: true }),
        onSpeechEnd: () => dispatch({ type: 'SET_SPEAKING', payload: false }),
        onVADMissingError: () => handleError(new Error('Voice detection not available')),
        threshold: config.vadThreshold,
        silenceDuration: config.silenceDuration,
      });

      await vad.current.start();
      await realtimeAPI.current.connect();
      realtimeAPI.current.startSession();

      dispatch({ type: 'START_SESSION' });
      scriptManager.current.reset();
      updateProgress();
    } catch (error) {
      handleError(error);
    }
  }, [config]);

  const endSession = useCallback(() => {
    vad.current?.stop();
    realtimeAPI.current?.disconnect();
    dispatch({ type: 'END_SESSION' });
  }, []);

  const handleMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'conversation.item.input_audio_transcription.completed':
        dispatch({ type: 'SET_TRANSCRIPTION', payload: message.transcript });
        break;
      case 'response.text.delta':
        dispatch({ type: 'SET_RESPONSE', payload: message.delta });
        break;
      case 'response.audio.delta':
        const frequency = calculateFrequency(message.delta);
        dispatch({ type: 'SET_FREQUENCY', payload: frequency });
        break;
    }
  }, []);

  const handleError = useCallback((error: Error) => {
    dispatch({ type: 'SET_ERROR', payload: error.message });
  }, []);

  const calculateFrequency = (audioData: string): number => {
    const buffer = Buffer.from(audioData, 'base64');
    const array = new Float32Array(buffer.buffer);
    const rms = Math.sqrt(array.reduce((acc, val) => acc + val * val, 0) / array.length);
    return Math.min(Math.floor(rms * 100), 100);
  };

  const updateProgress = useCallback(() => {
    const newProgress = scriptManager.current.getProgress();
    setProgress(prev => ({ ...prev, ...newProgress }));
  }, []);

  const contextValue: SessionContextType = {
    state,
    progress,
    config,
    controls: {
      startSession,
      endSession,
      pauseSession: () => dispatch({ type: 'PAUSE_SESSION' }),
      resumeSession: () => dispatch({ type: 'RESUME_SESSION' }),
      moveToNextStep: () => {
        scriptManager.current.moveToNextStep();
        updateProgress();
      },
      moveToNextExercise: () => {
        scriptManager.current.moveToNextExercise();
        updateProgress();
      },
      moveToNextSection: () => {
        scriptManager.current.moveToNextSection();
        updateProgress();
      },
    },
  };

  return (
    <SessionContext.Provider value={contextValue}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
