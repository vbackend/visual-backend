import Margin from '@/renderer/components/general/Margin';
import { Button } from 'antd';
import '@/renderer/styles/Project/Modules/FirebaseModule/ManageFirebaseAuth.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { useEffect, useState } from 'react';
import { BFunc } from '@/shared/models/BFunc';
import { BModuleType } from '@/shared/models/BModule';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FuncButton } from '../../General/FuncButton';
import CreateAuthFuncModal from '../CreateFuncModal';
import { addFunc } from '@/renderer/redux/module/moduleSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';

import { faFilePlus } from '@fortawesome/pro-duotone-svg-icons';

function FirebaseAuthManager() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const moduleFuncs = useSelector((state: RootState) => state.module.funcs);
  let [authFuncs, setAuthFuncs] = useState<any>([]);
  let [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    console.log('Module funcs:', moduleFuncs);
    let authFuncs = moduleFuncs?.filter(
      (func: BFunc) => func.moduleKey == BModuleType.FirebaseAuth
    );
    console.log('Auth funcs:', authFuncs);
    setAuthFuncs(authFuncs);
  }, [moduleFuncs]);

  const createAuthFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setLoading: any
  ) => {
    setLoading(true);
    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup: '*',
      moduleKey: BModuleType.FirebaseAuth,
      projKey: curProject?.key,
      details: '',
      module: curModule,
      useGpt,
    });

    setLoading(false);

    if (error) {
      setErrText(error);
      return;
    }

    setErrText('');

    dispatch(addFunc(newFunc));

    dispatch(setCurFile(RenFuncs.getFuncFileData(newFunc, curModule!)));

    setCreateModalOpen(false);
  };

  return (
    <>
      {createModalOpen && (
        <CreateAuthFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createAuthFunc}
          type="firebase auth"
        />
      )}
      <div className="moduleSection fbAuthScreen">
        <div className="headerContainer">
          <h3 className="title">Firebase Auth</h3>
        </div>
        <div className="infoContainer">
          <p>The following global variables are available:</p>
          <Margin height={10} />
          <div className="variableContainer">
            <p className="varName">auth: </p>
            <p>Firebase Auth</p>
          </div>
          <div className="variableContainer"></div>
        </div>

        <div className="mainContainer">
          <div className="colHeader">
            <p>Functions</p>
            <Button
              type="text"
              className="addBtn"
              onClick={() => setCreateModalOpen(true)}
            >
              <FontAwesomeIcon icon={faFilePlus} className="icon" />
            </Button>
          </div>
          <Margin height={8} />
          {authFuncs.map((func: BFunc) => (
            <FuncButton func={func} module={curModule} />
          ))}
        </div>
      </div>
    </>
  );
}

export default FirebaseAuthManager;
