import { EditorState } from './editorSlice';

export const setCurFileReducer = (state: EditorState, action: any) => {
  state.currentFile = action.payload;
};
