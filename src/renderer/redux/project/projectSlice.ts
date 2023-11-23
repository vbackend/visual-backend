import { createSlice } from '@reduxjs/toolkit';
import {
  addTermMsgReducer,
  initialiseProjectReducer,
  resetTermDataReducer,
  setCreateModuleOpenReducer,
  setCurRouteReducer,
  setCurrentTabReducer,
  setServerRunningReducer,
} from './projectReducers';
import { Route } from '@/shared/models/route';

export enum ProjectTab {
  Routes = 'routes',
  Packages = 'packages',
  Module = 'module',
  CreateModule = 'create-module',
  Hosting = 'hosting',
  Env = 'env',
}

export type ProjectState = {
  createModuleOpen: boolean;
  routes: Array<Route>;
  currentTab: ProjectTab;
  curRoute: Route | null;
  termData: Array<any>;
  serverRunning: boolean;
  showTerm: boolean;
};

const getInitialState = (): ProjectState => {
  return {
    createModuleOpen: false,
    currentTab: ProjectTab.Routes,
    routes: [],
    curRoute: null,
    termData: [],
    serverRunning: false,
    showTerm: false,
  };
};
// create a slice
export const projectSlice = createSlice({
  name: 'projectState',
  initialState: getInitialState(),

  reducers: {
    initialiseProject(state, action) {
      initialiseProjectReducer(state, action);
    },

    setShowTerm(state, action) {
      state.showTerm = action.payload;
    },

    setCreateModuleOpen(state, action) {
      setCreateModuleOpenReducer(state, action);
    },

    setCurrentTab(state, action) {
      setCurrentTabReducer(state, action);
    },

    setCurRoute(state, action) {
      setCurRouteReducer(state, action);
    },

    addTermMsg(state, action) {
      addTermMsgReducer(state, action);
    },

    resetTermData(state, action) {
      resetTermDataReducer(state, action);
    },
    setServerRunning(state, action) {
      setServerRunningReducer(state, action);
    },
  },
});

export const {
  setShowTerm,
  initialiseProject,
  setCreateModuleOpen,
  setCurrentTab,
  setCurRoute,
  addTermMsg,
  resetTermData,
  setServerRunning,
} = projectSlice.actions;
export default projectSlice.reducer;
