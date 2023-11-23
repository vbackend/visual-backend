import React, { useEffect, useRef, useState } from 'react';

import 'ace-builds/src-noconflict/ace';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/mode-typescript';
import 'ace-builds/src-noconflict/mode-python';
import 'ace-builds/src-noconflict/mode-html';
import 'ace-builds/src-noconflict/theme-xcode';
import 'ace-builds/src-noconflict/ext-language_tools';
import AceEditor from 'react-ace';

import '@/renderer/styles/Project/EditorScreen/EditorScreen.scss';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import Margin from '@/renderer/components/general/Margin';
import useShortcut from '@/renderer/hooks/useShortcut';
import SearchFuncsModal from '../SearchFuncsModal';
import { BFunc, BFuncHelpers } from '@/shared/models/BFunc';
import useEscHook from '@/renderer/hooks/useEscClicked';
import { RenFuncs } from '@/shared/utils/RenFuncs';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { setCurFile } from '@/renderer/redux/editor/editorSlice';
import { BModule } from '@/shared/models/BModule';
import { ProjectType } from '@/shared/models/project';

function EditorScreen() {
  const dispatch = useDispatch();
  const editorRef: any = useRef(null);
  const [editorText, setEditorText] = useState('// comment');

  const curFile = useSelector((state: RootState) => state.editor.currentFile);
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );
  const [hasSaved, setHasSaved] = useState(true);
  const [searchFuncsOpen, setSearchFuncsOpen] = useState<boolean>(false);
  let platform = useSelector((state: RootState) => state.app.curPlatform);
  let metaKey = RenFuncs.getMetaKey(platform);

  const getFileContents = async () => {
    if (curFile === null) return;
    let text = await window.electron.getFileContents({
      path: curFile.path,
      projKey: curProject?.key,
    });

    setEditorText(text);
  };

  const saveFileContents = async () => {
    if (curFile === null) return;
    await window.electron.saveFileContents({
      path: curFile?.path,
      projKey: curProject?.key,
      contents: editorText,
    });
    setHasSaved(true);
  };

  const funcClicked = (func: BFunc, m: BModule) => {
    let newText = `${BFuncHelpers.getImportStatement(func, m)}
${editorText}
    `;

    let importCount = func.extension == 'html' ? 3 : 1;
    if (editorRef && editorRef.current) {
      let editor = editorRef.current.editor;
      let cursorPosition = editor.getCursorPosition();
      editor.setValue(newText);
      editor.clearSelection();

      editor.moveCursorTo(
        cursorPosition.row + importCount,
        cursorPosition.column
      );

      editorRef.current.editor.insert(
        `${BFuncHelpers.getFuncCallTemplate(func)}`
      );

      editorRef.current.editor.focus();
    }
  };

  useShortcut('s', saveFileContents);
  useShortcut('i', () => setSearchFuncsOpen(!searchFuncsOpen));
  useEscHook(() => setSearchFuncsOpen(false));

  useEffect(() => {
    getFileContents();
  }, [curFile]);

  useEffect(() => {
    if (!searchFuncsOpen && editorRef.current) editorRef.current.editor.focus();
  }, [searchFuncsOpen]);

  const getEditorMode = () => {
    if (curProject?.projectType == ProjectType.FastAPI) return 'python';
    if (curFile?.metadata.extension) {
      switch (curFile.metadata.extension) {
        case 'ts':
          return 'typescript';
        case 'html':
          return 'html';
      }
    }
    return 'typescript';
  };

  if (curFile === null)
    return (
      <div className="emptyContainer">
        <p>No file opened</p>
      </div>
    );

  return (
    <>
      {searchFuncsOpen && (
        <SearchFuncsModal
          setModalOpen={setSearchFuncsOpen}
          funcClicked={funcClicked}
        />
      )}
      <div className="editorScreen">
        <div className="topBar">
          <div className="row1">
            <p className={`title ${!hasSaved && 'titleUnsaved'}`}>
              {curFile.title}
            </p>

            <button onClick={() => dispatch(setCurFile(null))}>
              <FontAwesomeIcon icon={faXmark} size="lg" />
            </button>
          </div>

          <p className="afterText">{`Tip: Use ${metaKey} + I to search for a function`}</p>
          <Margin height={2} />
          <p className="afterText">Please don't change the function name</p>
        </div>
        <Margin height={5} />
        <div className="editorContainer">
          <AceEditor
            ref={editorRef}
            mode={getEditorMode()}
            theme="xcode"
            onChange={(val: string, e: any) => {
              setHasSaved(false);
              setEditorText(val);
            }}
            style={{
              width: '100%',
              height: '100%',
            }}
            value={editorText}
            name="my-editor"
            editorProps={{ $blockScrolling: true }}
            setOptions={{
              enableBasicAutocompletion: true,
              enableLiveAutocompletion: true,
              enableSnippets: true,
              showLineNumbers: true,
              tabSize: 2,
            }}
          />
        </div>
      </div>
    </>
  );
}

export default EditorScreen;
