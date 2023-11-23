import { FileFuncs } from '@/main/helpers/fileFuncs';
import { BrowserWindow, IpcMainInvokeEvent, Menu } from 'electron';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { deleteFuncByModule } from '@/main/db/funcs/funcQueries';
import { ModuleActions } from '@/main/actions';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import {
  deleteFirebaseCredentials,
  deleteFirebaseFiles,
  writeFirebaseCredentials,
} from './firebase/firebaseFuncs';
import {
  createModuleQuery,
  deleteModuleQuery,
  editModuleMetadata,
} from '@/main/db/modules/moduleQueries';

import { deletePackages, installPackages } from '@/main/generate/install';
import { writeModuleStarterFuncs, writeModuleTemplate } from './helpers';
import { removeEnvVars, writeEnvVars } from '@/main/generate/env';
import { writeIndexFile } from '@/main/generate/general';
import { ProjectType } from '@/shared/models/project';
import {
  installPyPackages,
  uninstallPyPackages,
} from '@/main/generate/fastapi/pythonInstall';
import { GenFuncs } from '@/shared/utils/GenFuncs';

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
  let { key, metadata } = payload;
  let { projKey, projType } = MainFuncs.getCurProject();

  let mConfig = MainFuncs.getModConfig(key, projType);
  if (metadata) {
    mConfig.metadata = payload.metadata;
  }

  let bModule = getModuleFromConfig(mConfig);

  // 1. Create module query
  console.log('1. Inserting module into sqlite db');
  await createModuleQuery({
    ...bModule,
    metadata: JSON.stringify(bModule.metadata),
  });

  // 2. Write index file
  console.log('2. Writing index file');
  await writeIndexFile(projKey, projType);
  let newFuncs: any = [];

  try {
    console.log('3. Creating module files');
    newFuncs = await createModuleFiles(payload);
  } catch (error) {
    return { error: 'Failed to create module' };
  }

  return { newModule: bModule, newFuncs, error: null };
};

export const createModuleFiles = async (payload: any) => {
  let { projId, key } = payload;
  let { projKey, projType } = MainFuncs.getCurProject();
  let bConfig = MainFuncs.getModConfig(key, projType);

  let envs: Array<{ key: string; val: string }> = [];
  for (let i = 0; i < bConfig.envVars.length; i++) {
    let key = bConfig.envVars[i];
    let val = payload[key];
    envs.push({ key, val });
  }

  let promises = [];
  promises.push(writeEnvVars(projId, projKey, envs));

  // Module specific actions
  if (key == BModuleType.Firebase) {
    promises.push(writeFirebaseCredentials(payload));
  }

  // Install packages
  if (projType === ProjectType.FastAPI) {
    promises.push(installPyPackages(bConfig.dependencies, projKey));
  } else {
    promises.push(installPackages(bConfig.dependencies, projKey));
  }

  // Write index file
  if (bConfig.initFile) {
    let initTarget = `init.${GenFuncs.getExtension(projType)}`;
    promises.push(
      writeModuleTemplate(
        bConfig.path,
        bConfig.initFile,
        initTarget,
        projKey,
        projType
      )
    );
  }

  // Write starter funcs
  try {
    let newFuncs = await writeModuleStarterFuncs(projKey, key, projType);
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
  const { projType } = MainFuncs.getCurProject();

  // 1. Delete credentials or env

  await deleteModuleFiles(payload);

  // 2. Delete all funcs
  await deleteFuncByModule(module.key);

  await deleteModuleQuery(module.key);

  await writeIndexFile(projKey, projType);
};

export const deleteModuleFiles = async (payload: any) => {
  let { projId, module } = payload;
  let { projKey, projType } = MainFuncs.getCurProject();
  let key = module.key;

  let mConfig = MainFuncs.getModConfig(key, projType);

  let bModule = getModuleFromConfig(mConfig);
  let promises = [];

  if (module.key == BModuleType.Firebase) {
    promises.push(deleteFirebaseCredentials(projKey));
  }

  // 2. Delete packages
  if (projType == ProjectType.FastAPI) {
    promises.push(uninstallPyPackages(mConfig.dependencies, projKey));
  } else {
    promises.push(deletePackages(mConfig.dependencies, projKey));
  }

  // 3. Delete folder
  let modulePath = path.join(PathFuncs.getModulesPath(projKey), bModule.path);
  promises.push(FileFuncs.deleteDir(modulePath));

  let envs: any = [];
  for (let i = 0; i < mConfig.envVars.length; i++) {
    envs.push({ key: mConfig.envVars[i], val: '' });
  }
  promises.push(removeEnvVars(projId, projKey, envs));

  try {
    await Promise.all(promises);
  } catch (error) {
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

export const setModuleMetadata = async (
  e: IpcMainInvokeEvent,
  payload: any
) => {
  let { metadata, bModule } = payload;
  console.log('Payload:', payload);
  await editModuleMetadata(metadata, bModule);
  return true;
};
