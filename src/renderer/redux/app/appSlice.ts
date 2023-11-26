import { createSlice } from '@reduxjs/toolkit';
import {
  addProjectReducer,
  removeProjectReducer,
  setAppPageReducer,
  setLoggedInReducer,
  setProjectReducer,
  setProjectsReducer,
  setRouteReducer,
} from './appReducer';
import { Project } from '@/shared/models/project';
import { Route } from '@/shared/models/route';

export enum Platform {
  Darwin = 'darwin',
  Windows = 'win32',
}

export enum AppPage {
  Home = 'home',
  Auth = 'auth',
  Project = 'project',
}

export enum Editor {
  VISUALBACKEND = 'Visual Backend',
  VSCODE = 'VS Code',
  INTELLIJ = 'IntelliJ IDEA',
  // WebStorm = 'WebStorm',
  // PyCharm = 'PyCharm',
}

export type AppState = {
  currentProject: Project | null;
  projects: Array<Project>;
  currentRoute: Route | null;
  loggedIn: boolean;
  curPlatform: Platform;
  curPage: AppPage;
  user: any;
  editorToUse: Editor;
};

const getInitialState = (): AppState => {
  return {
    curPage: AppPage.Home,
    currentProject: null,
    projects: [],
    curPlatform: Platform.Darwin,
    currentRoute: null,
    loggedIn: false,
    user: null,
    editorToUse: Editor.VISUALBACKEND,
  };
};
// create a slice
export const appSlice = createSlice({
  name: 'appState',
  initialState: getInitialState(),

  reducers: {
    setUser(state, action) {
      state.user = action.payload;
    },
    setPlatform(state, action) {
      state.curPlatform = action.payload;
    },
    setEditorToUse(state, action) {
      state.editorToUse = action.payload;
    },

    setCurPage(state, action) {
      setAppPageReducer(state, action);
    },
    setLoggedIn(state, action) {
      setLoggedInReducer(state, action);
    },

    addProject(state, action) {
      addProjectReducer(state, action);
    },

    setProjects(state, action) {
      setProjectsReducer(state, action);
    },

    setCurrentProject(state, action) {
      setProjectReducer(state, action);
    },

    setCurrentRoute(state, action) {
      setRouteReducer(state, action);
    },
    removeProject(state, action) {
      removeProjectReducer(state, action);
    },
  },
});

export const {
  setUser,
  setCurPage,
  setPlatform,
  setEditorToUse,
  setProjects,
  addProject,
  setLoggedIn,
  setCurrentProject,
  setCurrentRoute,
  removeProject,
} = appSlice.actions;
export default appSlice.reducer;
