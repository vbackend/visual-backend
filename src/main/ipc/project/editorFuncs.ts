import { FileFuncs } from '@/main/helpers/fileFuncs';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';

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
