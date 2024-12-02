import { getEnvVar } from '@/types/env';

// Session Configuration
export const SESSION_CONFIG = {
  // Default timeouts and durations (in milliseconds)
  DEFAULT_VAD_THRESHOLD: 0.2,
  DEFAULT_SILENCE_DURATION: 500,
  MIN_SILENCE_DURATION: 200,
  MAX_SILENCE_DURATION: 2000,
  SPEECH_TIMEOUT: 30000, // 30 seconds
  RESPONSE_TIMEOUT: 60000, // 60 seconds
  DEFAULT_BREAK_DURATION: 900000, // 15 minutes

  // Audio Configuration
  AUDIO: {
    SAMPLE_RATE: 16000,
    CHANNELS: 1,
    BITS_PER_SAMPLE: 16,
    INPUT_FORMAT: 'pcm16' as const,
    OUTPUT_FORMAT: 'pcm16' as const,
  },

  // WebSocket Configuration
  WEBSOCKET: {
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 1000,
    PING_INTERVAL: 30000,
    CLOSE_TIMEOUT: 5000,
  },

  // Animation Configuration
  ANIMATION: {
    MIN_FREQUENCY: 0,
    MAX_FREQUENCY: 100,
    DEFAULT_SIZE: 300,
    MIN_PULSE_SPEED: 0.5,
    MAX_PULSE_SPEED: 3,
  },

  // Session Sections
  SECTIONS: {
    INTRODUCTION: {
      id: 'introduction',
      title: 'Introduction',
      duration: 1800000, // 30 minutes
    },
    UNDERSTANDING_POPULATION: {
      id: 'understanding_population',
      title: 'Understanding Our Hospital Population',
      duration: 5400000, // 90 minutes
    },
    ASSESSING_SERVICE: {
      id: 'assessing_service',
      title: 'Assessing Current Service Delivery',
      duration: 5400000, // 90 minutes
    },
    ENHANCING_COMPETENCE: {
      id: 'enhancing_competence',
      title: 'Enhancing Cultural Competence in Practice',
      duration: 5400000, // 90 minutes
    },
    IMPROVING_ACCESS: {
      id: 'improving_access',
      title: 'Improving Access and Engagement',
      duration: 5400000, // 90 minutes
    },
    MONITORING: {
      id: 'monitoring',
      title: 'Monitoring and Evaluation',
      duration: 3600000, // 60 minutes
    },
    WORKFORCE_DEVELOPMENT: {
      id: 'workforce_development',
      title: 'Workforce Development',
      duration: 3600000, // 60 minutes
    },
    ACTION_PLANNING: {
      id: 'action_planning',
      title: 'Action Planning and Next Steps',
      duration: 1800000, // 30 minutes
    },
  },

  // Voice Configuration
  VOICE_OPTIONS: [
    { id: 'alloy', name: 'Alloy', description: 'Versatile, general-purpose voice' },
    { id: 'echo', name: 'Echo', description: 'Warm, measured voice' },
    { id: 'fable', name: 'Fable', description: 'British accent, authoritative' },
    { id: 'onyx', name: 'Onyx', description: 'Deep, resonant voice' },
    { id: 'nova', name: 'Nova', description: 'Energetic, professional voice' },
    { id: 'shimmer', name: 'Shimmer', description: 'Clear, friendly voice' },
  ],

  // Error Messages
  ERRORS: {
    VAD_NOT_AVAILABLE: 'Voice detection is not available in your browser',
    WEBSOCKET_CONNECTION: 'Failed to connect to OpenAI Realtime API',
    SESSION_TIMEOUT: 'Session timed out due to inactivity',
    AUDIO_PERMISSION: 'Microphone access is required for this session',
    API_KEY_MISSING: 'OpenAI API key is not configured',
  },

  // Default System Instructions
  DEFAULT_INSTRUCTIONS: `
    You are a cultural competency facilitator leading an interactive session.
    Follow these guidelines:
    1. Guide participants through the cultural competency workbook sections
    2. Ask open-ended questions to encourage discussion
    3. Listen actively and provide constructive feedback
    4. Maintain a respectful and inclusive environment
    5. Adapt your pace based on participant responses
    6. Use clear, concise language
    Your goal is to help participants develop cultural awareness and competency skills.
  `.trim(),

  // Runtime Configuration
  getRuntimeConfig: () => ({
    apiKey: getEnvVar.asString('NEXT_PUBLIC_OPENAI_API_KEY'),
    voice: getEnvVar.asVoice('NEXT_PUBLIC_DEFAULT_VOICE'),
    vadThreshold: getEnvVar.asNumber('NEXT_PUBLIC_VAD_THRESHOLD'),
    silenceDuration: getEnvVar.asNumber('NEXT_PUBLIC_VAD_SILENCE_DURATION'),
    maxSessionDuration: getEnvVar.asNumber('NEXT_PUBLIC_MAX_SESSION_DURATION'),
    breakDuration: getEnvVar.asNumber('NEXT_PUBLIC_DEFAULT_BREAK_DURATION'),
    debugMode: getEnvVar.asBoolean('NEXT_PUBLIC_DEBUG_MODE'),
  }),
};
