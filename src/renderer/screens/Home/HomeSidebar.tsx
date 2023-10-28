import Margin from '@/renderer/components/general/Margin';
import { RootState } from '@/renderer/redux/store';
import { AccountTier, SubStatus } from '@/shared/models/User';
import {
  faCircleUser,
  faExclamationCircle,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import LogoImg from '@/shared/assets/images/logo.png';
import { format } from 'date-fns';
import { useState } from 'react';
import { AppPage, setCurPage } from '@/renderer/redux/app/appSlice';
import UpgradeModal from './UpgradeModal';

import { HiBadgeCheck } from 'react-icons/hi';
import { LuBadge } from 'react-icons/lu';
import '@/renderer/styles/Home/HomeSidebar.scss';

function HomeSidebar() {
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => state.app.user);
  const [errText, setErrText] = useState('');
  const [portalLoading, setPortalLoading] = useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = useState(false);

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

  const logout = async () => {
    await window.electron.deleteAuthTokens();
    dispatch(setCurPage(AppPage.Auth));
  };

  return (
    <>
      {upgradeModalOpen && <UpgradeModal setModalOpen={setUpgradeModalOpen} />}
      <div className="leftBar">
        <div className="logoContainer">
          <img className="logoImg" src={LogoImg} alt="vb-logo" />
          <div className="logoTxt">Visual Backend</div>
        </div>
        <Margin height={15} />
        <div className="profileContainer">
          <FontAwesomeIcon icon={faCircleUser} className="icon" />
          <p>{user.email}</p>
        </div>
        <div className="profileContainer">
          {user.accountTier == 'starter' ? (
            <LuBadge className="icon" size={19} />
          ) : (
            <HiBadgeCheck className="icon badgeCheckIcon" size={19} />
          )}

          <p>
            {user.accountTier == 'starter'
              ? 'Starter Account'
              : 'Premium Account'}
          </p>
        </div>
        <Margin height={10} />
        <div className="right">
          {getSubText()}
          {errText && (
            <p
              className="errorText"
              style={{
                marginBottom: '10px',
                paddingTop: '0px',
              }}
            >
              {errText}
            </p>
          )}
          {user.accountTier == AccountTier.Premium ? (
            <Button
              className="homeBtn"
              type="primary"
              onClick={() => manageAccountClicked()}
              loading={portalLoading}
            >
              Manage Subscription
            </Button>
          ) : (
            <Button
              className="homeBtn"
              type="primary"
              onClick={() => setUpgradeModalOpen(true)}
            >
              Upgrade
            </Button>
          )}
          <Button className="homeBtn" type="default" onClick={logout}>
            Sign Out
          </Button>
        </div>
        {/* <p>
              Update result: {checkUpdateResult ? checkUpdateResult : 'checking'}
            </p> */}
      </div>
    </>
  );
}

export default HomeSidebar;
