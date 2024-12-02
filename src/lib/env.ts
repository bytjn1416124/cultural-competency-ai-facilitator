export const getEnvVar = {
  asString: (key: string): string => {
    const value = process.env[key];
    if (!value) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value;
  },

  asNumber: (key: string): number => {
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

  asBoolean: (key: string): boolean => {
    const value = process.env[key]?.toLowerCase();
    if (value === undefined) {
      throw new Error(`Environment variable ${key} is not defined`);
    }
    return value === 'true' || value === '1';
  }
};
