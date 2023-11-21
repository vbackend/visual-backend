import Margin from '@/renderer/components/general/Margin';
import React from 'react';
import FuncSection from '../General/FuncSection';
import { modConfig } from '@/shared/models/BModule';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { addFunc } from '@/renderer/redux/module/moduleSlice';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import EmailTemplatesSection from './EmailTemplatesSection';

function ResendManager() {
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const dispatch = useDispatch();

  const createFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setLoading: any,
    setModalOpen?: any
  ) => {
    setLoading(true);

    let mConfig = modConfig[curModule?.key!];

    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup: '*',
      moduleKey: curModule?.key,
      projKey: curProject?.key,
      module: curModule,
      useGpt,
      details: mConfig.gptDetails,
    });

    setLoading(false);

    if (error) {
      setErrText(error);
      return;
    }

    setErrText('');
    dispatch(addFunc(newFunc));
    dispatch(setCurFile(RenFuncs.getFuncFileData(newFunc, curModule!)));
    setModalOpen(false);
  };

  return (
    <>
      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">Resend</h3>
        </div>
        <Margin height={10} />

        <div className="mainContainer">
          <EmailTemplatesSection />
          <Margin height={10} />
          <FuncSection createFuncClicked={createFunc} />
        </div>
      </div>
    </>
  );
}

export default ResendManager;
