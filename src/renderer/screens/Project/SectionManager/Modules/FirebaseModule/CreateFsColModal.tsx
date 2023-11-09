import Margin from '@/renderer/components/general/Margin';
import { setSomeModalOpen } from '@/renderer/redux/app/appSlice';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input } from 'antd';
import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

function CreateFsColModal({ setModalOpen, onCreateClicked }: any) {
  const dispatch = useDispatch();
  let [colName, setColName] = useState('');
  const [errText, setErrText] = useState('');
  useEffect(() => {
    dispatch(setSomeModalOpen(true));
    return () => {
      dispatch(setSomeModalOpen(false));
    };
  }, []);

  return (
    <div className="modalBackground createAuthFuncModal">
      <div className="contentContainer" style={{ minWidth: '350px' }}>
        <div className="topBar">
          <p className="title">Create new firestore collection</p>
          <button className="closeBtn" onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} className="icon" />
          </button>
        </div>
        <div className="middleContainer">
          <p className="inputTitle">Collection name</p>
          <Input
            value={colName}
            onChange={(e) => setColName(e.target.value)}
            placeholder="Name"
            className="input"
          />
        </div>
        <Margin height={20} />
        <Button
          onClick={() => onCreateClicked(colName, setErrText)}
          type="primary"
        >
          Create
        </Button>
        {errText && <p className="errorText">{errText}</p>}
      </div>
    </div>
  );
}

export default CreateFsColModal;
