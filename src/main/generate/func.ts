import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { app } from 'electron';
import fs from 'fs';
import { FileFuncs } from '../helpers/fileFuncs';
import { MainFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export const createFuncFile = async (
  projKey: string,
  newFunc: BFunc,
  contents: string
) => {
  let funcName = BFuncHelpers.getFuncName(newFunc);

  let modulePath = path.join(
    MainFuncs.getProjectPath(projKey),
    'src',
    'modules',
    newFunc.moduleKey,
    newFunc.funcGroup
  );
  let filePath = path.join(modulePath, `${funcName}.ts`);

  await FileFuncs.createDirIfNotExists(modulePath);
  await FileFuncs.writeFile(filePath, contents);
};
