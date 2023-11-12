import Margin from '@/renderer/components/general/Margin';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import {
  addFunc,
  addFuncs,
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
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { BFunc } from '@/shared/models/BFunc';
import { MdCreateNewFolder, MdNoteAdd } from 'react-icons/md';
import CreateSbTableModal from './CreateSbTableModal';
import { FuncButton } from '../General/FuncButton';
import CreateFuncModal from '../General/CreateFuncModal';

function SupabaseManager() {
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const dispatch = useDispatch();
  const moduleFuncs = useSelector((state: RootState) => state.module.funcs);

  const [createTableOpen, setCreateTableOpen] = useState(false);
  const [createTableFuncOpen, setCreateTableFuncOpen] = useState(false);
  const [tableSelected, setTableSelected] = useState('');

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

    let details = funcGroup.includes('database')
      ? `This module uses the supabase database service specifically, and interacts with the ${funcGroup.slice(
          funcGroup.indexOf('/') + 1
        )} table`
      : `This module uses the supabase ${funcGroup} service specifically`;
    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup,
      moduleKey: curModule?.key,
      projKey: curProject?.key,
      module: curModule,
      useGpt,
      details: details,
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

  let tables = curModule?.metadata.tables;

  const [sortedFuncs, setSortedFuncs] = useState<any>({});

  useEffect(() => {
    let newSortedFuncs: any = {};
    let prefix = 'database/';
    moduleFuncs?.map((f: BFunc) => {
      if (
        f.moduleKey == BModuleType.Supabase &&
        f.funcGroup.includes('database')
      ) {
        let tableName = f.funcGroup.slice(prefix.length);
        if (!newSortedFuncs[tableName]) {
          newSortedFuncs[tableName] = [];
        }
        newSortedFuncs[tableName].push(f);
      }
    });
    setSortedFuncs(newSortedFuncs);
  }, [moduleFuncs]);

  let createSupabaseTable = async (tableName: string) => {
    let newTable = [...tables];
    newTable.push(tableName);
    let metadata = { ...curModule?.metadata, tables: newTable };
    await window.electron.setModuleMetadata({
      metadata: JSON.stringify(metadata),
      bModule: BModuleType.Supabase,
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata,
      })
    );
    setCreateTableOpen(false);
  };

  // DELETE DB GROUP
  let deleteDbGroup = async (table: string) => {
    for (let i = 0; i < moduleFuncs!.length; i++) {
      let f = moduleFuncs![i];
      if (
        f.moduleKey == BModuleType.Supabase &&
        f.funcGroup == `database/${table}`
      ) {
        return;
      }
    }

    let newTables = [...tables];
    let index = newTables.findIndex((t: string) => t == table);
    newTables.splice(index, 1);
    let metadata = { ...curModule?.metadata, tables: newTables };
    await window.electron.setModuleMetadata({
      metadata: JSON.stringify(metadata),
      bModule: BModuleType.Supabase,
    });

    dispatch(
      setModuleMetadata({
        module: curModule,
        metadata: { ...curModule?.metadata, tables: newTables },
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
      {createTableFuncOpen && (
        <CreateFuncModal
          onCreateClicked={createFunc}
          funcGroup={tableSelected}
          setModalOpen={setCreateTableFuncOpen}
        />
      )}
      {createTableOpen && (
        <CreateSbTableModal
          setModalOpen={setCreateTableOpen}
          onCreateClicked={createSupabaseTable}
        />
      )}
      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">Supabase</h3>
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
          <FuncSection
            createFuncClicked={createFunc}
            funcGroup="storage"
            title="Storage"
            funcFilter={(func: BFunc) =>
              func.moduleKey == curModule?.key && func.funcGroup == 'storage'
            }
          />
          {renderMarginBottomComp('storage')}

          <div className="colHeader">
            <p className="title">Database</p>
            <Button
              className="folderAddBtn"
              type="text"
              onClick={() => setCreateTableOpen(true)}
            >
              <MdCreateNewFolder className="icon folderAddIcon" />
            </Button>
          </div>
          {tables.map((table: string, index: number) => {
            return (
              <div key={index} className="funcGroupContainer">
                <div className="funcGroupHeader">
                  <p>{table}</p>
                  <Button
                    className="funcAddBtn"
                    type="text"
                    onClick={() => {
                      setCreateTableFuncOpen(true);
                      setTableSelected(`database/${table}`);
                    }}
                  >
                    <MdNoteAdd className="icon noteAddIcon" />
                  </Button>
                  <Tooltip
                    title={
                      sortedFuncs[table] &&
                      sortedFuncs[table].length > 0 &&
                      tooltipContent
                    }
                    color="white"
                  >
                    <span>
                      <Button
                        className="funcGroupBtn"
                        type="text"
                        onClick={() => deleteDbGroup(table)}
                        title="Tooltip Text"
                        disabled={
                          sortedFuncs[table] && sortedFuncs[table].length > 0
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
                {sortedFuncs[table] && <Margin height={5} />}
                {sortedFuncs[table] &&
                  sortedFuncs[table].map((f: BFunc) => {
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

export default SupabaseManager;
