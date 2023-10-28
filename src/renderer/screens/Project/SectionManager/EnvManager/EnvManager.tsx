import '@/renderer/styles/Project/EnvManager/EnvManager.scss';
import { Button, Input, Spin } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons';
import { faCheck } from '@fortawesome/free-solid-svg-icons';
import { envConsts } from '@/renderer/misc/constants';
import { ProjectService } from '@/renderer/services/ProjectService';
import { LoadingOutlined } from '@ant-design/icons';

function EnvManager() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const [loading, setLoading] = useState(true);
  const [envVars, setEnvVars] = useState<any>([]);
  const [newEnv, setNewEnv] = useState({
    key: '',
    val: '',
  });

  const [createLoading, setCreateLoading] = useState(false);
  const [createErr, setCreateErr] = useState('');

  const init = async () => {
    let vars = await window.electron.getEnvVars({ projKey: curProject!.key });
    setEnvVars(vars);
    setLoading(false);
  };

  const saveEnvVar = async (key: string, val: string) => {
    let newEnvVars: any = [...envVars];

    let index = newEnvVars.findIndex((e: any) => e.key == key);
    setCreateErr('');
    if (val == envVars[index].value) return;

    await window.electron.editEnvVars({
      projId: curProject?._id,
      projKey: curProject!.key,
      key,
      val,
    });
    newEnvVars[index].value = val;
    setEnvVars(newEnvVars);
  };

  const createEnvVar = async () => {
    if (
      newEnv.key == '' ||
      newEnv.key.includes(' ') ||
      newEnv.val.includes(' ')
    )
      return;
    setCreateLoading(true);
    setCreateErr('');

    if (envVars.find((e: any) => e.key == newEnv.key)) {
      setCreateErr('Key already exists');
      setCreateLoading(false);
      return;
    }

    await window.electron.createEnvVar({
      projId: curProject!._id,
      projKey: curProject!.key,
      key: newEnv.key,
      val: newEnv.val,
    });

    setEnvVars([
      ...envVars,
      {
        key: newEnv.key,
        value: newEnv.val,
      },
    ]);

    setCreateLoading(false);
    setNewEnv({ key: '', val: '' });
  };

  const deleteEnvVar = async (key: string) => {
    setCreateErr('');
    await window.electron.deleteEnvVar({
      projId: curProject?._id,
      projKey: curProject!.key,
      key,
    });

    let newEnvVars = [...envVars];
    let index = newEnvVars.findIndex((e: any) => e.key == key);
    newEnvVars.splice(index, 1);
    setEnvVars(newEnvVars);
  };

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );
  }

  return (
    <div className="envManager">
      <div className="headerContainer">
        <p className="header">Environment</p>
        <p className="installHeader">Create new</p>
        <div className="createContainer">
          <Input
            value={newEnv.key}
            onChange={(e) => setNewEnv({ ...newEnv, key: e.target.value })}
            placeholder="key"
          />
          <Margin height={10} />
          <Input
            value={newEnv.val}
            onChange={(e) => setNewEnv({ ...newEnv, val: e.target.value })}
            placeholder="val"
          />
          <Margin height={10} />

          <Button loading={createLoading} type="primary" onClick={createEnvVar}>
            Create
          </Button>
          {createErr && (
            <>
              <p className="errorText">{createErr}</p>
              <Margin height={6} />
            </>
          )}
        </div>
      </div>
      <div className="middleContainer">
        <p className="header">Variables</p>
        {envVars.map((envVar: any, index: any) => (
          <EnvVarComponent
            key={index}
            envVar={envVar}
            saveEnvVar={saveEnvVar}
            deleteEnv={deleteEnvVar}
          />
        ))}
      </div>
    </div>
  );
}

export default EnvManager;

export const EnvVarComponent = ({ envVar, saveEnvVar, deleteEnv }: any) => {
  const [editing, setEditing] = useState(false);
  const [val, setVal] = useState('');
  const [error, setError] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);

  useEffect(() => {
    if (envVar.value) {
      setVal(envVar.value);
    }
  }, [editing]);

  const onDoneClicked = async () => {
    if (editing) {
      if (val.indexOf(' ') !== -1) {
        setError(true);
        return;
      }
      setSaveLoading(true);
      await saveEnvVar(envVar.key, val);
      setSaveLoading(false);
    }

    setError(false);

    setEditing((prev) => !prev);
  };

  const deleteClicked = async () => {
    setDeleteLoading(true);
    await deleteEnv(envVar.key);
    setDeleteLoading(false);
    setEditing(false);
  };

  const deleteDisabled = () => {
    for (const key in envConsts) {
      if (envConsts.hasOwnProperty(key) && envConsts[key] === envVar.key) {
        return true;
      }
    }
    return false;
  };

  return (
    <div className="envVarContainer">
      <div className="row1">
        <p className="keyVal">{envVar.key}</p>
        <Button onClick={() => onDoneClicked()} type="text" className="editBtn">
          {saveLoading ? (
            <LoadingOutlined />
          ) : editing ? (
            // <p>Save</p>
            <FontAwesomeIcon icon={faCheck} className="icon" />
          ) : (
            <FontAwesomeIcon icon={faPen} className="icon" />
          )}
        </Button>
      </div>
      <Margin height={8} />
      {editing && (
        <div className="row2">
          <Input
            value={val}
            onChange={(e) => {
              setVal(e.target.value);
            }}
            status={`${error ? 'error' : ''}`}
          />
          <Margin width={15} />
          <Button
            onClick={deleteClicked}
            disabled={deleteDisabled()}
            type="text"
            className="deleteBtn"
          >
            {deleteLoading ? (
              <LoadingOutlined />
            ) : (
              <FontAwesomeIcon icon={faTrash} />
            )}
          </Button>
        </div>
      )}
    </div>
  );
};
