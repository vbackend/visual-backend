import { GenFuncs } from '@/shared/utils/GenFuncs';
import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { BrowserWindow, Menu } from 'electron';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import {
  deleteFuncByModule,
  getFuncByKey,
  insertFuncQuery,
} from '@/main/db/funcs/funcQueries';
import { ModuleActions } from '@/main/actions';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import {
  createFirebaseModuleFiles,
  deleteFirebaseFiles,
} from './firebase/firebaseFuncs';
import {
  createModuleQuery,
  deleteModuleQuery,
} from '@/main/db/modules/moduleQueries';
import {
  removeEnvVar,
  writeEnvVars,
  writeIndexFile,
} from '../project/templateGenerate';
import { deletePackages, installPackages } from '@/main/generate/install';
import { writeModuleStarterFuncs, writeModuleTemplate } from './helpers';

export const getModuleFromConfig = (mConfig: any) => {
  return {
    key: mConfig.key,
    init: mConfig.init,
    path: mConfig.path,
    metadata: mConfig.metadata,
  };
};

export const createModule = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { projKey, key } = payload;
  let mConfig = modConfig[key];
  if (payload.metadata) {
    mConfig.metadata = payload.metadata;
  }

  let bModule = getModuleFromConfig(mConfig);
  await createModuleQuery({
    ...bModule,
    metadata: JSON.stringify(bModule.metadata),
  });

  await writeIndexFile(projKey);
  let newFuncs: any = [];

  try {
    switch (key) {
      case BModuleType.FirebaseAuth:
      case BModuleType.FirebaseFirestore:
        newFuncs = await createFirebaseModuleFiles(payload);
        break;
      default:
        newFuncs = await createModuleFiles(payload);
    }
  } catch (error) {
    return { error: 'Failed to create module' };
  }
  console.log('Successfully created module');
  return { newModule: bModule, newFuncs, error: null };
};

export const createModuleFiles = async (payload: any) => {
  let { projId, projKey, key } = payload;
  let bConfig = modConfig[key];

  // 1. write env variables
  // console.log('Payload:', payload);
  // console.log('bConfig env:', bConfig.envVars);
  let envs: Array<{ key: string; val: string }> = [];
  for (let i = 0; i < bConfig.envVars.length; i++) {
    let key = bConfig.envVars[i];
    let val = payload[key];
    envs.push({ key, val });
  }

  // console.log('Writing envs:', envs);

  let promises = [];
  // 1. write env variables
  promises.push(writeEnvVars(projId, projKey, envs));

  // 2. install dependencies
  promises.push(installPackages(bConfig.dependencies, projKey));

  // 3. create init file
  if (bConfig.initFile) {
    promises.push(
      writeModuleTemplate(bConfig.path, bConfig.initFile, `init.ts`, projKey)
    );
  }

  // 4. handle starter funcs
  try {
    let newFuncs = await writeModuleStarterFuncs(projKey, key);
    await Promise.all(promises);
    return newFuncs;
  } catch (error) {
    console.log('Failed to create module files');
    return { error: 'Failed to create module files' };
  }
};

export const deleteModule = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any,
  window: BrowserWindow
) => {
  const { projId, module, projKey } = payload;

  // 1. Delete credentials or env
  if (module.key.includes('firebase')) {
    await deleteFirebaseFiles(projId, module, projKey);
  } else {
    await deleteModuleFiles(payload);
  }

  // 2. Delete all funcs
  await deleteFuncByModule(module.key);

  await deleteModuleQuery(module.key);

  await writeIndexFile(projKey);
};

export const deleteModuleFiles = async (payload: any) => {
  let { projId, module, projKey } = payload;
  let key = module.key;
  let mConfig = modConfig[key];
  let bModule = getModuleFromConfig(mConfig);

  let promises = [];
  // 2. Delete packages
  promises.push(deletePackages(mConfig.dependencies, projKey));

  // 3. Delete folder
  let modulePath = path.join(PathFuncs.getModulesPath(projKey), bModule.path);
  promises.push(FileFuncs.deleteDir(modulePath));

  let envs: any = [];
  for (let i = 0; i < mConfig.envVars.length; i++) {
    envs.push({ key: mConfig.envVars[i], val: '' });
  }
  promises.push(removeEnvVar(projId, projKey, envs));

  try {
    await Promise.all(promises);
  } catch (error) {
    console.log('Failed to delete module files:', error);
    return { error: 'Failed to delete module files' };
  }
};

export const showModuleContextMenu = async (
  payload: any,
  window: BrowserWindow
) => {
  const module = payload;

  Menu.buildFromTemplate([
    {
      label: 'Delete',
      click: async () => {
        window.webContents.send(
          ModuleActions.UPDATE_MODULE_DELETE_CLICKED,
          module
        );
      },
    },
  ]).popup({ window: window! });
};
