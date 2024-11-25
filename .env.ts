export const ENV = {
  development: {
    API_URL: 'http://localhost:8001/api',
  },
  production: {
    API_URL: 'https://api.yourproduction.com',
  },
} as const;

export type EnvType = keyof typeof ENV;
