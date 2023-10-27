import React, { useEffect, useState } from 'react';
import '@/renderer/styles/Project/CreateModule/CreateFirebase.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faCircle,
  faCodeBranch,
} from '@fortawesome/free-solid-svg-icons';

import { Button, Spin, Upload } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { BModuleType } from '@/shared/models/BModule';
import { addModule } from '@/renderer/redux/module/moduleSlice';
import { setCreateModuleOpen } from '@/renderer/redux/project/projectSlice';
import { RenFuncs } from '@/shared/utils/RenFuncs';

function CreateFirebaseModule({ setSelection, selection }: any) {
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
      type: selection,
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
    let newModule, newFuncs;
    if (selection == BModuleType.FirebaseAuth) {
      let res = await window.electron.createModule({
        projId: curProject?._id,
        projKey: curProject!.key,
        filePath,
        key: BModuleType.FirebaseAuth,
      });
      console.log('Back here:', res);
      newModule = res.newModule;
      newFuncs = res.newFuncs;
    } else if (selection == BModuleType.FirebaseFirestore) {
      let res = await window.electron.createModule({
        projId: curProject?._id,
        projKey: curProject!.key,
        filePath,
        key: BModuleType.FirebaseFirestore,
      });
      newModule = res.newModule;
    }

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
    <div className="createFirebase">
      <div className="headerBar">
        <button onClick={() => setSelection(null)}>
          <FontAwesomeIcon icon={faArrowLeft} className="icon" />
        </button>
        <p className="header">
          Create Firebase{' '}
          {selection === BModuleType.FirebaseAuth ? 'Auth' : 'Firestore'} module
        </p>
      </div>
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

export default CreateFirebaseModule;
