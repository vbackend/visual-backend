import { deletePackages, installPackages } from '@/main/generate/install';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { MainFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export const getProjectPackages = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { projKey } = payload;
  let packageJsonContents: any = await FileFuncs.readFile(
    path.join(MainFuncs.getProjectPath(projKey), 'package.json')
  );
  let pkgJson = JSON.parse(packageJsonContents);
  let dependencies = pkgJson.dependencies;
  return dependencies;
};

export const installNpmPackage = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { projKey, pkgName } = payload;
  console.log('Installing package:', payload);
  try {
    await installPackages([pkgName], projKey);
  } catch (error) {
    return { error: 'Failed' };
  }
  return {};
};

export const deleteNpmPackage = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { projKey, pkgName } = payload;
  console.log('Deleting package:', payload);
  try {
    await deletePackages([pkgName], projKey);
  } catch (error) {
    return { error: 'Failed' };
  }
  return {};
};
