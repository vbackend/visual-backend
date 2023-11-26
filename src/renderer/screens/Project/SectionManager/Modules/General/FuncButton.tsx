import { Editor } from '@/renderer/redux/app/appSlice';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import { RootState } from '@/renderer/redux/store';
import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import { BModule, BModuleType } from '@/shared/models/BModule';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import React, { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

export const FuncButton = ({ func, module }: any) => {
  let btnRef: any = useRef(null);
  const dispatch = useDispatch();
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const editorUsed = useSelector((state: RootState) => state.app.editorToUse);

  const funcClicked = async (f: BFunc, m: BModule) => {
    if (editorUsed != Editor.VISUALBACKEND) {
      window.electron.openFile({
        path: RenFuncs.getFuncFileData(f, m).path,
        projKey: curProject!.key,
      });
    } else {
      dispatch(setCurFile(RenFuncs.getFuncFileData(f, m)));
    }
  };

  useEffect(() => {
    const handleContextMenu = async (e: any) => {
      if (btnRef.current.contains(e.target)) {
        e.preventDefault();
        await window.electron.showFuncContextMenu({
          projKey: curProject!.key,
          func: func,
          module: module,
        });
      }
    };
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <button
      ref={btnRef}
      key={func.id}
      onClick={() => funcClicked(func, module)}
      className="funcContainer"
    >
      <p>{func.key}</p>
    </button>
  );
};
