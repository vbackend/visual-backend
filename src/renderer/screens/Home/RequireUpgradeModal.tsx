import Margin from '@/renderer/components/general/Margin';
import { faXmark, faRocket } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { LoadingOutlined } from '@ant-design/icons';

import React, { useState } from 'react';

function RequireUpgradeModal({ setModalOpen }: any) {
  const [checkoutLoading, setCheckoutLoading] = useState(false);

  const onUpgradeClicked = async () => {
    if (checkoutLoading) return;
    setCheckoutLoading(true);
    await window.electron.openCheckoutPage({});
    setCheckoutLoading(false);
  };

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
          <p>
            To create more than 5 projects, you need to have a premium account.
          </p>
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
        </div>
      </div>
    </div>
  );
}

export default RequireUpgradeModal;
