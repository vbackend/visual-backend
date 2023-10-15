import {
  createModuleQuery,
  editModuleMetadata,
  getModules,
} from '@/main/db/modules/moduleQueries';
import {
  writeFbInit,
  writeFirebaseCredentials,
} from '@/main/generate/modules/firebase/firebaseGen';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { BModule, BModuleType, modConfig } from '@/shared/models/BModule';
import admin from 'firebase-admin';
import { installPackages } from '@/main/generate/install';
import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { writeModuleStarterFuncs, writeModuleTemplate } from '../helpers';
import { envConsts } from '@/renderer/misc/constants';
import { ProjectService } from '@/main/services/ProjectService';
import { getModuleFromConfig } from '../moduleFuncs';
import { writeIndexFile } from '@/main/generate/general';

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
  let { filePath, type, projKey } = p;

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

    if (type == BModuleType.FirebaseAuth) {
      let auth = admin.auth();
      await auth.listUsers();
    } else {
      let firestore = admin.firestore();
      await firestore.listCollections();
    }
    admin.app().delete();

    return { projId: cred.project_id, error: null };
  } catch (error: any) {
    admin.app().delete();
    console.log('Error:', error);
    if (
      error.errorInfo &&
      error.errorInfo.code &&
      error.errorInfo.code == 'auth/configuration-not-found'
    ) {
      return { error: 'Auth service not enabled in firebase' };
    } else if (error.reason && error.reason == 'SERVICE_DISABLED') {
      return { error: 'Firestore service not enabled in firebase' };
    }
    return { error: 'Failed to connect to firebase project' };
  }
};

export const initialiseFirebase = async (projKey: string) => {
  // 1. Write firebase init
  await writeFbInit(projKey);

  // 2. Write init file
  await writeIndexFile(projKey);
};

export const createFirebaseModuleFiles = async (payload: any) => {
  let { filePath, projId, projKey, key } = payload;

  console.log('Creating firebase module files');

  let modules = await getModules();
  let firebaseAlreadyInitialised =
    modules.findIndex(
      (m: BModule) => m.key.includes('firebase') && m.key != key
    ) != -1;

  let promises: any = [];
  if (!firebaseAlreadyInitialised) {
    promises = promises.concat([
      writeFirebaseCredentials(projId, projKey, filePath),
      writeFbInit(projKey),
      writeIndexFile(projKey),
      installPackages(['firebase-admin'], projKey),
    ]);
  }

  try {
    let newFuncs = await writeModuleStarterFuncs(projKey, key);
    await Promise.all(promises);
    return newFuncs;
  } catch (error) {
    console.log('Failed to create module files: ', key);
  }
};

export const setFirestoreMetadata = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { metadata } = payload;
  console.log('Setting firestore metadata:', metadata);

  await editModuleMetadata(metadata, BModuleType.FirebaseFirestore);

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
