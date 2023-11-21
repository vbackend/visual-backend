import { faCheck, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { useEffect, useState } from 'react';
import '@/renderer/styles/Home/UpgradeModal.scss';
import Margin from '@/renderer/components/general/Margin';
import { faRocket } from '@fortawesome/free-solid-svg-icons';
import { LoadingOutlined } from '@ant-design/icons';

function UpgradeModal({ setModalOpen }: any) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [errText, setErrText] = useState('');
  const onUpgradeClicked = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    setErrText('');

    try {
      await window.electron.openCheckoutPage({});
    } catch (error) {
      setErrText('Failed to open page');
    }

    setCheckoutLoading(false);
  };

  useEffect(() => {
    const handleCheckoutStatus = (event: any, payload: any) => {
      setCheckoutLoading(false);
    };

    window.electron.onCheckoutStatusUpdated(handleCheckoutStatus);

    return () => {
      window.electron.removeCheckoutStatusListener();
    };
  }, [checkoutLoading]);

  return (
    <div className="modalBackground upgradeModal">
      <div className="contentContainer">
        <div className="topBar">
          <div className="title">
            Upgrade to <span>premium</span>
          </div>
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" className="icon" />
          </button>
        </div>
        <Margin height={5} />
        <div className="middleContainer">
          <div className="benefitsContainer">
            <div className="row">
              <FontAwesomeIcon icon={faCheck} className="icon" />
              <p className="text">Access to all integrations</p>
            </div>

            <div className="row">
              <FontAwesomeIcon icon={faCheck} className="icon" />
              <p className="text">Access to hosting</p>
            </div>

            <div className="row">
              <FontAwesomeIcon icon={faCheck} className="icon" />
              <p className="text">Access to kickstart with AI</p>
            </div>
          </div>
          <Margin height={20} />

          <button onClick={onUpgradeClicked} className="upgradeBtn">
            {checkoutLoading ? (
              <LoadingOutlined />
            ) : (
              <>
                <FontAwesomeIcon icon={faRocket} className="icon" />
                <p>Upgrade now</p>
              </>
            )}
          </button>
          {errText && (
            <p
              style={{
                width: '100%',
                textAlign: 'center',
              }}
              className="errorText"
            >
              {errText}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UpgradeModal;
