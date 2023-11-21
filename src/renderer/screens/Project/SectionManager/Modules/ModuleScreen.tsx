import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import ManageMongo from './MongoModule/MongoManager';
import '@/renderer/styles/Project/Modules/ModuleSection.scss';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import { useEffect } from 'react';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import { deleteFunc } from '@/renderer/redux/module/moduleSlice';
import FirestoreManager from '../../../../../archives/FirebaseFirestore/FirestoreManager';
import BasicModuleManager from './General/BasicModuleManager';
import ResendManager from './ResendModule/ResendManager';
import StripeManager from './StripeModule/StripeManager';
import SupabaseManager from './SupabaseModule/SupabaseManager';
import FirebaseManager from './FirebaseModule/FirebaseManager';

function ModuleScreen() {
  const dispatch = useDispatch();
  const curModule = useSelector((state: RootState) => state.module.curModule);
  let curFile = useSelector((state: RootState) => state.editor.currentFile);

  useEffect(() => {
    const handleFuncDeleted = (event: any, payload: any) => {
      if (
        curFile &&
        curFile.metadata.type == EditorType.Func &&
        payload.id == curFile.metadata.id
      ) {
        dispatch(setCurFile(null));
      }
      dispatch(deleteFunc(payload));
    };
    window.electron.onFuncDeleted(handleFuncDeleted);

    return () => {
      window.electron.removeFuncDeletedListener();
    };
  }, [curFile]);

  const getCurScreen = () => {
    if (!curModule) return <></>;
    let key = curModule.key;
    if (key === BModuleType.Firebase) return <FirebaseManager />;
    if (key === BModuleType.Supabase) return <SupabaseManager />;
    if (key === BModuleType.Mongo) return <ManageMongo />;
    // if (key === BModuleType.FirebaseFirestore) return <FirestoreManager />;
    if (key === BModuleType.Resend) return <ResendManager />;
    if (key === BModuleType.Stripe) return <StripeManager />;
    else {
      let config = modConfig[curModule.key];
      if (config.type == 'basic') {
        return <BasicModuleManager />;
      }
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', backgroundColor: 'white' }}>
      {getCurScreen()}
    </div>
  );
}

export default ModuleScreen;
function dispatch(arg0: any) {
  throw new Error('Function not implemented.');
}
