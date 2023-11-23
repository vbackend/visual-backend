import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { modConfig } from '@/shared/models/BModule';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import fs from 'fs-extra';
import { ProjectType } from '@/shared/models/project';
import { GenFuncs } from '@/shared/utils/GenFuncs';

export const writeModuleTemplate = async (
  mPath: string,
  templateFileName: string,
  targetFileName: string,
  projKey: string,
  projType: ProjectType = ProjectType.Express
) => {
  let templatesPath = path.join(
    PathFuncs.getModTemplatesPath(projType),
    mPath,
    templateFileName
  );

  let folderPath = path.join(PathFuncs.getModulesPath(projKey), mPath);
  let filePath = path.join(folderPath, targetFileName);

  // 1. Create folder dir if not exists
  await FileFuncs.createDirIfNotExists(folderPath);
  const dirPath = path.dirname(filePath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // 2. Read template and write to file
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

export const writeModuleStarterFuncs = async (
  projKey: string,
  key: string,
  projType: ProjectType = ProjectType.Express
) => {
  let newFuncs: any = [];
  let mConfig = MainFuncs.getModConfig(key, projType);
  if (mConfig.starterFuncs.length == 0) return [];

  let promises = [];
  let newFuncPromises = [];
  for (let i = 0; i < mConfig.starterFuncs.length; i++) {
    let name = mConfig.starterFuncs[i];
    promises.push(
      writeModuleTemplate(
        mConfig.path,
        `${name}.txt`,
        `${name}.${GenFuncs.getExtension(projType)}`,
        projKey,
        projType
      )
    );

    let dir = getFuncDirFromPath(name);
    let funcGroup = dir == '' ? '*' : dir;
    newFuncPromises.push(
      insertFuncQuery(
        getFuncNameFromPath(name),
        mConfig.key,
        funcGroup,
        MainFuncs.getExtension(projType)
      )
    );
  }

  await Promise.all(promises);
  newFuncs = await Promise.all(newFuncPromises);
  return newFuncs;
};
