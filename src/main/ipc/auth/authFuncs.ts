import { accessTokenKey, refreshTokenKey } from '@/renderer/misc/constants';
import Store from 'electron-store';

export const setAuthTokensFunc = (data: any) => {
  const { accessToken, refreshToken } = data;
  let s = new Store();
  s.set(accessTokenKey, accessToken);
  s.set(refreshTokenKey, refreshToken);
};
export const setAuthTokens = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any,
  g: {
    store: Store;
  }
) => {
  const { accessToken, refreshToken } = payload;
  g.store.set(accessTokenKey, accessToken);
  g.store.set(refreshTokenKey, refreshToken);
  return true;
};

export const getAccessToken = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any,
  g: {
    store: Store;
  }
) => {
  let accessToken = g.store.get(accessTokenKey);
  return accessToken;
};

export const getRefreshToken = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let s = new Store();
  return s.get(refreshTokenKey);
};

export const deleteTokens = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let s = new Store();
  s.delete(refreshTokenKey);
  s.delete(accessTokenKey);
  return true;
};
