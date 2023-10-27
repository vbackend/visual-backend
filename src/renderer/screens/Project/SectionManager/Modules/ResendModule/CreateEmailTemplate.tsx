import { useEffect, useReducer, useRef, useState } from 'react';
import Margin from '@/renderer/components/general/Margin';
import { faSparkles, faXmark } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Button, Input, Select, Switch } from 'antd';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';

let templateTypes = [
  {
    value: 'html',
    label: 'HTML',
  },
  // {
  //   value: 'react-email',
  //   label: 'React Email',
  // },
];

function CreateEmailTemplateModal({ setModalOpen, onCreateClicked }: any) {
  let [name, setName] = useState('');
  const [errText, setErrText] = useState('');
  const [useGpt, setUseGpt] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const curModule = useSelector((state: RootState) => state.module.curModule);
  const nameRef: any = useRef(null);

  const [selectedType, setSelectedType] = useState('html');

  useEffect(() => {
    if (nameRef.current) {
      nameRef.current.focus();
    }
  }, []);

  return (
    <div className="modalBackground createFuncModal">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Create email template</p>
          <button className="closeBtn" onClick={() => setModalOpen(false)}>
            <FontAwesomeIcon icon={faXmark} className="icon" />
          </button>
        </div>
        <div className="middleContainer">
          <p className="inputTitle">Type</p>
          <Select
            defaultActiveFirstOption
            className="dbSelect"
            options={templateTypes}
            value={selectedType}
            onChange={(val: string) => setSelectedType(val)}
          />
          <Margin height={20} />
          <p className="inputTitle">Template name</p>
          <Input
            ref={nameRef}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (should be a valid function name)"
            className="input"
          />
        </div>
        <Margin height={20} />
        <Button
          onClick={() => onCreateClicked(name, selectedType, setModalOpen)}
          type="primary"
          loading={createLoading}
        >
          Create
        </Button>
        {errText && <p className="errorText">{errText}</p>}
      </div>
    </div>
  );
}

export default CreateEmailTemplateModal;
