import React, { useEffect, useRef, useState } from 'react';
import {
  addFunc,
  deleteFunc,
  setMongoData,
} from '@/renderer/redux/module/moduleSlice';
import { Button, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { RootState } from '@/renderer/redux/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Margin from '@/renderer/components/general/Margin';
import { faAdd, faRefresh } from '@fortawesome/pro-solid-svg-icons';
import CreateMongoFuncModal from './CreateMongoFuncModal';
import 'renderer/styles/Project/Modules/MongoModule/ManageMongo.scss';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import { faFilePlus } from '@fortawesome/pro-duotone-svg-icons';
import CreateFuncModal from '../FirebaseModule/CreateFuncModal';
import { BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { FuncButton } from '../General/FuncButton';

function ManageMongo() {
  const dispatch = useDispatch();
  const module = useSelector((state: RootState) => state.module.curModule);
  const mongoData = useSelector((state: RootState) => state.module.mongo);

  const funcs = useSelector((state: RootState) => state.module.funcs);
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);

  const [sortedFuncs, setSortedFuncs] = useState<{
    [key: string]: Array<BFunc>;
  } | null>(null);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [col, setCol] = useState('');
  const [err, setErr] = useState(false);

  const sortFuncsByCol = (cols: Array<string>) => {
    let newSortedFuncs: { [key: string]: Array<BFunc> } = {};
    cols.map((col) => {
      newSortedFuncs[col] = [];
    });

    funcs!.map((func: BFunc) => {
      if (func.moduleKey == 'mongo') newSortedFuncs[func.funcGroup].push(func);
    });

    setSortedFuncs(newSortedFuncs);
  };

  const getDbFuncs = async () => {
    if (mongoData.cols != null) {
      sortFuncsByCol(mongoData.cols);
      return;
    }
    let { connString, defaultDb } = module?.metadata;

    let { error, cols } = await window.electron.getMongoCols({
      connString,
      dbName: defaultDb,
    });

    if (error) {
      setErr(true);
      return;
    }

    dispatch(setMongoData({ cols }));
    sortFuncsByCol(cols);
  };

  useEffect(() => {
    if (mongoData.cols) {
      sortFuncsByCol(mongoData.cols!);
    }
  }, [funcs]);

  useEffect(() => {
    getDbFuncs();
  }, []);

  const createMongoFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setCreateLoading: any
  ) => {
    let details = `collection name: ${col}`;
    setCreateLoading(true);

    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup: col,
      moduleKey: BModuleType.Mongo,
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

  if (err) {
    return (
      <div className="emptyContainer">
        <p>Failed to connect to mongodb cluster</p>
      </div>
    );
  }
  if (mongoData.cols === null || sortedFuncs === null)
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );

  return (
    <>
      {createModalOpen && (
        <CreateFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createMongoFunc}
          type={`mongodb ${col}`}
        />
        // <CreateMongoFuncModal setModalOpen={setCreateModalOpen} col={col} />
      )}
      <div className="mongoScreen">
        <div className="headerContainer">
          <h3 className="title">MongoDB</h3>
        </div>
        <div className="infoContainer">
          <p>The following global variables are available:</p>
          <Margin height={10} />
          <div className="variableContainer">
            <p className="varName">mongoCli: </p>
            <p>MongoClient</p>
          </div>
          <div className="variableContainer">
            <p className="varName">defaultDb: </p>
            <p>{`mongoCli.db('${module?.metadata.defaultDb}')`}</p>
          </div>
          {/* <Margin height={10} />
          <div className="variableContainer">
            Note: Your functions are grouped according to the collections in
            your default db
          </div> */}
        </div>

        <div className="mainContainer">
          <div className="colHeader">
            <p className="title">Collections</p>
          </div>
          {mongoData.cols &&
            mongoData.cols.map((col, index) => (
              <div key={index} className="funcGroupContainer">
                <div className="funcGroupHeader">
                  <p>{col}</p>
                  <Button
                    className="funcGroupBtn createFuncBtn"
                    type="text"
                    onClick={() => {
                      setCol(col);
                      setCreateModalOpen(true);
                    }}
                  >
                    <FontAwesomeIcon icon={faFilePlus} />
                  </Button>
                </div>
                {sortedFuncs[col] &&
                  sortedFuncs[col].map((func: BFunc, index: number) => (
                    <FuncButton func={func} module={curModule} />
                  ))}
              </div>
            ))}
        </div>
      </div>
    </>
  );
}

export default ManageMongo;
