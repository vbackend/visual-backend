import { nodeTypeKey } from '@/renderer/misc/constants';
import Store from 'electron-store';

export const getDeviceType = (e: Electron.IpcMainInvokeEvent, payload: any) => {
  return process.platform;
};

export const getNodeType = async (e: Electron.IpcMainInvokeEvent) => {
  let s = new Store();
  let nodeType = s.get(nodeTypeKey);

  return nodeType;
};
