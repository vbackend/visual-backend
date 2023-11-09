import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppPage,
  setCurPage,
  setCurrentProject,
  setOpenWithVs,
  setProjects,
  setUser,
} from '../../redux/app/appSlice';

import { Project } from '@/shared/models/project';
import { RootState } from '../../redux/store';
import { Button, Spin, Switch } from 'antd';
import Margin from '../../components/general/Margin';
import { UserService } from '../../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CreateProjectModal from './Modals/CreateProjectModal';
import { projWindowSizeNoVs, projWindowSizeVs } from '../../misc/constants';
import { AccountTier } from '@/shared/models/User';
import NewPremiumModal from './NewPremiumModal';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import RequireUpgradeModal from './RequireUpgradeModal';
import HomeSidebar from './HomeSidebar';
import VsCodeIcon from '@/shared/assets/images/vscode.png';

import '@/renderer/styles/Home/Home.scss';
import { NodeType } from '@/shared/models/NodeType';
import OpenWithVsModal from './Modals/OpenWithVsModal';
import { RenFuncs } from '@/shared/utils/RenFuncs';

function HomeScreen() {
  const dispatch = useDispatch();
  const projects = useSelector((state: RootState) => state.app.projects);
  const openWithVs = useSelector((state: RootState) => state.app.openWithVs);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [requireUpgradeModalOpen, setRequireUpgradeModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [newPremiumModalOpen, setNewPremiumModalOpen] = useState(false);
  const [openWithVsModal, setOpenWithVsModal] = useState(false);

  const [nodeType, setNodeType] = useState(null);

  const init = async () => {
    setLoading(true);
    setNodeType(await window.electron.getNodeType());
    dispatch(setOpenWithVs(await window.electron.getOpenWithVs()));

    try {
      let { data } = await UserService.getUser();
      dispatch(setUser(data));

      let res = await UserService.getProjects();
      dispatch(setProjects(res.data));
    } catch (error) {
      console.log('Failed to get user:', error);
      dispatch(setCurPage(AppPage.Auth));

      return;
    }
    setLoading(false);
  };

  useEffect(() => {
    init();

    // Manage redirect back to app after finish checkout
    const handleCheckoutStatus = async (event: any, payload: any) => {
      console.log('Received checkout status:', payload);
      setUpgradeModalOpen(false);

      try {
        let res = await UserService.getUser();
        let user = res.data;
        dispatch(setUser(user));

        if (user.accountTier == AccountTier.Premium) {
          setNewPremiumModalOpen(true);
        }
      } catch (error) {}
    };

    window.electron.onCheckoutStatusUpdated(handleCheckoutStatus);

    return () => {
      window.electron.removeCheckoutStatusListener();
    };
  }, []);

  const createBtnClicked = () => {
    setCreateModalOpen(true);
  };

  const projectClicked = (project: Project) => {
    RenFuncs.openProject(project, dispatch, openWithVs);
  };

  const switchClicked = async (val: boolean) => {
    if (val) {
      setOpenWithVsModal(val);
    } else {
      dispatch(setOpenWithVs(val));
      await window.electron.setOpenWithVs({ openWithVs: val });
    }
  };

  if (nodeType == NodeType.InvalidVersion || nodeType == NodeType.NotFound) {
    return (
      <div className="emptyContainer">
        <p style={{ maxWidth: '300px' }}>
          {nodeType == NodeType.InvalidVersion
            ? 'The default node version on your machine is invalid. Please use a node version <= 18.18.2'
            : 'Node could not be found on your machine. Please install node with version <= 18.18.2'}
        </p>
      </div>
    );
  }

  if (loading)
    return (
      <div className="emptyContainer">
        <Spin />
      </div>
    );
  return (
    <>
      {requireUpgradeModalOpen && (
        <RequireUpgradeModal setModalOpen={setRequireUpgradeModalOpen} />
      )}
      {newPremiumModalOpen && (
        <NewPremiumModal setModalOpen={setNewPremiumModalOpen} />
      )}
      {createModalOpen && (
        <CreateProjectModal setModalOpen={setCreateModalOpen} />
      )}
      {openWithVsModal && <OpenWithVsModal setModalOpen={setOpenWithVsModal} />}

      <div className="homeContainer">
        {/* SIDEBAR */}
        <HomeSidebar
          modalsOpen={createModalOpen || openWithVsModal || newPremiumModalOpen}
        />

        {/* CONTENT */}
        <div
          className={`middleBar ${
            createModalOpen || openWithVsModal || newPremiumModalOpen
              ? 'undraggable'
              : 'draggable'
          }`}
        >
          <Margin height={10} />
          <div className="mainContainer undraggable">
            <div className="projectsContainer ">
              <div className="topBar">
                <p className="openProjectTxt">Open project: </p>
                <div className="vsSwitchContainer">
                  {/* <img className="logoImg" src={VsCodeIcon} alt="vb-logo" /> */}
                  {/* <p>With VS Code</p> */}
                  <div className="vsImgContainer">
                    <p>With</p>
                    <img className="vsImg" src={VsCodeIcon} alt="vs-icon" />
                  </div>
                  <Margin height={5} />
                  <Switch onChange={switchClicked} checked={openWithVs} />
                </div>
              </div>

              {projects && projects.length === 0 && (
                <p className="noProjectsTxt">No projects created</p>
              )}
              {projects &&
                projects.map((project: Project, index: number) => (
                  <button
                    key={index}
                    className="projectBtn"
                    onClick={() => projectClicked(project)}
                  >
                    <p>{project.name}</p>
                    <p className="projKey">/{project.key}</p>
                  </button>
                ))}
            </div>

            <div className="bottomBar">
              <Button
                onClick={() => createBtnClicked()}
                type="primary"
                className="createBtn"
              >
                <FontAwesomeIcon icon={faPlus} />
                <Margin width={8} />
                Create new project
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default HomeScreen;
