// local endpoint: http://localhost:8081
// public endpoint: https://visual-backend-tsne2r6uva-nw.a.run.app
export const endpoint = 'https://visual-backend-tsne2r6uva-nw.a.run.app';

export const accessTokenKey = 'access_token';
export const refreshTokenKey = 'refresh_token';

export const projWindowSize = {
  width: 1000,
  height: 700,
};

export const serverLocation = 'europe-west2';

export const envConsts: {
  [key: string]: string;
} = {
  MONGO_CONN_STRING: 'MONGO_CONN_STRING',
  MONGO_DEFAULT_DB: 'MONGO_DEFAULT_DB',
  JWT_ACCESS_SECRET: 'JWT_ACCESS_SECRET',
  JWT_REFRESH_SECRET: 'JWT_REFRESH_SECRET',
  STRIPE_TEST_KEY: 'STRIPE_TEST_KEY',
  STRIPE_LIVE_KEY: 'STRIPE_LIVE_KEY',
  OPENAI_API_KEY: 'OPENAI_API_KEY',
  RESEND_API_KEY: 'RESEND_API_KEY',
  FIREBASE_CREDENTIALS: 'FIREBASE_CREDENTIALS',
};
