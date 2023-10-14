import { ProjectState, ProjectTab } from './projectSlice';

export const initialiseProjectReducer = (state: ProjectState, action: any) => {
  state.createModuleOpen = false;
  state.curRoute = null;
  state.currentTab = ProjectTab.Routes;
  state.termData = [];
};

export const setCreateModuleOpenReducer = (
  state: ProjectState,
  action: any
) => {
  state.createModuleOpen = action.payload;
};

export const setCurrentTabReducer = (state: ProjectState, action: any) => {
  state.currentTab = action.payload;
};

export const setCurRouteReducer = (state: ProjectState, action: any) => {
  state.curRoute = action.payload;
};

export const addTermMsgReducer = (state: ProjectState, action: any) => {
  // let data = action.payload.data;
  // let lines = data.trim('\n').split('\n');
  // let newLines: any = [];
  // for (let i = 0; i < lines.length; i++) {
  //   newLines.push({ type: action.payload.type, data: lines[i] });
  // }

  let newData = [...state.termData, ...action.payload];
  state.termData = newData;
};

export const resetTermDataReducer = (state: ProjectState, action: any) => {
  state.termData = [];
};

export const setServerRunningReducer = (state: ProjectState, action: any) => {
  state.serverRunning = action.payload;
};
