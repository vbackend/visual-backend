import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import '../../styles/Project/SearchFuncsModal.scss';
import { Input, InputRef } from 'antd';
import { useCommand } from '@/renderer/hooks/shortcuts';
import { BFunc } from '@/shared/models/BFunc';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import useKeyPress from '@/renderer/hooks/useKeyPress';
import { BModule } from '@/shared/models/BModule';

type SearchFuncsModalProps = {
  setModalOpen: Dispatch<SetStateAction<boolean>>;
  funcClicked: (func: BFunc, m: BModule) => void;
};

function SearchFuncsModal({
  setModalOpen,
  funcClicked,
}: SearchFuncsModalProps) {
  const projFuncs = useSelector((state: RootState) => state.module.funcs);
  const modules = useSelector((state: RootState) => state.module.modules);

  const [funcs, setFuncs] = useState<Array<BFunc>>(projFuncs ? projFuncs : []);

  const searchRef = useRef<InputRef>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const getModule = (f: BFunc) => {
    return modules!.find((m: BModule) => f.moduleKey == m.key)!;
  };

  useKeyPress('ArrowDown', () => {
    if (currentIndex < funcs.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  });

  useKeyPress('ArrowUp', () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  });

  useKeyPress('Enter', () => {
    let f = funcs[currentIndex];
    if (f) {
      funcClicked(f, getModule(f));
      setModalOpen(false);
    }
  });

  useEffect(() => {
    if (searchRef.current) {
      searchRef.current.focus();
    }
  }, []);

  const searchChanged = (q: string) => {
    if (q == '') {
      setFuncs(projFuncs!);
    } else {
      let newFuncs = projFuncs!.filter((func) =>
        func.key.toLowerCase().includes(q.toLowerCase())
      );
      setFuncs(newFuncs);
    }
  };
  return (
    <div className="modalBackground">
      <div className="searchContainer">
        <Input
          className="funcSearchInput"
          ref={searchRef}
          prefix={<FontAwesomeIcon icon={faSearch} className="icon" />}
          style={{ borderRadius: '0px' }}
          placeholder="Search function"
          onChange={(e) => searchChanged(e.target.value)}
        />
        <div className="funcsContainer">
          {funcs.map((func: BFunc, index: number) => (
            <button
              onClick={() => {
                funcClicked(func, getModule(func));
                setModalOpen(false);
              }}
              className={`funcContainer ${
                currentIndex == index && 'activeFuncSelection'
              }`}
            >
              {func.key}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default SearchFuncsModal;
