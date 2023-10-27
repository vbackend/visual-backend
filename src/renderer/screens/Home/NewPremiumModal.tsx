import Margin from '@/renderer/components/general/Margin';
import {
  faCheck,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import {HiSparkles} from 'react-icons/hi';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import '@/renderer/styles/Home/NewPremiumModal.scss';

function NewPremiumModal({ setModalOpen }: any) {
  return (
    <div className="modalBackground newPremiumModal">
      <div className="contentContainer">
        <div className="topBar">
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" className="icon" />
          </button>
        </div>
        <div className="middleContainer">
          <div className="title">
            <HiSparkles className="icon" />
            Welcome to the <span>premium</span> version of Visual Backend
          </div>
          <Margin height={20} />
          <p className="thankYouTxt">
            Thank you for your support, it makes what we do here worth it. Enjoy
            the new features available to you!
          </p>
          <Margin height={25} />

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
              <p className="text">Unlimited kickstart with AI uses</p>
            </div>

            <div className="row">
              <FontAwesomeIcon icon={faCheck} className="icon" />
              <p className="text">Create unlimited projects</p>
            </div>
          </div>
          <Margin height={20} />
        </div>
      </div>
    </div>
  );
}

export default NewPremiumModal;
