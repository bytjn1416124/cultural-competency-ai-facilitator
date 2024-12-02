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
  moveToNextStep: () => void;
  moveToNextExercise: () => void;
  moveToNextSection: () => void;
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
