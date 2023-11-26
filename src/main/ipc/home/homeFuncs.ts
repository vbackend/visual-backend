import { electronStoreKeys, nodeTypeKey } from '@/renderer/misc/constants';
import { Editor } from '@/renderer/redux/app/appSlice';
import { exec } from 'child_process';
import { BrowserWindow } from 'electron';
import Store from 'electron-store';

export const setWindowSze = (p: any, mainWindow: BrowserWindow) => {
  // mainWindow?.setSize(payload.width, payload.height);
  let { width, height } = p;
  if (process.platform == 'win32') width = width + 15;
  const bounds = mainWindow!.getBounds();

  // Calculate the difference between the new size and the old size
  const widthDiff = width - bounds.width;
  const heightDiff = height - bounds.height;

  // Adjust the position to account for the size difference
  const newBounds = {
    x: bounds.x - Math.floor(widthDiff / 2),
    y: bounds.y - Math.floor(heightDiff / 2),
    width: width,
    height: height,
  };

  // Set the new bounds to the window
  mainWindow!.setBounds(newBounds);
};

export const getDeviceType = (e: Electron.IpcMainInvokeEvent, payload: any) => {
  return process.platform;
};

export const getNodeType = async (e: Electron.IpcMainInvokeEvent) => {
  let s = new Store();
  let nodeType = s.get(nodeTypeKey);

  return nodeType;
};

export const setOpenWithVs = async (
  e: Electron.IpcMainInvokeEvent,
  p: any,
  mainWindow: any
) => {
  let s = new Store();
  let { openWithVs } = p;
  s.set(electronStoreKeys.editorToUseKey, openWithVs);
  return;
};

export const getOpenWithVs = async (e: Electron.IpcMainInvokeEvent, p: any) => {
  let s = new Store();

  return s.get(electronStoreKeys.openWithVsKey);
};

const codeCliInstalled = () => {
  return new Promise((res, rej) => {
    exec('code --version', (error, stdout, stderr) => {
      if (error) {
        // console.error(`exec error: ${error}`);
        res(false);
      }
      if (stderr) {
        // console.error(`stderr: ${stderr}`);
        res(false);
      }
      // console.log(`VS Code version: ${stdout}`);
      res(true);
    });
  });
};

export const checkVsRequirementsMet = async () => {
  let isCodeCliInstalled = await codeCliInstalled();
  return {
    codeReq: isCodeCliInstalled,
  };
};

export const getEditorToUse = (e: Electron.IpcMainInvokeEvent, p: any) => {
  let s = new Store();

  // console.log("Editor in use: ", s.get(electronStoreKeys.editorToUseKey));

  return s.get(electronStoreKeys.editorToUseKey);
}

export const setEditorToUse = (
  e: Electron.IpcMainInvokeEvent,
  p: any,
  mainWindow: any
) => {
  let s = new Store();
  let { editorToUse } : {editorToUse: Editor} = p;
  s.set(electronStoreKeys.editorToUseKey, editorToUse);
  return;
};
