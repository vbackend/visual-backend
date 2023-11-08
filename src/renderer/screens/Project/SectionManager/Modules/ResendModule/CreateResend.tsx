import { RootState } from '@/renderer/redux/store';
import { BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateModalHeader from '../General/CreateModalHeader';
import { Button, Input } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { envConsts } from '@/renderer/misc/constants';

function CreateResend({ setSelection, selection }: any) {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const [errText, setErrText] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [details, setDetails] = useState({
    apiKey: '',
  });

  const onCreate = async () => {
    setCreateLoading(true);

    let envData: any = {};
    envData[envConsts.RESEND_API_KEY] = details.apiKey;
    let { newModule, newFuncs, error } = await window.electron.createModule({
      key: selection,
      projId: curProject?._id,
      projKey: curProject?.key,
      ...envData,
    });

    if (error) {
      setCreateLoading(false);
      return;
    }

    setCreateLoading(false);
    RenFuncs.createModuleSuccess(dispatch, newModule, newFuncs);
  };

  const disabled = () => {
    return details.apiKey == '';
  };
  return (
    <div className="createModule">
      <CreateModalHeader setSelection={setSelection} title="Resend" />
      <div className="middleBar">
        <p className="inputTitle">API Key</p>
        <Input
          onChange={(e) => setDetails({ ...details, apiKey: e.target.value })}
          value={details.apiKey}
          className="createInput"
          placeholder="API Key"
        />
      </div>
      <Margin height={20} />
      <Button loading={createLoading} onClick={onCreate} disabled={disabled()}>
        Create
      </Button>
    </div>
  );
}

export default CreateResend;
