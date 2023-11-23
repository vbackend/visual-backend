import { Actions } from '@/main/actions';
import {
  deleteFuncQuery,
  getFuncByKey,
  insertFuncQuery,
} from '@/main/db/funcs/funcQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { GptService } from '@/main/services/GptService';
import { BFuncHelpers } from '@/shared/models/BFunc';
import { BModule, BModuleType, modConfig } from '@/shared/models/BModule';
import { ProjectType } from '@/shared/models/project';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import { BrowserWindow, Menu } from 'electron';
import path from 'path';

export const getModuleScaffold = async (
  f: any,
  m: BModule,
  projType: ProjectType = ProjectType.Express
) => {
  let mPath = path.join(...m.path.split('/'));
  let funcName = BFuncHelpers.getFuncName(f);
  let mConfig = MainFuncs.getModConfig(m.key, projType);

  let templatePath = path.join(
    PathFuncs.getModTemplatesPath(projType),
    mPath,
    mConfig.starterFile
  );

  let data: any = await FileFuncs.readFile(templatePath);

  // For firebase fast api
  if (projType == ProjectType.FastAPI && m.key == BModuleType.Firebase) {
    data = data.replace('{{fb_service}}', f.funcGroup);
  }
  if (projType == ProjectType.FastAPI) {
    data = data.replace('{{func_name}}', funcName);
  } else {
    data = data.replace(/\$\{funcName\}/g, funcName);
  }
  return data;
};

export const writeToFuncFile = async (
  projKey: string,
  m: BModule,
  f: any,
  data: string,
  projType: ProjectType = ProjectType.Express
) => {
  let mPath = path.join(...m.path.split('/'));
  let funcName = BFuncHelpers.getFuncName(f);

  let parentPath = path.join(PathFuncs.getModulesPath(projKey), mPath);

  if (f.funcGroup && f.funcGroup != '*') {
    parentPath = path.join(parentPath, f.funcGroup);
  }

  await FileFuncs.createDirIfNotExists(parentPath);

  let filePath = path.join(
    parentPath,
    `${funcName}.${MainFuncs.getExtension(projType)}`
  );

  await FileFuncs.writeFile(filePath, data);
};

export const generateFuncCode = async (payload: any, projType: ProjectType) => {
  const { funcName, projKey, moduleKey, funcGroup, useGpt, module, details } =
    payload;

  let funcScaffold: any = '';

  funcScaffold = await getModuleScaffold(
    { key: funcName, funcGroup },
    module,
    projType
  );

  if (!useGpt) {
    await writeToFuncFile(
      projKey,
      module,
      { key: funcName, funcGroup },
      funcScaffold,
      projType
    );
    return;
  }

  let res = await GptService.generateFunc({
    funcScaffold,
    funcName,
    serviceName: moduleKey,
    details: details,
    projectType: projType,
  });

  let code = res.data.code;

  await writeToFuncFile(
    projKey,
    module,
    { key: funcName, funcGroup },
    code,
    projType
  );
};

export const createFunc = async (e: Electron.IpcMainInvokeEvent, p: any) => {
  const { funcName, moduleKey, funcGroup } = p;

  const { projType } = MainFuncs.getCurProject();

  // 1. Check if func name already exists
  let func = await getFuncByKey(funcName);
  if (func) {
    return { error: 'Name already taken' };
  }

  // 2. Insert func module query
  let newFunc = await insertFuncQuery(
    funcName,
    moduleKey,
    funcGroup,
    MainFuncs.getExtension(projType)
  );

  if (!newFunc) {
    return { error: 'Failed to insert' };
  }

  try {
    await generateFuncCode(p, projType);
    return { error: null, newFunc };
  } catch (error) {
    console.log('Failed to write to file:', error);
    return { error: 'Failed to create module' };
  }
};

export const deleteFunc = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any,
  window: BrowserWindow
) => {
  const { func, module, projKey } = payload;

  Menu.buildFromTemplate([
    {
      label: 'Delete',
      click: async () => {
        let moduleDir = path.join(
          PathFuncs.getModulesPath(projKey),
          module.path
        );

        let funcPath = path.join(moduleDir, BFuncHelpers.getFuncPath(func));

        // 1. Delete func from
        await deleteFuncQuery(func.id);
        await FileFuncs.deleteFile(funcPath);

        window.webContents.send(Actions.UPDATE_FUNC_DELETED, func);
      },
    },
  ]).popup({ window: window! });
};
