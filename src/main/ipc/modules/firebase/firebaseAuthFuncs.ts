import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { writeFbAuthFuncFile } from '@/main/generate/modules/firebase/firebaseGen';
import { BFunc } from '@/shared/models/BFunc';
import { BModuleType } from '@/shared/models/BModule';

export const createFirebaseAuthFunc = async (
  e: Electron.IpcMainInvokeEvent,
  p: any
) => {
  // 1. Insert func module query
  const { funcName, projKey } = p;
  let lastId = await insertFuncQuery(funcName, BModuleType.FirebaseAuth, '*');
  if (!lastId) {
    return { error: 'Failed to insert' };
  }
  // 2. Create new folder & file
  let newFunc: BFunc = {
    id: lastId,
    key: funcName,
    moduleKey: BModuleType.FirebaseAuth,
    funcGroup: '*',
  };

  await writeFbAuthFuncFile(projKey, newFunc);

  return { error: null, newFunc };
};
