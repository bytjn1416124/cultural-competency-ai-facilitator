"use client";

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import type { SessionState, SessionControls, SessionConfig, SessionProgress } from '@/types/session';

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
  | { type: 'UPDATE_FREQUENCY'; payload: number }
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
    case 'UPDATE_FREQUENCY':
      return { ...state, frequency: action.payload };
    case 'UPDATE_PROGRESS':
      return { ...state, ...action.payload };
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  
  // Core session controls
  const startSession = useCallback(() => {
    dispatch({ type: 'START_SESSION' });
  }, []);

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const pauseSession = useCallback(() => {
    dispatch({ type: 'PAUSE_SESSION' });
  }, []);

  const resumeSession = useCallback(() => {
    dispatch({ type: 'RESUME_SESSION' });
  }, []);

  // Audio and frequency controls
  const updateFrequency = useCallback((frequency: number) => {
    dispatch({ type: 'UPDATE_FREQUENCY', payload: frequency });
  }, []);

  const setSpeaking = useCallback((speaking: boolean) => {
    dispatch({ type: 'SET_SPEAKING', payload: speaking });
  }, []);

  const setListening = useCallback((listening: boolean) => {
    dispatch({ type: 'SET_LISTENING', payload: listening });
  }, []);

  // Error handling
  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Handle keyboard events
  useEffect(() => {
    if (!state.isActive) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !e.repeat) {
        e.preventDefault();
        setSpeaking(true);
        setListening(true);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        setSpeaking(false);
        setListening(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.isActive, setSpeaking, setListening]);

  const contextValue: SessionContextType = {
    state,
    controls: {
      startSession,
      endSession,
      pauseSession,
      resumeSession,
      updateFrequency,
      setSpeaking,
      setListening,
      setError,
      clearError,
    },
    progress: {
      totalSections: 0,
      currentSectionIndex: 0,
      totalExercisesInSection: 0,
      currentExerciseIndex: 0,
      totalStepsInExercise: 0,
      currentStepIndex: 0,
      timeElapsed: 0,
      timeRemaining: 0,
    },
    config: {
      apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY || 'development-key',
      voice: process.env.NEXT_PUBLIC_DEFAULT_VOICE || 'alloy',
      vadThreshold: Number(process.env.NEXT_PUBLIC_VAD_THRESHOLD) || 0.2,
      silenceDuration: Number(process.env.NEXT_PUBLIC_VAD_SILENCE_DURATION) || 500,
      maxSessionDuration: Number(process.env.NEXT_PUBLIC_MAX_SESSION_DURATION) || 14400000,
      breakDuration: Number(process.env.NEXT_PUBLIC_DEFAULT_BREAK_DURATION) || 900000,
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
