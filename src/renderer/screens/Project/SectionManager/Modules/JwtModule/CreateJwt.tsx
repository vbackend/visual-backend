import { RootState } from '@/renderer/redux/store';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateModalHeader from '../General/CreateModalHeader';
import Margin from '@/renderer/components/general/Margin';
import { Button, Input } from 'antd';
import { BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { envConsts } from '@/renderer/misc/constants';

function CreateJwt({ setSelection, selection }: any) {
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const [errText, setErrText] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [details, setDetails] = useState({
    accessSecret: '',
    refreshSecret: '',
  });

  const onCreate = async () => {
    setCreateLoading(true);
    setErrText('');
    let data: any = {};
    data[envConsts.JWT_ACCESS_SECRET] = details.accessSecret;
    data[envConsts.JWT_REFRESH_SECRET] = details.refreshSecret;
    let { newModule, newFuncs, error } = await window.electron.createModule({
      key: BModuleType.JwtAuth,
      projId: curProject?._id,
      projKey: curProject?.key,
      ...data,
    });

    if (error) {
      setErrText(error);
      setCreateLoading(false);
      return;
    }

    setCreateLoading(false);
    RenFuncs.createModuleSuccess(dispatch, newModule, newFuncs);
  };

  const disabled = () => {
    return details.accessSecret == '' || details.refreshSecret == '';
  };
  return (
    <div className="createModule">
      <CreateModalHeader setSelection={setSelection} title="JWT" />
      <div className="middleBar">
        <p className="inputTitle">Access token secret</p>
        <Input
          onChange={(e) =>
            setDetails({ ...details, accessSecret: e.target.value })
          }
          value={details.accessSecret}
          className="createInput"
          placeholder="Access token secret"
        />

        <Margin height={10} />
        <p className="inputTitle">Refresh token key</p>
        <Input
          onChange={(e) =>
            setDetails({ ...details, refreshSecret: e.target.value })
          }
          value={details.refreshSecret}
          className="createInput"
          placeholder="Refresh token secret"
        />
      </div>
      <Margin height={20} />
      {errText && <p className="errorText">{errText}</p>}
      <Button loading={createLoading} onClick={onCreate} disabled={disabled()}>
        Create
      </Button>
    </div>
  );
}

export default CreateJwt;
