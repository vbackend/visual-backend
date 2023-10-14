import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { modConfig } from '@/shared/models/BModule';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

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
  let data: any = await FileFuncs.readFile(templatesPath);
  await FileFuncs.writeFile(filePath, data);
};

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

    newFuncPromises.push(insertFuncQuery(name, mConfig.key, '*', 'ts'));
  }

  await Promise.all(promises);
  newFuncs = await Promise.all(newFuncPromises);
  console.log('Successfully written module starter funcs: ', newFuncs);
  return newFuncs;
};
