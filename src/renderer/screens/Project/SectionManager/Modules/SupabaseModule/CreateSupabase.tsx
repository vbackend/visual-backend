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
    return details.projectUrl == '' || details.serviceKey == '';
  };
  return (
    <div className="createModule">
      <CreateModalHeader setSelection={setSelection} title="Supabase" />
      <div className="middleBar">
        <p className="inputTitle">Project URL</p>
        <Input
          onChange={(e) =>
            setDetails({ ...details, projectUrl: e.target.value })
          }
          value={details.projectUrl}
          className="createInput"
          placeholder="e.g. https://abc123.supabase.co"
        />

        <Margin height={20} />
        <p className="inputTitle">Service Key</p>
        <Input
          onChange={(e) =>
            setDetails({ ...details, serviceKey: e.target.value })
          }
          value={details.serviceKey}
          className="createInput"
          placeholder="e.g. eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
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
