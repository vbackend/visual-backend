import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Dispatch, SetStateAction, useState } from 'react';
import '@/renderer/styles/Home/CreateProjectModal.scss';
import { Button, Input } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { ProjectService } from '@/renderer/services/ProjectService';
import { useDispatch } from 'react-redux';
import {
  AppPage,
  addProject,
  setCurPage,
  setCurrentProject,
} from '@/renderer/redux/app/appSlice';
import { projWindowSize } from '@/renderer/misc/constants';

type CreateProjectModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};
function CreateProjectModal({ setModalOpen }: CreateProjectModalProps) {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState('');

  const createClicked = async () => {
    setLoading(true);
    setErrorText('');
    try {
      let { data } = await ProjectService.createProject(name);

      // 2. Create project DB file
      let projKey = data.key;
      let projId = data._id;
      let projAccessToken = data.projectAccessToken;

      let { error } = await window.electron.createProject({
        projId,
        projAccessToken,
        projKey,
      });
      if (error) {
        throw error;
      }

      dispatch(addProject({ ...data }));
      window.electron.setWindowSize(projWindowSize);
      dispatch(setCurrentProject(data));
      dispatch(setCurPage(AppPage.Project));
      setModalOpen(false);
    } catch (error: any) {
      // conflict
      if (error.response.status == 409) {
        setErrorText('Project name already taken');
      } else {
        setErrorText('Failed to create project');
      }
    }
    setLoading(false);
  };

  return (
    <div className="modalBackground createProjModal">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Create Project</p>
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>
        <div className="middleBar">
          <div className="inputTitle">Project Name</div>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
          />
          <Margin height={20} />
        </div>
        <Margin height={5} />
        <Button
          loading={loading}
          onClick={createClicked}
          className="modalActionBtn"
          type="primary"
        >
          Create
        </Button>
        {errorText && <p className="errorText">{errorText}</p>}
        {loading && (
          <p className="btnText">
            This may take a while. Please don't close the app
          </p>
        )}
      </div>
    </div>
  );
}

export default CreateProjectModal;
