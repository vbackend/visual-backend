import {
  faCheck,
  faCircle,
  faDotCircle,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';

import { Button } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import '@/renderer/styles/Home/OpenWithVsModal.scss';
import { setOpenWithVs } from '@/renderer/redux/app/appSlice';

type OpenWithVsModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
};
function OpenWithVsModal({ setModalOpen }: OpenWithVsModalProps) {
  const dispatch = useDispatch();
  const openWithVs = useSelector((state: RootState) => state.app.openWithVs);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [errorText, setErrorText] = useState('');
  const [requirements, setRequirements] = useState({
    codeReq: null,
  });

  const btnClicked = async () => {
    await window.electron.setOpenWithVs({ openWithVs: true });
    dispatch(setOpenWithVs(true));
    setModalOpen(false);
  };

  // const checkVsRequirementsMet = async () => {
  //   const reqs = await window.electron.checkVsRequirementsMet();

  //   setRequirements(reqs);
  // };

  // useEffect(() => {
  //   checkVsRequirementsMet();
  // }, []);

  return (
    <div className="modalBackground openWithVsModal">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Open projects with VS Code</p>
          <button onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} size="lg" />
          </button>
        </div>
        <div className="middleBar">
          <div className="inputTitle">Requirements:</div>
          <div className="requirementContainer">
            <p className="bulletIcon">1. </p>
            <p>Have "code" cli installed</p>
          </div>
          <div className="requirementContainer">
            <p className="bulletIcon">2. </p>
            <p>Set VS Code as default app for .ts extension</p>
          </div>

          <Margin height={15} />
          <div className="inputTitle">Note:</div>
          <div className="requirementContainer">
            <p>{"On VS, run server with 'npm run dev $PORT'"}</p>
          </div>
        </div>
        <Margin height={20} />
        <Button
          loading={loading}
          onClick={btnClicked}
          className="modalActionBtn"
          type="primary"
        >
          Confirm
        </Button>
        {errorText && <p className="errorText">{errorText}</p>}
        {loading && (
          <p className="btnText">
            This may take a while. Please don't close the app
          </p>
        )}
      </div>
    </div>
  );
}

export default OpenWithVsModal;
