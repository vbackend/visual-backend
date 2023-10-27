import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from 'antd';
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';
import '@/renderer/styles/Project/DeleteProjectModal.scss';
import Margin from '@/renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { ProjectService } from '@/renderer/services/ProjectService';
import {
  AppPage,
  removeProject,
  setCurPage,
} from '@/renderer/redux/app/appSlice';
import { useNavigate } from 'react-router-dom';

type DeleteProjectModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};

function DeleteProjectModal({ setModalOpen }: DeleteProjectModalProps) {
  let inputRef: any = useRef(null);
  const dispatch = useDispatch();

  const [deleteLoading, setDeleteLoading] = useState(false);
  const [disabled, setDisabled] = useState(true);
  const [errText, setErrText] = useState('');

  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const deleteBtnClicked = async () => {
    setDeleteLoading(true);
    setErrText('');

    try {
      await ProjectService.deleteProject(curProject!._id);
      await window.electron.deleteProject({ project: curProject! });

      //  Remove project from redux state
      dispatch(setCurPage(AppPage.Home));
    } catch (error) {
      setErrText('Failed to delete project');
    }

    setDeleteLoading(false);
  };
  return (
    <div className="modalBackground deleteProject">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Delete project </p>
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="middleBar">
          <p className="description">
            Please type the following prompt to delete this project
          </p>
          <p className="projectKeyTxt">{curProject!.key}</p>
          <Input
            onChange={(e) => {
              if (e.target.value === curProject!.key) {
                setDisabled(false);
              } else {
                setDisabled(true);
              }
            }}
            ref={inputRef}
            placeholder={`${curProject!.key}`}
          />
        </div>

        <Margin height={20} />
        <Button
          onClick={() => {
            deleteBtnClicked();
          }}
          disabled={disabled}
          type="primary"
          loading={deleteLoading}
        >
          Delete
        </Button>
        {errText && <p className="errorText">{errText}</p>}
        {deleteLoading && (
          <p className="btnText">
            This may take a while. Please don't close the app
          </p>
        )}
      </div>
    </div>
  );
}

export default DeleteProjectModal;
