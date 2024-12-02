declare namespace NodeJS {
  interface ProcessEnv {
    // API Configuration
    readonly NEXT_PUBLIC_OPENAI_API_KEY: string;

    // Voice Configuration
    readonly NEXT_PUBLIC_DEFAULT_VOICE: 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';

    // WebSocket Configuration
    readonly NEXT_PUBLIC_WEBSOCKET_URL: string;

    // VAD (Voice Activity Detection) Configuration
    readonly NEXT_PUBLIC_VAD_THRESHOLD: string; // Will be parsed as number
    readonly NEXT_PUBLIC_VAD_SILENCE_DURATION: string; // Will be parsed as number

    // Session Configuration
    readonly NEXT_PUBLIC_MAX_SESSION_DURATION: string; // Will be parsed as number (minutes)
    readonly NEXT_PUBLIC_DEFAULT_BREAK_DURATION: string; // Will be parsed as number (minutes)

    // Debug Mode
    readonly NEXT_PUBLIC_DEBUG_MODE: string; // Will be parsed as boolean
  }
}

// Helper functions for type-safe environment variable access
export const getEnvVar = {
  asString: (key: keyof NodeJS.ProcessEnv): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  },

  asNumber: (key: keyof NodeJS.ProcessEnv): number => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    const num = Number(value);
    if (isNaN(num)) {
      throw new Error(`Environment variable ${key} is not a valid number`);
    }
    return num;
  },

  asBoolean: (key: keyof NodeJS.ProcessEnv): boolean => {
    const value = process.env[key]?.toLowerCase();
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value === 'true' || value === '1' || value === 'yes';
  },

  asVoice: (key: keyof NodeJS.ProcessEnv): 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer' => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    const validVoices = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'];
    if (!validVoices.includes(value)) {
      throw new Error(`Environment variable ${key} must be one of: ${validVoices.join(', ')}`);
    }
    return value as 'alloy' | 'echo' | 'fable' | 'onyx' | 'nova' | 'shimmer';
  },
};

// Configuration validation function
export const validateEnvVars = (): void => {
  try {
    // Required variables
    getEnvVar.asString('NEXT_PUBLIC_OPENAI_API_KEY');
    getEnvVar.asString('NEXT_PUBLIC_WEBSOCKET_URL');

    // Optional variables with defaults
    try {
      getEnvVar.asVoice('NEXT_PUBLIC_DEFAULT_VOICE');
    } catch {
      console.warn('Using default voice: alloy');
    }

    try {
      getEnvVar.asNumber('NEXT_PUBLIC_VAD_THRESHOLD');
    } catch {
      console.warn('Using default VAD threshold: 0.2');
    }

    try {
      getEnvVar.asNumber('NEXT_PUBLIC_VAD_SILENCE_DURATION');
    } catch {
      console.warn('Using default silence duration: 500ms');
    }

    try {
      getEnvVar.asNumber('NEXT_PUBLIC_MAX_SESSION_DURATION');
    } catch {
      console.warn('Using default max session duration: 240 minutes');
    }

    try {
      getEnvVar.asNumber('NEXT_PUBLIC_DEFAULT_BREAK_DURATION');
    } catch {
      console.warn('Using default break duration: 15 minutes');
    }

    try {
      getEnvVar.asBoolean('NEXT_PUBLIC_DEBUG_MODE');
    } catch {
      console.warn('Debug mode disabled by default');
    }

  } catch (error) {
    throw new Error(`Environment validation failed: ${error.message}`);
  }
};
