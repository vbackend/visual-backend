import Margin from '@/renderer/components/general/Margin';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import {
  addFunc,
  setModuleMetadata,
} from '@/renderer/redux/module/moduleSlice';
import { RootState } from '@/renderer/redux/store';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FuncSection from '../General/FuncSection';
import { Button, Tooltip } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';
import { BFunc } from '@/shared/models/BFunc';
import { MdCreateNewFolder, MdNoteAdd } from 'react-icons/md';
import { FuncButton } from '../General/FuncButton';
import CreateFuncModal from '../General/CreateFuncModal';
import CreateFsColModal from './CreateFsColModal';

function FirebaseManager() {
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  let cols = curModule?.metadata.cols;

  const dispatch = useDispatch();
  const moduleFuncs = useSelector((state: RootState) => state.module.funcs);

  const [createColOpen, setCreateColOpen] = useState(false);
  const [createColFuncOpen, setCreateColFuncOpen] = useState(false);
  const [colSelected, setColSelected] = useState('');
  const [sortedFuncs, setSortedFuncs] = useState<any>({});

  const createFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setLoading: any,
    funcGroup: string,
    setModalOpen?: any
  ) => {
    setLoading(true);
    let mConfig = modConfig[curModule?.key!];

    let details = funcGroup.includes('firestore')
      ? `This module uses the firebase firestore service specifically and admin has already been initialised, and interacts with the ${funcGroup.slice(
          funcGroup.indexOf('/') + 1
        )} collection`
      : `This module uses the firebase ${funcGroup} service specifically and admin has already been initialised`;

    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup,
      moduleKey: curModule?.key,
      projKey: curProject?.key,
      module: curModule,
      useGpt,
      details,
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

  const renderMarginBottomComp = (serviceName: string) => {
    return (
      <>
        {moduleFuncs?.filter(
          (func) =>
            func.moduleKey == curModule?.key && func.funcGroup == serviceName
        ).length == 0 ? (
          <Margin height={0} />
        ) : (
          <Margin height={5} />
        )}
      </>
    );
  };

  useEffect(() => {
    let newSortedFuncs: any = {};
    let prefix = 'firestore/';
    moduleFuncs?.map((f: BFunc) => {
      if (
        f.moduleKey == BModuleType.Firebase &&
        f.funcGroup.includes('firestore')
      ) {
        let colName = f.funcGroup.slice(prefix.length);
        if (!newSortedFuncs[colName]) {
          newSortedFuncs[colName] = [];
        }
        newSortedFuncs[colName].push(f);
      }
    });
    setSortedFuncs(newSortedFuncs);
  }, [moduleFuncs]);

  let createFirebaseCol = async (col: string) => {
    let newCols = [...cols];
    newCols.push(col);
    let metadata = { ...curModule?.metadata, cols: newCols };
    await window.electron.setModuleMetadata({
      metadata: JSON.stringify(metadata),
      bModule: BModuleType.Firebase,
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata,
      })
    );
    setCreateColOpen(false);
  };

  // DELETE DB GROUP
  let deleteDbGroup = async (table: string) => {
    for (let i = 0; i < moduleFuncs!.length; i++) {
      let f = moduleFuncs![i];
      if (
        f.moduleKey == BModuleType.Firebase &&
        f.funcGroup == `firestore/${table}`
      ) {
        return;
      }
    }

    let newCols = [...cols];
    let index = newCols.findIndex((t: string) => t == table);
    newCols.splice(index, 1);
    let metadata = { ...curModule?.metadata, cols: newCols };
    await window.electron.setModuleMetadata({
      metadata: JSON.stringify(metadata),
      bModule: BModuleType.Firebase,
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata: { ...curModule?.metadata, cols: newCols },
      })
    );
  };

  const tooltipContent = (
    <div
      style={{
        fontSize: '12px',
        color: 'grey',
      }}
    >
      Delete all functions first
    </div>
  );

  return (
    <>
      {createColFuncOpen && (
        <CreateFuncModal
          onCreateClicked={createFunc}
          funcGroup={colSelected}
          setModalOpen={setCreateColFuncOpen}
        />
      )}
      {createColOpen && (
        <CreateFsColModal
          setModalOpen={setCreateColOpen}
          onCreateClicked={createFirebaseCol}
        />
      )}

      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">Firebase</h3>
        </div>
        <Margin height={10} />
        <div className="mainContainer">
          <FuncSection
            createFuncClicked={createFunc}
            title="Auth"
            funcGroup="auth"
            funcFilter={(func: BFunc) =>
              func.moduleKey == curModule?.key && func.funcGroup == 'auth'
            }
          />
          {renderMarginBottomComp('auth')}

          <div className="colHeader">
            <p className="title">Firestore</p>
            <Button
              className="folderAddBtn"
              type="text"
              onClick={() => setCreateColOpen(true)}
            >
              <MdCreateNewFolder className="icon folderAddIcon" />
            </Button>
          </div>
          {cols.map((col: string, index: number) => {
            return (
              <div key={index} className="funcGroupContainer">
                <div className="funcGroupHeader">
                  <p>{col}</p>
                  <Button
                    className="funcAddBtn"
                    type="text"
                    onClick={() => {
                      setCreateColFuncOpen(true);
                      setColSelected(`firestore/${col}`);
                    }}
                  >
                    <MdNoteAdd className="icon noteAddIcon" />
                  </Button>
                  <Tooltip
                    title={
                      sortedFuncs[col] &&
                      sortedFuncs[col].length > 0 &&
                      tooltipContent
                    }
                    color="white"
                  >
                    <span>
                      <Button
                        className="funcGroupBtn"
                        type="text"
                        onClick={() => deleteDbGroup(col)}
                        title="Tooltip Text"
                        disabled={
                          sortedFuncs[col] && sortedFuncs[col].length > 0
                        }
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          size="sm"
                          className="icon"
                        />
                      </Button>
                    </span>
                  </Tooltip>
                </div>
                {sortedFuncs[col] && <Margin height={5} />}
                {sortedFuncs[col] &&
                  sortedFuncs[col].map((f: BFunc) => {
                    return (
                      <FuncButton key={f.id} func={f} module={curModule} />
                    );
                  })}
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

export default FirebaseManager;
