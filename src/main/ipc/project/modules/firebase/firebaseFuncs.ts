import {
  editModuleMetadata,
  getModules,
} from '@/main/db/modules/moduleQueries';
import { writeFbInit } from '@/main/generate/modules/firebase/firebaseGen';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { BModule, BModuleType } from '@/shared/models/BModule';
import admin from 'firebase-admin';
import { installPackages } from '@/main/generate/install';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { writeModuleStarterFuncs } from '../helpers';
import { envConsts } from '@/renderer/misc/constants';
import { ProjectService } from '@/main/services/ProjectService';
import { writeIndexFile } from '@/main/generate/general';
import { replaceEnvVarInFile, writeEnvVars } from '@/main/generate/env';

export const writeFirebaseCredentials = async (payload: any) => {
  let { projId, projKey, filePath } = payload;
  let credDir = path.join(PathFuncs.getProjectPath(projKey), 'credentials');
  let targetFile = path.join(credDir, 'firebase_credentials.json');

  await FileFuncs.createDirIfNotExists(credDir);
  let data: any = await FileFuncs.readFile(filePath);

  console.log('Project ID:', projId);

  // // await writeEnvVars(projId, projKey, )
  // let newLine1 = `FIREBASE_CREDENTIALS=${data}`;
  // await replaceEnvVarInFile(
  //   path.join(PathFuncs.getProjectPath(projKey), '.env'),
  //   'FIREBASE_CREDENTIALS',
  //   newLine1
  // );

  // 3. Add env file to firebase
  ProjectService.addEnvVars({
    projectId: projId,
    envVars: [{ key: 'FIREBASE_CREDENTIALS', val: data }],
  });

  await FileFuncs.writeFile(targetFile, data);
  console.log('Successfully written firebase credentials');
};

export const deleteFirebaseCredentials = async (projKey: string) => {
  let credPath = path.join(
    PathFuncs.getProjectPath(projKey),
    'credentials',
    'firebase_credentials.json'
  );

  console.log('');
  try {
    await FileFuncs.deleteFile(credPath);
  } catch (error) {
    console.log('Failed to delete firebase credentials file');
  }
};

// TO DELETE
export const getCurrentFirebase = async (
  e: Electron.IpcMainInvokeEvent,
  p: any
) => {
  let { projKey } = p;
  let modules = await getModules();

  if (modules.findIndex((m: BModule) => m.key.includes('firebase')) != -1) {
    let credString: any = await FileFuncs.readFile(
      path.join(
        PathFuncs.getProjectPath(projKey),
        'credentials',
        'firebase_credentials.json'
      )
    );
    return JSON.parse(credString).project_id;
  }

  return null;
};

export const checkFirebaseCredentials = async (
  e: Electron.IpcMainInvokeEvent,
  p: any
) => {
  let { filePath, projKey } = p;

  try {
    let cred;
    if (filePath) {
      let credString: any = await FileFuncs.readFile(filePath);
      cred = JSON.parse(credString);
    } else {
      let credString: any = await FileFuncs.readFile(
        path.join(
          PathFuncs.getProjectPath(projKey),
          'credentials',
          'firebase_credentials.json'
        )
      );
      cred = JSON.parse(credString);
    }

    admin.initializeApp({
      credential: admin.credential.cert(cred),
    });
    // let firestore = admin.firestore();

    // if (type == BModuleType.FirebaseAuth) {
    //   let auth = admin.auth();
    //   await auth.listUsers();
    // } else {
    //   let firestore = admin.firestore();
    //   await firestore.listCollections();
    // }
    admin.app().delete();
    return { projId: cred.project_id, error: null };
  } catch (error: any) {
    // console.log('Error when checking firebase credentials');

    // console.log('Admin app:', admin.app());
    // admin.app().delete();
    // console.log('Error:', error);
    // if (
    //   error.errorInfo &&
    //   error.errorInfo.code &&
    //   error.errorInfo.code == 'auth/configuration-not-found'
    // ) {
    //   return { error: 'Auth service not enabled in firebase' };
    // } else if (error.reason && error.reason == 'SERVICE_DISABLED') {
    //   return { error: 'Firestore service not enabled in firebase' };
    // }
    return { error: 'Failed to connect to firebase project' };
  }
};

export const initialiseFirebase = async (projKey: string) => {
  // 1. Write firebase init
  await writeFbInit(projKey);

  // 2. Write init file
  await writeIndexFile(projKey);
};

export const setFirestoreMetadata = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { metadata } = payload;

  await editModuleMetadata(metadata, BModuleType.Firebase);

  return true;
};

export const deleteFirebaseFiles = async (
  projectId: string,
  module: BModule,
  projKey: string
) => {
  let modules = await getModules();
  let otherIndex = modules.findIndex(
    (m: BModule) => m.key.includes('firebase') && m.key != module.key
  );

  let credPath = path.join(
    PathFuncs.getProjectPath(projKey),
    'credentials',
    'firebase_credentials.json'
  );
  let firebasePath = path.join(PathFuncs.getModulesPath(projKey), 'firebase');
  let modulePath = path.join(
    PathFuncs.getModulesPath(projKey),
    PathFuncs.getModulePath(module.path)
  );

  if (otherIndex == -1) {
    // delete firebase credentials
    await ProjectService.deleteEnvVars({
      projectId,
      envVars: [{ key: envConsts.FIREBASE_CREDENTIALS }],
    });
    await FileFuncs.deleteFile(credPath);
    await FileFuncs.deleteDir(firebasePath);
  } else {
    await FileFuncs.deleteDir(modulePath);
  }
};
