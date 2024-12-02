"use client";

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
    case 'SET_FREQUENCY':
      return { ...state, frequency: action.payload };
    default:
      return state;
  }
}

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(sessionReducer, initialState);
  
  const startSession = useCallback(() => {
    dispatch({ type: 'START_SESSION' });
  }, []);

  const endSession = useCallback(() => {
    dispatch({ type: 'END_SESSION' });
  }, []);

  const contextValue: SessionContextType = {
    state,
    controls: {
      startSession,
      endSession,
      pauseSession: () => dispatch({ type: 'PAUSE_SESSION' }),
      resumeSession: () => dispatch({ type: 'RESUME_SESSION' }),
      moveToNextStep: () => {},  // Implement these as needed
      moveToNextExercise: () => {},
      moveToNextSection: () => {},
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
      apiKey: getEnvVar.asString('NEXT_PUBLIC_OPENAI_API_KEY'),
      voice: 'alloy',
      vadThreshold: 0.2,
      silenceDuration: 500,
      maxSessionDuration: 14400000, // 4 hours
      breakDuration: 900000, // 15 minutes
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
