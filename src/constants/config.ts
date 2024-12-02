export const SESSION_CONFIG = {
  // WebSocket Configuration
  WEBSOCKET: {
    URL: 'wss://api.openai.com/v1/audio/realtime',
    RECONNECT_ATTEMPTS: 3,
    RECONNECT_DELAY: 1000,
    PING_INTERVAL: 30000,
    CONNECTION_TIMEOUT: 5000
  },

  // Voice Activity Detection
  VAD: {
    DEFAULT_THRESHOLD: 0.2,
    DEFAULT_SILENCE_DURATION: 500,
    MIN_SILENCE_DURATION: 200,
    MAX_SILENCE_DURATION: 2000,
    PREFIX_PADDING: 300,
    SPEECH_END_DELAY: 1000,
    ENERGY_THRESHOLD: 0.01,
    INTERRUPTION_THRESHOLD: 300
  },

  // Audio Processing
  AUDIO: {
    CHUNK_SIZE: 4096,
    SAMPLE_RATE: 16000,
    PROCESSING_INTERVAL: 50,
    CHANNELS: 1,
    BIT_DEPTH: 16,
    FORMAT: 'pcm16',
    MAX_BUFFER_SIZE: 1024 * 1024 // 1MB
  },

  // Animation Settings
  ANIMATION: {
    GRADIENT: {
      MIN_FREQUENCY: 0,
      MAX_FREQUENCY: 100,
      BASE_SIZE: 300,
      MIN_PULSE_SPEED: 0.5,
      MAX_PULSE_SPEED: 3,
      RAINBOW_DURATION: 8000
    },
    VERTEX: {
      POINTS: 1000,
      CONNECTIONS: 2000,
      MIN_DISTANCE: 20,
      MAX_DISTANCE: 100,
      ANIMATION_SPEED: 0.001
    },
    STRAWBERRY: {
      BASE_SIZE: 200,
      MIN_HEIGHT: 0.6,
      MAX_HEIGHT: 1.2,
      BLINK_INTERVAL: 4000,
      EXPRESSION_CHANGE_SPEED: 0.3
    }
  },

  // Session Management
  SESSION: {
    MAX_DURATION: 14400000, // 4 hours
    BREAK_DURATION: 900000,  // 15 minutes
    INACTIVITY_TIMEOUT: 300000, // 5 minutes
    AUTO_SAVE_INTERVAL: 60000, // 1 minute
    MAX_RETRY_ATTEMPTS: 3
  },

  // AI Response Settings
  AI: {
    DEFAULT_VOICE: 'alloy',
    AVAILABLE_VOICES: [
      { id: 'alloy', name: 'Alloy', description: 'Versatile, general-purpose voice' },
      { id: 'echo', name: 'Echo', description: 'Warm, measured voice' },
      { id: 'fable', name: 'Fable', description: 'British accent, authoritative' },
      { id: 'onyx', name: 'Onyx', description: 'Deep, resonant voice' },
      { id: 'nova', name: 'Nova', description: 'Energetic, professional voice' },
      { id: 'shimmer', name: 'Shimmer', description: 'Clear, friendly voice' }
    ],
    TEMPERATURE: 0.7,
    MAX_TOKENS: 150,
    RESPONSE_TIMEOUT: 10000,
    INTERRUPTION_HANDLING: {
      MIN_PAUSE: 200,
      RESUME_DELAY: 500,
      MAX_RETRIES: 3
    }
  },

  // Debug and Development
  DEBUG: {
    ENABLED: process.env.NODE_ENV === 'development',
    LOG_LEVELS: {
      ERROR: true,
      WARN: true,
      INFO: true,
      DEBUG: process.env.NODE_ENV === 'development',
      VERBOSE: false
    },
    PERFORMANCE_MONITORING: {
      ENABLED: true,
      SAMPLE_RATE: 0.1,
      MAX_EVENTS: 1000
    },
    SHOW_VAD_METRICS: false,
    SHOW_AUDIO_WAVEFORM: false,
    SAVE_CONVERSATION_HISTORY: true
  },

  // Cultural Competency Script Settings
  SCRIPT: {
    SECTIONS: {
      INTRODUCTION: {
        id: 'introduction',
        duration: 1800000, // 30 minutes
        required: true,
        allowSkip: false
      },
      UNDERSTANDING_POPULATION: {
        id: 'understanding_population',
        duration: 5400000, // 90 minutes
        required: true,
        allowSkip: false
      },
      ASSESSING_SERVICE: {
        id: 'assessing_service',
        duration: 5400000, // 90 minutes
        required: true,
        allowSkip: false
      },
      ENHANCING_COMPETENCE: {
        id: 'enhancing_competence',
        duration: 5400000, // 90 minutes
        required: true,
        allowSkip: false
      },
      IMPROVING_ACCESS: {
        id: 'improving_access',
        duration: 5400000, // 90 minutes
        required: true,
        allowSkip: false
      },
      MONITORING: {
        id: 'monitoring',
        duration: 3600000, // 60 minutes
        required: true,
        allowSkip: false
      },
      WORKFORCE_DEVELOPMENT: {
        id: 'workforce_development',
        duration: 3600000, // 60 minutes
        required: true,
        allowSkip: false
      },
      ACTION_PLANNING: {
        id: 'action_planning',
        duration: 1800000, // 30 minutes
        required: true,
        allowSkip: false
      }
    },
    PROGRESS_TRACKING: {
      SAVE_INTERVAL: 60000, // 1 minute
      MIN_COMPLETION_THRESHOLD: 0.8, // 80% completion required
      ALLOW_PARTIAL_COMPLETION: false
    }
  }
} as const;

// Export helper functions
export const getVoiceById = (id: string) => {
  return SESSION_CONFIG.AI.AVAILABLE_VOICES.find(voice => voice.id === id);
};

export const getTotalSessionDuration = () => {
  return Object.values(SESSION_CONFIG.SCRIPT.SECTIONS).reduce(
    (total, section) => total + section.duration,
    0
  );
};

export const isDebugEnabled = () => {
  return SESSION_CONFIG.DEBUG.ENABLED && SESSION_CONFIG.DEBUG.LOG_LEVELS.DEBUG;
};
