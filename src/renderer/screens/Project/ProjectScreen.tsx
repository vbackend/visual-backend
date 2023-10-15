import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import '../../styles/Project/ProjectScreen.scss';
import { initialiseProject } from 'renderer/redux/project/projectSlice';
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
import { AppPage, setCurPage } from '@/renderer/redux/app/appSlice';
import { useHotkeys } from 'react-hotkeys-hook';

function ProjectScreen() {
  const dispatch = useDispatch();
  const app = useSelector((state: RootState) => state.app);
  const project = useSelector((state: RootState) => state.project);
  const [loading, setLoading] = useState(true);
  const [loadingErr, setLoadingErr] = useState(false);

  const [showTerm, setShowTerm] = useState(false);

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

  useShortcut('t', () => setShowTerm(!showTerm));

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
        <EditorScreen />
        {showTerm && <TerminalComponent />}
      </div>
    </>
  );
}

export default ProjectScreen;
