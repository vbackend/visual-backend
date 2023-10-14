import { createSlice } from '@reduxjs/toolkit';
import { setCurFileReducer } from './editorReducer';

export enum EditorType {
  Route = 'route',
  Func = 'func',
}

export type EditorFile = {
  title: string;
  path: string;
  type: EditorType;
  metadata: any;
};

export type EditorState = {
  currentFile: EditorFile | null;
};

const getInitialState = (): EditorState => {
  return {
    currentFile: null,
  };
};
// create a slice
export const editorSlice = createSlice({
  name: 'editorState',
  initialState: getInitialState(),

  reducers: {
    setCurFile(state, action) {
      setCurFileReducer(state, action);
    },
  },
});

export const { setCurFile } = editorSlice.actions;
export default editorSlice.reducer;
