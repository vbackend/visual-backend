import { useEffect, useState } from 'react';
import '@/renderer/styles/Project/CreateModule/CreateModuleModal.scss';

import { useDispatch, useSelector } from 'react-redux';
import { setCreateModuleOpen } from '@/renderer/redux/project/projectSlice';
import SelectModule from './SelectModule';
import { RootState } from '@/renderer/redux/store';

import useEscHook from '@/renderer/hooks/useEscClicked';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import CreateMongoDB from '../MongoModule/CreateMongoDB';
import CreateFirebaseModule from '../../../../../../archives/CreateFirebaseModule';
import { setSomeModalOpen } from '@/renderer/redux/app/appSlice';

function CreateModuleModal() {
  const dispatch = useDispatch();
  const project = useSelector((state: RootState) => state.project);
  const [page, setPage] = useState(1);

  const [selection, setSelection] = useState<BModuleType | null>(null);

  useEscHook(() => dispatch(setCreateModuleOpen(false)));
  const getModuleCreateModal = () => {
    if (selection == BModuleType.Mongo)
      return <CreateMongoDB setSelection={setSelection} />;

    if (
      selection == BModuleType.FirebaseFirestore ||
      selection == BModuleType.FirebaseAuth
    )
      return (
        <CreateFirebaseModule
          setSelection={setSelection}
          selection={selection}
        />
      );
    else if (selection && modConfig[selection]) {
      let conf = modConfig[selection!];
      return conf.createComp(setSelection, selection);
    }
    return <SelectModule setSelection={setSelection} />;
  };

  useEffect(() => {
    dispatch(setSomeModalOpen(true));
    return () => {
      dispatch(setSomeModalOpen(false));
    };
  }, []);

  return (
    <div className="modalBackground createModuleModal">
      <div className="contentContainer">{getModuleCreateModal()}</div>
    </div>
  );
}

export default CreateModuleModal;
