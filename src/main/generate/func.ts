import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { app } from 'electron';
import fs from 'fs';
import { FileFuncs } from '../helpers/fileFuncs';
import { MainFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export const createMongoDbFuncFile = async (
  projKey: string,
  newFunc: BFunc
) => {
  let funcName = BFuncHelpers.getFuncName(newFunc);
  let contents = `import { mongoCli, defaultDb } from '@/modules/mongo/init.js'
export const ${funcName} = () => {
  // Start writing code here
}
    `;

  await createFuncFile(projKey, newFunc, contents);
};

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
