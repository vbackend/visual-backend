import { useEffect, useRef, useState } from 'react';
import Margin from '@/renderer/components/general/Margin';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { HiSparkles } from 'react-icons/hi';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Switch, Tooltip } from 'antd';
import '@/renderer/styles/Project/Modules/CreateFuncModal.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { AccountTier } from '@/shared/models/User';
import useShortcut from '@/renderer/hooks/useShortcut';
import useEscHook from '@/renderer/hooks/useEscClicked';
import { RenFuncs } from '@/shared/utils/RenFuncs';

function CreateFuncModal({ setModalOpen, onCreateClicked, funcGroup }: any) {
  let [funcName, setFuncName] = useState('');
  const [errText, setErrText] = useState('');
  const [useGpt, setUseGpt] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const user = useSelector((state: RootState) => state.app.user);
  const inputRef = useRef<any>(null);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  useEscHook(() => setModalOpen(false));
  return (
    <div className="modalBackground createFuncModal">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">{`Create ${curModule?.key} func`}</p>
          <button className="closeBtn" onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} className="icon" />
          </button>
        </div>
        <div className="middleContainer">
          <p className="inputTitle">Function name</p>
          <Input
            ref={inputRef}
            value={funcName}
            onChange={(e) => setFuncName(e.target.value)}
            placeholder="Name (should be camelCase)"
            className="input"
          />
          <Margin height={20} />
          <p className="inputTitle">
            <HiSparkles style={{ marginRight: '5px' }} />
            Kickstart with AI
          </p>
          <Tooltip
            title=""
            // title={
            //   user.accountTier == AccountTier.Starter
            //     ? 'Upgrade your account to use this feature'
            //     : ''
            // }
          >
            <Switch
              // disabled={user.accountTier == AccountTier.Starter}
              // checked={user.accountTier == AccountTier.Starter ? false : useGpt}
              checked={useGpt}
              onChange={(val) => setUseGpt(val)}
            />
          </Tooltip>
        </div>
        <Margin height={20} />
        <Button
          onClick={async () => {
            await onCreateClicked(
              funcName,
              setErrText,
              // user.accountTier == AccountTier.Starter ? false : useGpt,
              useGpt,
              setCreateLoading,
              funcGroup,
              setModalOpen
            );
          }}
          type="primary"
          loading={createLoading}
        >
          Create
        </Button>
        {errText && <p className="errorText">{errText}</p>}
      </div>
    </div>
  );
}

export default CreateFuncModal;
