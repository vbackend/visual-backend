import React, { useEffect, useReducer, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import {
  ProjectTab,
  setCreateModuleOpen,
  setCurrentTab,
} from 'renderer/redux/project/projectSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faAdd,
  faArrowLeft,
  faCloud,
  faCube,
  faDatabase,
  faServer,
  faTrash,
} from '@fortawesome/free-solid-svg-icons';
import { faEnvira } from '@fortawesome/free-brands-svg-icons';
import Margin from 'renderer/components/general/Margin';
import '@/renderer/styles/Project/Sidebar/Sidebar.scss';
import { BModule } from '@/shared/models/BModule';
import { setCurModule } from '@/renderer/redux/module/moduleSlice';
import {
  AppPage,
  setCurPage,
  setCurrentProject,
} from '@/renderer/redux/app/appSlice';
// import { homeWindowSize } from '@/renderer/misc/constants';
import useShortcut from '@/renderer/hooks/useShortcut';
import DeleteProjectModal from '../DeleteProjectModal';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import DeleteModuleModal from '../SectionManager/Modules/General/DeleteModuleModal';
import { Divider } from 'antd';
import { homeWindowSize } from '@/renderer/misc/constants';
import { ProjectType } from '@/shared/models/project';

let moduleIndex = 2;

function Sidebar() {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  let modules = useSelector((state: RootState) => state.module.modules);
  let platform = useSelector((state: RootState) => state.app.curPlatform);
  let metaKey = RenFuncs.getMetaKey(platform);
  const curFile = useSelector((state: RootState) => state.editor.currentFile);

  const homeClicked = async () => {
    window.electron.setWindowSize(homeWindowSize);
    window.electron.killServer({});

    dispatch(setCurPage(AppPage.Home));
    dispatch(setCurrentProject(null));
  };

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteModuleModalOpen, setDeleteModuleModalOpen] = useState(false);
  const [deleteModule, setDeleteModule] = useState(null);

  useEffect(() => {
    const handleFuncDeleted = (event: any, payload: any) => {
      setDeleteModule(payload);
      setDeleteModuleModalOpen(true);
    };
    window.electron.onModuleDeleteClicked(handleFuncDeleted);

    return () => {
      window.electron.removeModuleDeleteClickedListener();
    };
  }, [curFile]);

  return (
    <>
      {deleteModuleModalOpen && (
        <DeleteModuleModal
          module={deleteModule}
          setModalOpen={setDeleteModuleModalOpen}
        />
      )}
      {deleteModalOpen && (
        <DeleteProjectModal setModalOpen={setDeleteModalOpen} />
      )}
      <div className="sidebarContainer">
        <div className="btnsContainer">
          <div className="row1">
            <button className="homeBtn" onClick={() => homeClicked()}>
              <FontAwesomeIcon icon={faArrowLeft} className="icon" />
            </button>
          </div>
          <div className="projectName">{curProject!.name}</div>
          <SidebarBtn
            shortcut="1"
            name="Routes"
            icon={faServer}
            tab={ProjectTab.Routes}
          />
          <SidebarBtn
            shortcut="2"
            name="Modules"
            icon={faDatabase}
            tab={ProjectTab.Module}
          />
          <SidebarBtn
            shortcut={`${moduleIndex + modules!.length}`}
            name="Hosting"
            icon={faCloud}
            tab={ProjectTab.Hosting}
            scale={0.9}
          />
          {/* {curProject?.projectType == ProjectType.Express && (
            <SidebarBtn
              shortcut={`${moduleIndex + modules!.length + 1}`}
              name="Packages"
              icon={faCube}
              tab={ProjectTab.Packages}
            />
          )} */}
          <SidebarBtn
            shortcut={`${moduleIndex + modules!.length + 2}`}
            name="Env"
            icon={faEnvira}
            tab={ProjectTab.Env}
          />
        </div>

        <div className="hintsContainer">
          <p className="title">Shortcuts:</p>
          <p className="infoText">{`Shortcuts start with ${metaKey}`}</p>
          <Margin height={10} />
          <p className="shortcutText">
            <span>T</span>: Toggle terminal
          </p>
          <p className="shortcutText">
            <span>K</span>: Clear terminal
          </p>
          {/* <p className="shortcutText">
            <span>Num</span>: Toggle sidebar
          </p> */}
          <Divider style={{ margin: '10px 0px', backgroundColor: '#eee' }} />
          <p className="shortcutText">
            <span>Shift + R/E</span>: <br /> Run/Stop server
          </p>
          {/* <p className="shortcutText">
            <span>Shift + E</span>: Stop server
          </p> */}
          <button
            className="deleteBtn"
            onClick={() => setDeleteModalOpen(true)}
          >
            <FontAwesomeIcon className="icon" icon={faTrash} />
            <Margin width={8} />
            Delete Project
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;

const SidebarBtn = ({ tab, name, icon, scale = 1.0, shortcut }: any) => {
  const dispatch = useDispatch();
  const curTab = useSelector((state: RootState) => state.project.currentTab);
  let modules = useSelector((state: RootState) => state.module.modules);
  let curModule = useSelector((state: RootState) => state.module.curModule);

  useShortcut(shortcut, () => {
    setCurTab(tab);
  });

  const setCurTab = (tab: ProjectTab) => {
    if (tab != ProjectTab.Module) {
      dispatch(setCurrentTab(tab));
    }
  };

  const createModuleClicked = () => {
    dispatch(setCreateModuleOpen(true));
  };

  return (
    <>
      <div
        key={tab}
        className={`sidebarBtn ${
          curTab === tab && tab != ProjectTab.Module && 'curSidebarBtn'
        }`}
        onClick={() => setCurTab(tab)}
      >
        <div className="left">
          <div className="iconContainer">
            <FontAwesomeIcon
              icon={icon}
              className="icon"
              style={{ transform: `scale(${scale})` }}
            />
          </div>
          <p className="name">{name}</p>
        </div>
        {tab == ProjectTab.Module && (
          <div className="right">
            <button onClick={createModuleClicked}>
              <FontAwesomeIcon icon={faAdd} className="addIcon" />
            </button>
          </div>
        )}
      </div>
      {tab == ProjectTab.Module && modules!.length > 0 && (
        <div className="moduleBtnsContainer">
          {modules &&
            modules.map((module: BModule, index) => (
              <ModuleButton key={module.key} index={index} module={module} />
            ))}
        </div>
      )}
    </>
  );
};

const ModuleButton = ({ index, module }: any) => {
  const dispatch = useDispatch();
  const btnRef: any = useRef(null);
  const curTab = useSelector((state: RootState) => state.project.currentTab);
  const curModule = useSelector((state: RootState) => state.module.curModule);

  const setModuleTab = (mod: BModule) => {
    dispatch(setCurrentTab(ProjectTab.Module));
    dispatch(setCurModule(mod));
  };

  useShortcut(`${moduleIndex + index}`, () => {
    setModuleTab(module);
  });

  useEffect(() => {
    const handleContextMenu = async (e: any) => {
      if (btnRef.current.contains(e.target)) {
        e.preventDefault();
        await window.electron.showModuleContextMenu(module);
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      key={index}
      onClick={() => setModuleTab(module)}
      className={`moduleBtn ${
        curTab == ProjectTab.Module &&
        curModule?.key == module.key &&
        'moduleBtnActive'
      }`}
    >
      {module.key}
    </button>
  );
};
