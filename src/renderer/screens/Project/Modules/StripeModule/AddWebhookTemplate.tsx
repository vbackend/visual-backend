import { useEffect, useRef, useState } from 'react';
import Margin from '@/renderer/components/general/Margin';
import { faXmark } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Checkbox, Input, Select, Switch } from 'antd';

import '@/renderer/styles/Project/Modules/StripeModule/AddWebhookTemplateModal.scss';

function AddWebhookTemplateModal({
  setModalOpen,
  onAddClicked,
  templates,
}: any) {
  let [name, setName] = useState('');
  const [errText, setErrText] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const nameRef: any = useRef(null);
  const [selectedType, setSelectedType] = useState('html');

  let [templatesChecked, setTemplatesChecked] = useState([false, false]);
  const templateClicked = (index: number) => {
    let newChecked = [...templatesChecked];
    newChecked[index] = !newChecked[index];
    setTemplatesChecked(newChecked);
    // if (newChecked)
  };

  let addDisabled = () => {
    for (let i = 0; i < templatesChecked.length; i++) {
      if (templatesChecked[i]) return false;
    }
    return true;
  };
  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  return (
    <div className="modalBackground addWebhookTemplateModal">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Add webhook template</p>
          <button className="closeBtn" onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} className="icon" />
          </button>
        </div>
        <div className="middleContainer">
          {templates.map((template: any, index: number) => {
            return (
              <button
                onClick={() => templateClicked(index)}
                key={index}
                className="webhookTemplateContainer"
              >
                <div className="row1">
                  <FontAwesomeIcon
                    icon={template.icon}
                    className="icon"
                    size="lg"
                  />
                  <p className="name">{template.name}</p>
                </div>
                <Checkbox
                  checked={templatesChecked[index]}
                  // onChange={(e) => templateClicked(index, e.target.checked)}
                />
              </button>
            );
          })}
        </div>

        <Button
          onClick={() => onAddClicked(templatesChecked)}
          type="primary"
          loading={createLoading}
          disabled={addDisabled()}
        >
          Add
        </Button>
        {errText && <p className="errorText">{errText}</p>}
      </div>
    </div>
  );
}

export default AddWebhookTemplateModal;
