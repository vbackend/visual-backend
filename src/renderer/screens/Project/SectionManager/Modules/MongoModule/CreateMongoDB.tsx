import React, {
  Dispatch,
  SetStateAction,
  useReducer,
  useRef,
  useState,
} from 'react';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import 'renderer/styles/Project/CreateModule/ModuleTypes/CreateMongoDB.scss';
import { Button, Input, Select } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { LoadingOutlined } from '@ant-design/icons';
import Margin from '@/renderer/components/general/Margin';

import { RenFuncs } from '@/shared/utils/RenFuncs';
import { BModuleType } from '@/shared/models/BModule';
import { envConsts } from '@/renderer/misc/constants';
import CreateModalHeader from '../General/CreateModalHeader';

type CreateMongoDBProps = {
  setSelection: Dispatch<SetStateAction<BModuleType | null>>;
};

function CreateMongoDB({ setSelection }: CreateMongoDBProps) {
  const dispatch = useDispatch();
  const [error, setError] = useState('');
  const [connLoading, setConnLoading] = useState(false);
  const [mongoDbs, setMongoDbs] = useState(null);
  const [mongoDbSelectVal, setMongoDbSelectVal] = useState('');
  const [connString, setConnString] = useState('');
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const [createLoading, setCreateLoading] = useState(false);
  let inputRef: any = useRef(null);
  const mongoConnInputted = async (val: string) => {
    setConnString(val);

    setConnLoading(true);
    const dbs = await window.electron.getMongoConnDatabases(val);
    setConnLoading(false);

    if (!dbs) {
      setMongoDbs(null);
      setError('Invalid connection string');
      return;
    }

    setError('');
    let newDbs: any = [];
    dbs.map((db: any) =>
      newDbs.push({
        value: db.name,
        label: db.name,
      })
    );
    setMongoDbs(newDbs);
  };

  const createClicked = async () => {
    setCreateLoading(true);
    let data: any = {};
    data[envConsts.MONGO_CONN_STRING] = connString;
    data[envConsts.MONGO_DEFAULT_DB] = mongoDbSelectVal;
    let { newModule, newFuncs, error } = await window.electron.createModule({
      ...data,
      projId: curProject?._id,
      key: BModuleType.Mongo,
      projKey: curProject?.key,
      metadata: { connString: connString, defaultDb: mongoDbSelectVal },
    });

    setCreateLoading(false);
    RenFuncs.createModuleSuccess(dispatch, newModule, newFuncs);
  };

  return (
    <div className="createMongoDb">
      <CreateModalHeader setSelection={setSelection} title="MongoDB" />
      <div className="middleBar">
        <p className="inputTitle">Paste connection String</p>
        <Input
          ref={inputRef}
          onChange={(e) => {
            mongoConnInputted(e.target.value);
          }}
          value={connString}
          suffix={connLoading && <LoadingOutlined spin />}
          className="input"
          placeholder="e.g. mongodb://..."
        />
        <Margin height={10} />
        {error && <p className="errorText">{error}</p>}
        {mongoDbs && (
          <>
            <p className="inputTitle">Choose a default database</p>

            <Select
              defaultActiveFirstOption
              className="dbSelect"
              options={mongoDbs}
              onChange={(val: string) => setMongoDbSelectVal(val)}
            />
          </>
        )}
      </div>
      <Margin height={20} />
      <Button
        disabled={mongoDbSelectVal == ''}
        onClick={createClicked}
        type="primary"
        loading={createLoading}
      >
        Create
      </Button>
    </div>
  );
}

export default CreateMongoDB;
