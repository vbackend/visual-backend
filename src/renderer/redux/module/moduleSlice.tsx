import { createSlice } from '@reduxjs/toolkit';
import { Route } from '@/shared/models/route';
import { BModule } from '@/shared/models/BModule';
import {
  addFuncReducer,
  addFuncsReducer,
  addModuleReducer,
  addMongoFuncReducer,
  deleteFuncReducer,
  deleteModuleReducer,
  initModulesReducer,
  setCurModuleReducer,
  setModuleMetadataReducer,
  setMongoDataReducer,
} from './moduleReducer';
import { BFunc } from '@/shared/models/BFunc';

export type ModuleState = {
  modules: Array<BModule> | null;
  funcs: Array<BFunc> | null;
  curModule: BModule | null;
  curFunc: BFunc | null;
  mongo: {
    cols: Array<string> | null;
    funcs: Array<BFunc> | null;
  };
};

const getInitialState = (): ModuleState => {
  return {
    modules: null,
    curModule: null,
    funcs: null,
    curFunc: null,
    mongo: {
      cols: null,
      funcs: null,
    },
  };
};
// create a slice
export const moduleSlice = createSlice({
  name: 'moduleState',
  initialState: getInitialState(),

  reducers: {
    initModules(state, action) {
      initModulesReducer(state, action);
    },
    setCurModule(state, action) {
      setCurModuleReducer(state, action);
    },
    setMongoData(state, action) {
      setMongoDataReducer(state, action);
    },
    addModule(state, action) {
      addModuleReducer(state, action);
    },
    addMongoFunc(state, action) {
      addMongoFuncReducer(state, action);
    },

    addFunc(state, action) {
      addFuncReducer(state, action);
    },

    addFuncs(state, action) {
      addFuncsReducer(state, action);
    },

    deleteFunc(state, action) {
      deleteFuncReducer(state, action);
    },

    setModuleMetadata(state, action) {
      setModuleMetadataReducer(state, action);
    },

    deleteModule(state, action) {
      deleteModuleReducer(state, action);
    },
  },
});

export const {
  initModules,
  setCurModule,
  setMongoData,
  addModule,
  addMongoFunc,
  addFunc,
  addFuncs,
  deleteFunc,
  setModuleMetadata,
  deleteModule,
} = moduleSlice.actions;
export default moduleSlice.reducer;
