export interface SessionConfig {
  apiKey: string;
  voice: string;
  vadThreshold: number;
  silenceDuration: number;
  maxSessionDuration: number;
  breakDuration: number;
}

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
  startSession: () => Promise<void>;
  endSession: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  moveToNextStep: () => void;
  moveToNextExercise: () => void;
  moveToNextSection: () => void;
}

export interface SessionParticipant {
  id: string;
  name: string;
  role: string;
  interests?: string[];
  hasSpoken?: boolean;
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

export interface SessionResponse {
  type: 'text' | 'audio';
  content: string;
  timestamp: number;
  senderType: 'ai' | 'participant';
  senderId?: string;
}

export interface SessionTranscript {
  id: string;
  responses: SessionResponse[];
  startTime: number;
  endTime?: number;
  participants: SessionParticipant[];
  sections: string[];
}

export interface SessionMetrics {
  participationCount: Record<string, number>;
  averageResponseTime: number;
  totalParticipants: number;
  completedExercises: number;
  totalDuration: number;
  participantFeedback: {
    clarity: number;
    engagement: number;
    usefulness: number;
    pacing: number;
  };
}

export interface SessionEvent {
  type: SessionEventType;
  timestamp: number;
  data?: any;
  participantId?: string;
}

export type SessionEventType =
  | 'session_start'
  | 'session_end'
  | 'section_start'
  | 'section_end'
  | 'exercise_start'
  | 'exercise_end'
  | 'participant_join'
  | 'participant_leave'
  | 'speech_start'
  | 'speech_end'
  | 'response_start'
  | 'response_end'
  | 'error'
  | 'break_start'
  | 'break_end';

export interface SessionAudio {
  sampleRate: number;
  channels: number;
  format: 'pcm16' | 'wav';
  chunk: ArrayBuffer;
}

export interface SessionFeedback {
  participantId: string;
  timestamp: number;
  ratings: {
    clarity: number;
    engagement: number;
    usefulness: number;
    pacing: number;
  };
  comments?: string;
  improvements?: string;
}
