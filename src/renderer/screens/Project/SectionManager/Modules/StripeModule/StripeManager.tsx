import Margin from '@/renderer/components/general/Margin';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { addFunc, addFuncs } from '@/renderer/redux/module/moduleSlice';
import { RootState } from '@/renderer/redux/store';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import FuncSection from '../General/FuncSection';
import { Button } from 'antd';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';
import AddWebhookTemplateModal from './AddWebhookTemplate';

function StripeManager() {
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const dispatch = useDispatch();

  const [addWebhooksModalOpen, setAddWebhooksModalOpen] = useState(false);

  const createFunc = async (
    funcName: string,
    setErrText: any,
    useGpt: boolean,
    setLoading: any,
    funcGroup: string,
    setModalOpen?: any
  ) => {
    setLoading(true);
    let mConfig = modConfig[curModule?.key!];
    let { error, newFunc } = await window.electron.createFunc({
      funcName,
      funcGroup: '*',
      moduleKey: curModule?.key,
      projKey: curProject?.key,
      module: curModule,
      useGpt,
      details: mConfig.gptDetails,
    });

    setLoading(false);

    if (error) {
      setErrText(error);
      return;
    }

    setErrText('');
    dispatch(addFunc(newFunc));
    dispatch(setCurFile(RenFuncs.getFuncFileData(newFunc, curModule!)));
    setModalOpen(false);
  };

  const addWebhookTemplatesClicked = async (
    templatesChecked: Array<boolean>
  ) => {
    let data = {
      projKey: curProject?.key,
      module: curModule,
      templatesChecked: templatesChecked,
    };
    let newFuncs = await window.electron.addWebhookTemplates(data);
    dispatch(addFuncs(newFuncs));
    setAddWebhooksModalOpen(false);
  };

  return (
    <>
      {addWebhooksModalOpen && (
        <AddWebhookTemplateModal
          setModalOpen={setAddWebhooksModalOpen}
          templates={modConfig[BModuleType.Stripe].webhookTemplates}
          onAddClicked={addWebhookTemplatesClicked}
        />
      )}
      <div className="moduleSection">
        <div className="headerContainer">
          <h3 className="title">Stripe</h3>
        </div>
        <Margin height={10} />
        <div className="actionBtnsContainer">
          <Button
            className="sectionBtn"
            onClick={() => setAddWebhooksModalOpen(true)}
          >
            <FontAwesomeIcon icon={faPlus} className="icon" size="sm" />
            Webhook Templates
          </Button>
        </div>
        <Margin height={10} />
        <div className="mainContainer">
          <FuncSection createFuncClicked={createFunc} />
        </div>
      </div>
    </>
  );
}

export default StripeManager;
