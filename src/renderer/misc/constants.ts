let localEndpoint = 'http://localhost:8081';
let publicEndpoint = 'https://visual-backend-tsne2r6uva-nw.a.run.app';

export const endpoint = publicEndpoint;

export const accessTokenKey = 'access_token';
export const refreshTokenKey = 'refresh_token';
export const curProjectKey = 'cur_project_key';

export const electronStoreKeys = {
  openWithVsKey: 'open_with_vs',
  editorToUseKey: 'editor_to_use',
};
export const nodeTypeKey = 'node_type';

export const projWindowSizeNoVs = {
  width: 800,
  height: 700,
};

export const projWindowSizeVs = {
  width: 480,
  height: 650,
};

export const homeWindowSize = {
  width: 600,
  height: 550,
};

export const serverLocation = 'europe-west2';

export const envConsts: {
  [key: string]: string;
} = {
  SUPABASE_PROJECT_URL: 'SUPABASE_PROJECT_URL',
  SUPABASE_SERVICE_KEY: 'SUPABASE_SERVICE_KEY',
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
