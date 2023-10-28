import Margin from '@/renderer/components/general/Margin';
import { LuFilePlus2 } from 'react-icons/lu';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button } from 'antd';
import React, { useEffect, useState } from 'react';
import CreateEmailTemplateModal from './CreateEmailTemplate';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { addFunc } from '@/renderer/redux/module/moduleSlice';
import { BFunc, ExtensionType } from '@/shared/models/BFunc';
import { FuncButton } from '../General/FuncButton';
import { MdNoteAdd } from 'react-icons/md';

function EmailTemplatesSection() {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  let projKey = useSelector(
    (state: RootState) => state.app.currentProject?.key
  );
  const funcs = useSelector((state: RootState) => state.module.funcs);
  const curModule = useSelector((state: RootState) => state.module.curModule);
  let [modFuncs, setModFuncs] = useState<any>([]);
  const dispatch = useDispatch();

  const createTemplate = async (
    name: string,
    type: string,
    setModalOpen: any
  ) => {
    let { newFunc, error } = await window.electron.createEmailTemplate({
      projKey,
      name,
      type,
    });
    dispatch(addFunc(newFunc));
    setModalOpen(false);
  };

  useEffect(() => {
    let newModFuncs = funcs?.filter(
      (func: BFunc) =>
        func.moduleKey == curModule?.key &&
        (func.extension == ExtensionType.html ||
          func.extension == ExtensionType.tsx)
    );
    setModFuncs(newModFuncs);
  }, [modFuncs]);

  return (
    <>
      {createModalOpen && (
        <CreateEmailTemplateModal
          setModalOpen={setCreateModalOpen}
          onCreateClicked={createTemplate}
        />
      )}
      <div className="colHeader">
        <p>Email Templates</p>
        <Button
          type="text"
          className="funcAddBtn"
          onClick={() => setCreateModalOpen(true)}
        >
          <MdNoteAdd className="icon noteAddIcon" />
        </Button>
      </div>
      <Margin height={8} />
      {modFuncs.map((func: BFunc) => (
        <FuncButton func={func} module={curModule} />
      ))}
    </>
  );
}

export default EmailTemplatesSection;
