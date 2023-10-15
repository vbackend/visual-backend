import { faXmark } from '@fortawesome/pro-solid-svg-icons';
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
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import {
  ProjectTab,
  setCurrentTab,
} from '@/renderer/redux/project/projectSlice';
import { deleteModule } from '@/renderer/redux/module/moduleSlice';

function DeleteModuleModal({ module, setModalOpen }: any) {
  let inputRef: any = useRef(null);
  const dispatch = useDispatch();
  const curFile = useSelector((state: RootState) => state.editor.currentFile);
  const curModule = useSelector((state: RootState) => state.module.curModule);

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
      await window.electron.deleteModule({
        module: module,
        projKey: curProject!.key,
        projId: curProject?._id,
      });

      if (
        curFile &&
        curFile.metadata.type == EditorType.Func &&
        module.key == curFile.metadata.moduleKey
      ) {
        dispatch(setCurFile(null));
      }

      if (curModule?.key == module.key) {
        dispatch(setCurrentTab(ProjectTab.Routes));
      }

      dispatch(deleteModule(module));
    } catch (error) {
      setErrText('Failed to delete project');
    }
    setModalOpen(false);
    setDeleteLoading(false);
  };
  return (
    <div className="modalBackground deleteProject">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Delete Module</p>
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>

        <div className="middleBar">
          <p className="description">
            Please type the following prompt to delete this module. All
            functions inside it will be deleted as well.
          </p>
          <p className="projectKeyTxt">{module.key}</p>
          <Input
            onChange={(e) => {
              if (e.target.value === module.key) {
                setDisabled(false);
              } else {
                setDisabled(true);
              }
            }}
            ref={inputRef}
            placeholder={`${module.key}`}
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
        {/* {deleteLoading && (
          <p className="btnText">
            This may take a while. Please don't close the app
          </p>
        )} */}
      </div>
    </div>
  );
}

export default DeleteModuleModal;
