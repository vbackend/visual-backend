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
  shell.openPath(filePath);
  // exec(`"${filePath}"`);
};

export const openProjectInVs = async (
  event: Electron.IpcMainEvent,
  payload: any
) => {
  const { projKey } = payload;
  console.log('Opening project in VS Code');
  console.log(PathFuncs.getProjectPath(projKey));
  exec(`cd "${PathFuncs.getProjectPath(projKey)}" && code .`);
};
