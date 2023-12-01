import { Dispatch, SetStateAction, useState } from 'react';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Select } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { ProjectService } from '@/renderer/services/ProjectService';
import { useDispatch, useSelector } from 'react-redux';
import { addProject } from '@/renderer/redux/app/appSlice';
import { RootState } from '@/renderer/redux/store';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { ProjectFuncs, ProjectType } from '@/shared/models/project';

import '@/renderer/styles/Home/CreateProjectModal.scss';

type CreateProjectModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};

function CreateProjectModal({ setModalOpen }: CreateProjectModalProps) {
  const dispatch = useDispatch();
  const editorToUse = useSelector((state: RootState) => state.app.editorToUse);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [projectType, setProjectType] = useState<string | ProjectType>(
    ProjectType.Express
  );

  let projectTypes = [
    {
      value: ProjectType.Express,
      text: 'Node.js Express',
    },
    {
      value: ProjectType.FastAPI,
      text: 'Python FastAPI',
    },
  ];

  const createClicked = async () => {
    setLoading(true);
    setErrorText('');

    try {
      let binRes = await window.electron.checkBinInstalled(projectType);
      if (binRes.error) {
        setErrorText(binRes.error);
        setLoading(false);
        return;
      }

      let { data } = await ProjectService.createProject(name, projectType);

      // 2. Create project DB file
      let projKey = ProjectFuncs.getKey(name);
      let { error } = await window.electron.createProject({
        projKey,
        projectType,
      });

      if (error) {
        throw error;
      }

      dispatch(addProject({ ...data }));
      RenFuncs.openProject(data, dispatch, editorToUse);

      setModalOpen(false);
    } catch (error: any) {
      // conflict
      if (error.response && error.response.status == 409) {
        setErrorText('Project name already taken');
      } else if (projectType == ProjectType.FastAPI) {
        setErrorText(error);
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
          <Margin height={15} />
          <>
            <p className="inputTitle">Type</p>

            <Select
              defaultActiveFirstOption
              className="dbSelect"
              options={projectTypes}
              value={projectType}
              onChange={(val: string) => setProjectType(val)}
            />
          </>
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
