import { useEffect, useState } from 'react';
import Margin from '@/renderer/components/general/Margin';

import { LuFilePlus2} from 'react-icons/lu';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import CreateFuncModal from '../FirebaseModule/CreateFuncModal';
import { FuncButton } from './FuncButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { BFunc, ExtensionType } from '@/shared/models/BFunc';

function FuncSection({ createFuncClicked }: any) {
  const funcs = useSelector((state: RootState) => state.module.funcs);
  const curModule = useSelector((state: RootState) => state.module.curModule);
  let [modFuncs, setModFuncs] = useState<any>([]);
  let [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let newModFuncs = funcs?.filter(
      (func: BFunc) =>
        func.moduleKey == curModule?.key && func.extension == ExtensionType.ts
    );
    setModFuncs(newModFuncs);
  }, [funcs]);

  return (
    <>
      {createModalOpen && (
        <CreateFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createFuncClicked}
        />
      )}
      <div className="colHeader">
        <p>Functions</p>
        <Button
          type="text"
          className="addBtn"
          onClick={() => setCreateModalOpen(true)}
        >
          <LuFilePlus2 className="icon" />
        </Button>
      </div>
      <Margin height={8} />
      {modFuncs.map((func: BFunc) => (
        <FuncButton key={func.id} func={func} module={curModule} />
      ))}
    </>
  );
}

export default FuncSection;
