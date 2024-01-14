import { endpoint } from '@/renderer/misc/constants';
import axios, { AxiosError } from 'axios';

export const isPrivatePath = (url: string) => {
  let parsedUrl = new URL(url);
  let authPath = parsedUrl.pathname.split('/')[1];
  if (authPath == 'auth') return true;
  return false;
};

export const requestInterceptor = async (config: any) => {
  let { url } = config;

  if (!isPrivatePath(url)) return config;

  let access_token = await window.electron.getAccessToken({});
  if (access_token === null || access_token === undefined) {
    return config;
  }

  config.headers.Authorization = `Bearer ${access_token}`;

  return config;
};

export const responseInterceptor = async (error: AxiosError) => {
  const { config, response }: any = error;

  let url = config.url;
  let parsedUrl = new URL(url);

  let refreshCondition =
    isPrivatePath(url) &&
    response.status == 401 &&
    url != `${parsedUrl.origin}/public/auth/refresh_token`;

  if (!refreshCondition) return Promise.reject(error);

  const refreshToken = await window.electron.getRefreshToken({});

  if (refreshToken === null || refreshToken === undefined) {
    return Promise.reject(error);
  }

  try {
    const res = await axios.post(
      `${parsedUrl.origin}/public/auth/refresh_token`,
      {
        refreshToken,
      }
    );
    window.electron.setAuthTokens(res.data);
    return axios(config);
  } catch (error) {
    return Promise.reject(error);
  }
};
