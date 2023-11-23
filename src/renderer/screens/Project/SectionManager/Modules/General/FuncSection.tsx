import { useEffect, useState } from 'react';

import { Button } from 'antd';
import CreateFuncModal from './CreateFuncModal';
import { FuncButton } from './FuncButton';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { BFunc, ExtensionType } from '@/shared/models/BFunc';
import { MdNoteAdd } from 'react-icons/md';

function FuncSection({
  createFuncClicked,
  title = 'Functions',
  funcFilter,
  funcGroup = '*',
}: any) {
  const funcs = useSelector((state: RootState) => state.module.funcs);
  const curModule = useSelector((state: RootState) => state.module.curModule);
  let [modFuncs, setModFuncs] = useState<any>([]);
  let [createModalOpen, setCreateModalOpen] = useState(false);

  useEffect(() => {
    let filter =
      funcFilter != null && funcFilter != undefined
        ? funcFilter
        : (func: BFunc) =>
            func.moduleKey == curModule?.key &&
            func.extension != ExtensionType.html;
    let newModFuncs = funcs?.filter(filter);
    setModFuncs(newModFuncs);
  }, [funcs]);

  return (
    <>
      {createModalOpen && (
        <CreateFuncModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createFuncClicked}
          funcGroup={funcGroup}
        />
      )}
      <div className="colHeader">
        <p>{title}</p>
        <Button
          type="text"
          className="funcAddBtn"
          onClick={() => setCreateModalOpen(true)}
        >
          <MdNoteAdd className="icon noteAddIcon" />
        </Button>
      </div>
      {modFuncs.map((func: BFunc) => (
        <FuncButton key={func.id} func={func} module={curModule} />
      ))}
    </>
  );
}

export default FuncSection;
