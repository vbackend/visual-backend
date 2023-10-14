import { BFunc } from '@/shared/models/BFunc';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { FuncButton } from '../General/FuncButton';
import Margin from '@/renderer/components/general/Margin';
import CreateFuncModal from '../FirebaseModule/CreateFuncModal';
import { BModuleType } from '@/shared/models/BModule';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { addFunc } from '@/renderer/redux/module/moduleSlice';
import { Button } from 'antd';
import { faFilePlus, faPlus } from '@fortawesome/pro-duotone-svg-icons';

function JwtManager() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const moduleFuncs = useSelector((state: RootState) => state.module.funcs);
  let [jwtFuncs, setJwtFuncs] = useState<any>([]);
  let [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let jwtFuncs = moduleFuncs?.filter(
      (func: BFunc) => func.moduleKey == BModuleType.JwtAuth
    );
    setJwtFuncs(jwtFuncs);
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
      moduleKey: BModuleType.JwtAuth,
      projKey: curProject?.key,
      module: curModule,
      useGpt,
      details: ``,
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
        <CreateFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createAuthFunc}
          type="jwt"
        />
      )}
      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">JWT</h3>
        </div>
        <Margin height={10} />
        {/* <div className="infoContainer">
            <p>The following global variables are available:</p>
            <Margin height={10} />
            <div className="variableContainer">
              <p className="varName">auth: </p>
              <p>Firebase Auth</p>
            </div>
            <div className="variableContainer"></div>
          </div> */}

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
          {jwtFuncs.map((func: BFunc) => (
            <FuncButton func={func} module={curModule} />
          ))}
        </div>
      </div>
    </>
  );
}

export default JwtManager;
