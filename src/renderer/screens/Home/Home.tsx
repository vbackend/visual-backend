import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  AppPage,
  setCurPage,
  setCurrentProject,
  setProjects,
  setUser,
} from '../../redux/app/appSlice';
import { Project } from '@/shared/models/project';
import { RootState } from '../../redux/store';
import { Button, Input, Spin } from 'antd';
import Margin from '../../components/general/Margin';
import { UserService } from '../../services/UserService';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import CreateProjectModal from './CreateProjectModal';
import { projWindowSize } from '../../misc/constants';
import UpgradeModal from './UpgradeModal';
import { AccountTier, SubStatus } from '@/shared/models/User';
import NewPremiumModal from './NewPremiumModal';
import LogoImg from '@/shared/assets/images/logo.png';

import { LuBadge } from 'react-icons/lu';

import { faPlus, faUser } from '@fortawesome/free-solid-svg-icons';
import {
  faCircleUser,
  faExclamationCircle,
  faFileInvoice,
} from '@fortawesome/free-solid-svg-icons';

import { format } from 'date-fns';
import RequireUpgradeModal from './RequireUpgradeModal';

import '@/renderer/styles/Home/Home.scss';
import HomeSidebar from './HomeSidebar';

function HomeScreen() {
  const dispatch = useDispatch();
  const loggedIn = useSelector((state: RootState) => state.app.loggedIn);
  const projects = useSelector((state: RootState) => state.app.projects);

  const user = useSelector((state: RootState) => state.app.user);

  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [portalLoading, setPortalLoading] = useState(false);
  const [errText, setErrText] = useState('');

  const projectClicked = (project: Project) => {
    window.electron.setWindowSize(projWindowSize);
    dispatch(setCurrentProject(project));
    dispatch(setCurPage(AppPage.Project));
  };

  const manageAccountClicked = async () => {
    setErrText('');
    setPortalLoading(true);
    try {
      await window.electron.openPortalPage({});
    } catch (error) {
      setErrText('Failed to open page');
    }

    setPortalLoading(false);
  };

  const [requireUpgradeModalOpen, setRequireUpgradeModalOpen] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);
  const [newPremiumModalOpen, setNewPremiumModalOpen] = useState(false);

  const init = async () => {
    setLoading(true);

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
  const logout = async () => {
    await window.electron.deleteAuthTokens();
    dispatch(setCurPage(AppPage.Auth));
  };

  useEffect(() => {
    init();
  }, []);

  useEffect(() => {
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

  const getSubText = () => {
    if (user.accountTier != AccountTier.Premium) return <></>;
    else {
      return (
        <div className="profileContainer">
          {user.subscription.status == SubStatus.PastDue ? (
            <p className="failedTxt">
              <FontAwesomeIcon icon={faExclamationCircle} className="icon" />
              Payment failed, please update account
            </p>
          ) : user.subscription.status == SubStatus.Active ? (
            <p>
              {`Premium renews on:`}
              <br />
              {format(new Date(user.subscription.nextBillDate), 'd MMM yyyy')}
            </p>
          ) : user.subscription.status == SubStatus.Cancelled ? (
            <p>
              {`Premium ending on: ${format(
                new Date(user.subscription.nextBillDate),
                'd MMM yyyy'
              )}`}
            </p>
          ) : (
            <></>
          )}
        </div>
      );
    }
  };

  const createBtnClicked = () => {
    setCreateModalOpen(true);
    // if (user.accountTier == AccountTier.Starter && projects.length > 0) {
    //   setRequireUpgradeModalOpen(true);
    // } else {
    // }
  };

  const [checkUpdateResult, setCheckUpdateResult] = useState(null);

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
      <div className="homeContainer">
        {/* SIDEBAR */}
        <HomeSidebar />

        {/* CONTENT */}
        <div className="middleBar">
          <Margin height={10} />
          <div className="mainContainer">
            <div className="projectsContainer">
              <p className="openProjectTxt">Open project: </p>
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
