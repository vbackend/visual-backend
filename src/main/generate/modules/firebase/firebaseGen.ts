import { FileFuncs } from '@/main/helpers/fileFuncs';
import { ProjectService } from '@/main/services/ProjectService';
import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { BModule, modConfig } from '@/shared/models/BModule';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

// export const writeFirebaseCredentials = async (
//   projectId: string,
//   projKey: string,
//   credPath: string
// ) => {
//   let credDir = path.join(PathFuncs.getProjectPath(projKey), 'credentials');
//   let targetFile = path.join(credDir, 'firebase_credentials.json');

//   await FileFuncs.createDirIfNotExists(credDir);
//   let data: any = await FileFuncs.readFile(credPath);

//   // 3. Add env file to firebase
//   ProjectService.addEnvVars({
//     projectId,
//     envVars: [{ key: 'FIREBASE_CREDENTIALS', val: data }],
//   });

//   await FileFuncs.writeFile(targetFile, data);
//   console.log('Successfully written firebase credentials');
// };

export const writeFbInit = async (projKey: string) => {
  let templatePath = path.join(
    PathFuncs.getCodeTemplatesPath(),
    'firebase',
    'initFirebaseTemplate.ts'
  );
  let fbModulePath = path.join(PathFuncs.getModulesPath(projKey), 'firebase');
  let fbInitPath = path.join(fbModulePath, 'init.ts');

  await FileFuncs.createDirIfNotExists(fbModulePath);

  let data: any = await FileFuncs.readFile(templatePath);
  await FileFuncs.writeFile(fbInitPath, data);
};
