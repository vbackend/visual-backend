import { FileFuncs } from '@/main/helpers/fileFuncs';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import { exec } from 'child_process';
import { app, shell } from 'electron';

export const getFileContents = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { path, projKey } = payload;
  let contents = await FileFuncs.readFile(
    `${PathFuncs.getProjectPath(projKey)}${path}`
  );

  return contents;
};

export const saveFileContents = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { path, projKey, contents } = payload;
  let filePath = `${PathFuncs.getProjectPath(projKey)}${path}`;
  await FileFuncs.writeFile(filePath, contents);

  return true;
};

export const openFile = async (event: Electron.IpcMainEvent, payload: any) => {
  const { path, projKey, contents } = payload;
  let filePath = `${PathFuncs.getProjectPath(projKey)}${path}`;
  console.log('Opening file path:', filePath);
  shell.openPath(filePath);
  // exec(`"${filePath}"`);
};

export const openProjectInVs = async (
  event: Electron.IpcMainEvent,
  payload: any
) => {
  const { projKey } = payload;
  exec(`cd "${PathFuncs.getProjectPath(projKey)}" && code .`);
};

export const openProjectInIntelliJ = async (
  event: Electron.IpcMainEvent,
  payload: any
) => {
  const { projKey } = payload;
  if (process.platform == 'win32') {
    exec(`cd "${PathFuncs.getProjectPath(projKey)}" && idea .`);
  } else {
    exec(`open -na "IntelliJ IDEA.app" "${PathFuncs.getProjectPath(projKey)}"`);
  }
};
