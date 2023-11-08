import { RootState } from '@/renderer/redux/store';
import { BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateModalHeader from '../General/CreateModalHeader';
import { Button, Input } from 'antd';
import Margin from '@/renderer/components/general/Margin';
import { envConsts } from '@/renderer/misc/constants';

function CreateSupabase({ setSelection, selection }: any) {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const [errText, setErrText] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [details, setDetails] = useState({
    projectUrl: '',
    serviceKey: '',
  });

  const onCreate = async () => {
    setCreateLoading(true);

    let envData: any = {};
    envData[envConsts.SUPABASE_PROJECT_URL] = details.projectUrl;
    envData[envConsts.SUPABASE_SERVICE_KEY] = details.serviceKey;

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
    return details.testKey == '' || details.liveKey == '';
  };
  return (
    <div className="createModule">
      <CreateModalHeader setSelection={setSelection} title="Supabase" />
      <div className="middleBar">
        <p className="inputTitle">Test Key</p>
        <Input
          onChange={(e) => setDetails({ ...details, testKey: e.target.value })}
          value={details.testKey}
          className="createInput"
          placeholder="Test API Key"
        />

        <Margin height={20} />
        <p className="inputTitle">Live Key</p>
        <p className="inputDescription">
          You may use your test key in this field first, and change it later on.
        </p>
        <Input
          onChange={(e) => setDetails({ ...details, liveKey: e.target.value })}
          value={details.liveKey}
          className="createInput"
          placeholder="Production API Key"
        />
      </div>
      <Margin height={20} />
      <Button loading={createLoading} onClick={onCreate} disabled={disabled()}>
        Create
      </Button>
    </div>
  );
}

export default CreateSupabase;
