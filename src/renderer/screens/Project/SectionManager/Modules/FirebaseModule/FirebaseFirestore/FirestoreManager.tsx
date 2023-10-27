import Margin from '@/renderer/components/general/Margin';
import { RootState } from '@/renderer/redux/store';

import { LuFilePlus2} from 'react-icons/lu';

import {
  faFolderPlus,
  faPlus,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import '@/renderer/styles/Project/Modules/FirebaseModule/FirestoreManager.scss';
import { Button, Spin, Tooltip } from 'antd';
import CreateFsColModal from './CreateFsColModal';
import {
  addFunc,
  setModuleMetadata,
} from '@/renderer/redux/module/moduleSlice';
import CreateAuthFuncModal from '../CreateFuncModal';
import { BModuleType } from '@/shared/models/BModule';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { BFunc } from '@/shared/models/BFunc';
import { FuncButton } from '../../General/FuncButton';

function FirestoreManager() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const moduleFuncs = useSelector((state: RootState) => state.module.funcs);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [createColOpen, setCreateColOpen] = useState(false);
  const [colSelected, setColSelected] = useState('');

  let cols = curModule?.metadata.groups;

  const [sortedFuncs, setSortedFuncs] = useState<any>({});

  useEffect(() => {
    let newSortedFuncs: any = {};
    moduleFuncs?.map((f: BFunc) => {
      if (f.moduleKey == BModuleType.FirebaseFirestore) {
        if (!newSortedFuncs[f.funcGroup]) {
          newSortedFuncs[f.funcGroup] = [];
        }
        newSortedFuncs[f.funcGroup].push(f);
      }
    });
    setSortedFuncs(newSortedFuncs);
  }, [moduleFuncs]);

  let createFirestoreCol = async (colName: string) => {
    let newCols = [...cols];
    newCols.push(colName);
    let metadata = { ...curModule?.metadata, groups: newCols };
    await window.electron.setFirestoreMetadata({
      metadata: JSON.stringify(metadata),
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata,
      })
    );
    setCreateColOpen(false);
  };

  let createFirestoreFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setCreateLoading: any
  ) => {
    let details = `collection name: ${colSelected}`;
    setCreateLoading(true);

    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup: colSelected,
      moduleKey: BModuleType.FirebaseFirestore,
      projKey: curProject?.key,
      useGpt: useGpt,
      module: curModule,
      details,
    });

    setCreateLoading(false);

    if (error) {
      setErrText(error);
      return;
    }

    setErrText('');
    dispatch(addFunc(newFunc));
    dispatch(setCurFile(RenFuncs.getFuncFileData(newFunc, curModule!)));
    setCreateModalOpen(false);
  };

  let deleteCol = async (col: string) => {
    for (let i = 0; i < moduleFuncs!.length; i++) {
      let f = moduleFuncs![i];
      if (f.moduleKey == BModuleType.FirebaseFirestore && f.funcGroup == col) {
        return;
      }
    }

    let newCols = [...cols];
    let index = newCols.findIndex((c: string) => c == col);
    newCols.splice(index, 1);
    let metadata = { ...curModule?.metadata, groups: newCols };
    await window.electron.setFirestoreMetadata({
      metadata: JSON.stringify(metadata),
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata: { ...curModule?.metadata, groups: newCols },
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
      {createColOpen && (
        <CreateFsColModal
          setModalOpen={setCreateColOpen}
          onCreateClicked={createFirestoreCol}
        />
      )}
      {createModalOpen && (
        <CreateAuthFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createFirestoreFunc}
          type={`firestore ${colSelected}`}
        />
      )}
      <div className="moduleSection fbFirestoreScreen">
        <div className="headerContainer">
          <h3 className="title">Firestore</h3>
        </div>
        <div className="infoContainer">
          <p>The following global variables are available:</p>
          <Margin height={10} />
          <div className="variableContainer">
            <p className="varName">fs: </p>
            <p>Firestore Object</p>
          </div>
        </div>

        <div className="mainContainer">
          <div className="colHeader">
            <p className="title">Collections</p>
            <Button
              className="addBtn"
              type="text"
              onClick={() => setCreateColOpen(true)}
            >
              <FontAwesomeIcon icon={faFolderPlus} className="icon" />
            </Button>
          </div>
          {cols.map((col: string, index: number) => {
            return (
              <div key={index} className="funcGroupContainer">
                <div className="funcGroupHeader">
                  <p>{col}</p>
                  <Button
                    className="funcGroupBtn createFuncBtn"
                    type="text"
                    onClick={() => {
                      setCreateModalOpen(true);
                      setColSelected(col);
                    }}
                  >
                    <LuFilePlus2 />
                  </Button>
                  {/* <div className="deleteContainer"> */}
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
                        onClick={() => deleteCol(col)}
                        title="Tooltip Text"
                        disabled={
                          sortedFuncs[col] && sortedFuncs[col].length > 0
                        }
                      >
                        <FontAwesomeIcon icon={faTrash} />
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

export default FirestoreManager;
