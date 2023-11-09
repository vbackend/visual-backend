import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { modConfig } from '@/shared/models/BModule';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import fs from 'fs-extra';

export const writeModuleTemplate = async (
  mPath: string,
  templateFileName: string,
  targetFileName: string,
  projKey: string
) => {
  let templatesPath = path.join(
    PathFuncs.getCodeTemplatesPath(),
    mPath,
    templateFileName
  );
  let folderPath = path.join(PathFuncs.getModulesPath(projKey), mPath);
  let filePath = path.join(folderPath, targetFileName);

  await FileFuncs.createDirIfNotExists(folderPath);

  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  let data: any = await FileFuncs.readFile(templatesPath);
  await FileFuncs.writeFile(filePath, data);
};

function getFuncNameFromPath(str: string) {
  return str.substring(str.lastIndexOf('/') + 1);
}

function getFuncDirFromPath(str: any) {
  const lastSlashIndex = str.lastIndexOf('/');
  if (lastSlashIndex === -1) {
    return '';
  }
  return str.substring(0, lastSlashIndex);
}

export const writeModuleStarterFuncs = async (projKey: string, key: string) => {
  let newFuncs: any = [];
  let mConfig = modConfig[key];
  if (mConfig.starterFuncs.length == 0) return [];

  let promises = [];
  let newFuncPromises = [];
  for (let i = 0; i < mConfig.starterFuncs.length; i++) {
    let name = mConfig.starterFuncs[i];
    promises.push(
      writeModuleTemplate(mConfig.path, `${name}.txt`, `${name}.ts`, projKey)
    );

    let dir = getFuncDirFromPath(name);
    let funcGroup = dir == '' ? '*' : dir;
    newFuncPromises.push(
      insertFuncQuery(getFuncNameFromPath(name), mConfig.key, funcGroup, 'ts')
    );
  }

  await Promise.all(promises);
  newFuncs = await Promise.all(newFuncPromises);
  return newFuncs;
};
