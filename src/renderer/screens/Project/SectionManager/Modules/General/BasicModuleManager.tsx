import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { addFunc } from '@/renderer/redux/module/moduleSlice';
import { RootState } from '@/renderer/redux/store';
import { BFunc } from '@/shared/models/BFunc';
import { modConfig } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateFuncModal from './CreateFuncModal';
import Margin from '@/renderer/components/general/Margin';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LuFilePlus2 } from 'react-icons/lu';
import { FuncButton } from './FuncButton';
import { MdNoteAdd } from 'react-icons/md';

function BasicModuleManager() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const funcs = useSelector((state: RootState) => state.module.funcs);
  let [modFuncs, setModFuncs] = useState<any>([]);
  let [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let newModFuncs = funcs?.filter(
      (func: BFunc) => func.moduleKey == curModule?.key
    );
    setModFuncs(newModFuncs);
  }, [modFuncs]);

  const createFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setLoading: any
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
    setCreateModalOpen(false);
  };

  return (
    <>
      {createModalOpen && (
        <CreateFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createFunc}
          type={curModule?.key}
        />
      )}
      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">{modConfig[curModule!.key].title}</h3>
        </div>
        <Margin height={10} />

        <div className="mainContainer">
          <div className="colHeader">
            <p>Functions</p>
            <Button
              type="text"
              className="funcAddBtn"
              onClick={() => setCreateModalOpen(true)}
            >
              <MdNoteAdd className="icon noteAddIcon" />
            </Button>
          </div>
          <Margin height={8} />
          {modFuncs.map((func: BFunc) => (
            <FuncButton func={func} module={curModule} />
          ))}
        </div>
      </div>
    </>
  );
}

export default BasicModuleManager;
