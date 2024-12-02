declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_OPENAI_API_KEY: string;
    NODE_ENV: 'development' | 'production' | 'test';
  }
}

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
    return value === 'true' || value === '1';
  }
};
