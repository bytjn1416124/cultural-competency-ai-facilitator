export interface SessionState {
  isActive: boolean;
  currentSection: string;
  currentExercise: string;
  currentStep: number;
  isSpeaking: boolean;
  isListening: boolean;
  isPaused: boolean;
  error: string | null;
  lastResponse: string;
  transcription: string;
  frequency: number;
}

export interface SessionControls {
  startSession: () => void;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  updateFrequency: (frequency: number) => void;
  setSpeaking: (speaking: boolean) => void;
  setListening: (listening: boolean) => void;
  setError: (error: string) => void;
  clearError: () => void;
}

export interface SessionConfig {
  apiKey: string;
  voice: string;
  vadThreshold: number;
  silenceDuration: number;
  maxSessionDuration: number;
  breakDuration: number;
}

export interface SessionProgress {
  totalSections: number;
  currentSectionIndex: number;
  totalExercisesInSection: number;
  currentExerciseIndex: number;
  totalStepsInExercise: number;
  currentStepIndex: number;
  timeElapsed: number;
  timeRemaining: number;
}
