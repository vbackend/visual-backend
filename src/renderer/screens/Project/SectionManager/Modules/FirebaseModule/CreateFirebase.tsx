import { useEffect, useState } from 'react';
import CreateModalHeader from '../General/CreateModalHeader';
import Margin from '@/renderer/components/general/Margin';
import { RootState } from '@/renderer/redux/store';
import { faCodeBranch, faCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Upload, Button, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';

function CreateFirebase({ setSelection, selection }: any) {
  const dispatch = useDispatch();
  let curProject = useSelector((state: RootState) => state.app.currentProject);

  const [loading, setLoading] = useState(true);
  const [errText, setErrText] = useState('');
  const [connectedProj, setConnectedProj] = useState('');
  const [filePath, setFilePath] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [curFirebase, setCurFirebase] = useState('');

  const onUpload = async (file: any) => {
    let { projId, error } = await window.electron.checkFirebaseCredentials({
      filePath: file.path,
      projKey: curProject?.key,
    });

    if (error) {
      setConnectedProj('');
      setFilePath('');
      setErrText(error);
    } else {
      setConnectedProj(projId);
      setErrText('');
      setFilePath(file.path);
    }

    return false;
  };

  const onCreate = async () => {
    setCreateLoading(true);

    let { newModule, newFuncs } = await window.electron.createModule({
      projId: curProject?._id,
      projKey: curProject!.key,
      filePath,
      key: BModuleType.Firebase,
    });

    setCreateLoading(false);
    RenFuncs.createModuleSuccess(dispatch, newModule, newFuncs);
  };

  const getCurFirebaseProject = async () => {
    let projectId = await window.electron.getCurrentFirebase({
      projKey: curProject?.key,
    });

    if (!projectId) {
      setLoading(false);
      return;
    }

    setCurFirebase(projectId);

    let { projId, error } = await window.electron.checkFirebaseCredentials({
      filePath: null,
      type: selection,
      projKey: curProject?.key,
    });

    if (error) {
      setConnectedProj('');
      setErrText(error);
    } else {
      setConnectedProj(projId);
      setErrText('');
    }
    setLoading(false);
  };

  useEffect(() => {
    getCurFirebaseProject();
  }, []);

  if (loading) {
    return (
      <div className="emptyContainer" style={{ height: '200px' }}>
        <Spin />
      </div>
    );
  }
  return (
    <div className="createModule createFirebase">
      <CreateModalHeader setSelection={setSelection} title="Firebase" />
      <div className="middleBar">
        {curFirebase != '' ? (
          <>
            <div className="firebaseConnected">
              <FontAwesomeIcon icon={faCodeBranch} className="icon" />
              {`Firebase already initialised:`}
              <br />
              <p>{curFirebase}</p>
            </div>
            <div className="projectStatusContainer">
              <FontAwesomeIcon
                icon={faCircle}
                className={`statusIcon ${
                  errText ? 'statusIconError' : 'statusIconSuccess'
                }`}
                size="xs"
              />
              <p className={`text`}>
                {errText ? errText : `Successfully connected`}
              </p>
            </div>
          </>
        ) : (
          <>
            <p className="inputTitle">Upload credentials.json file</p>
            <Upload
              className="firebaseUpload"
              maxCount={1}
              beforeUpload={onUpload}
              accept=".json"
            >
              <Button>Upload</Button>
            </Upload>

            <Margin height={20} />
            <div className="projectStatusContainer">
              <FontAwesomeIcon
                icon={faCircle}
                className={`statusIcon ${
                  errText
                    ? 'statusIconError'
                    : connectedProj
                    ? 'statusIconSuccess'
                    : 'statusIconEmpty'
                }`}
                size="xs"
              />
              <p className={`text`}>
                {errText
                  ? errText
                  : connectedProj
                  ? `Connected project: ${connectedProj}`
                  : 'Firebase project not connected'}
              </p>
            </div>
          </>
        )}
      </div>
      <Margin height={20} />
      <Button
        loading={createLoading}
        onClick={onCreate}
        disabled={connectedProj == ''}
      >
        Create
      </Button>
    </div>
  );
}

export default CreateFirebase;
