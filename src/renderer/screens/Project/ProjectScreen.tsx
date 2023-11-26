import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import '../../styles/Project/ProjectScreen.scss';
import {
  initialiseProject,
  setShowTerm,
} from 'renderer/redux/project/projectSlice';
import Sidebar from './Sidebar/Sidebar';
import CreateModuleModal from './SectionManager/Modules/CreateModule/CreateModuleModal';
import { initModules } from '@/renderer/redux/module/moduleSlice';
import SectionManager from './SectionManager/SectionManager';
import EditorScreen from './EditorScreen/EditorScreen';
import { initRoutes } from '@/renderer/redux/routes/routesSlice';
import TerminalComponent from './Terminal/Terminal';
import useShortcut from '@/renderer/hooks/useShortcut';
import { Spin } from 'antd';
import { resetCloudState } from '@/renderer/redux/cloud/cloudSlice';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { AppPage, Editor, setCurPage } from '@/renderer/redux/app/appSlice';
import { useHotkeys } from 'react-hotkeys-hook';

function ProjectScreen() {
  const dispatch = useDispatch();
  const app = useSelector((state: RootState) => state.app);
  const project = useSelector((state: RootState) => state.project);
  const [loading, setLoading] = useState(true);
  const [loadingErr, setLoadingErr] = useState(false);
  const showTerm = useSelector((state: RootState) => state.project.showTerm);
  const editorToUse = useSelector((state: RootState) => state.app.editorToUse);

  let initProject = async () => {
    let project = app.currentProject;
    if (!project) {
      dispatch(setCurPage(AppPage.Project));
      return;
    }

    let data = await window.electron.initProject({
      projectId: project!._id,
      projKey: project.key,
    });

    dispatch(setCurFile(null));
    dispatch(initRoutes(data));
    dispatch(initialiseProject(data));
    dispatch(initModules(data));
    dispatch(resetCloudState(null));
    setLoading(false);
  };

  useShortcut('t', () => {
    if (!showTerm) {
      dispatch(setShowTerm(true));
    }
  });

  useEffect(() => {
    initProject();
  }, []);

  if (loadingErr)
    return (
      <div className="emptyContainer">
        Failed to load project. Try again later.
      </div>
    );

  if (loading)
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );
  return (
    <>
      {project.createModuleOpen && <CreateModuleModal />}

      <div className="projectScreen">
        <Sidebar />
        <SectionManager />
        { editorToUse == Editor.VISUALBACKEND? (
          <EditorScreen />
        ) : (
          <div
            className="emptyContainer"
            style={{ flexDirection: 'column', textAlign: 'justify' }}
          >
            <div>
              <p style={{ marginBottom: '6px', fontWeight: '600' }}>
                Project is opened in {editorToUse}
              </p>
              <p>
                {'1. Use node version <= 18.18.1'}
                <br />
                {'2. Run server with npm run dev'}
              </p>
            </div>
          </div>
        )}
        {showTerm && <TerminalComponent />}
      </div>
    </>
  );
}

export default ProjectScreen;
