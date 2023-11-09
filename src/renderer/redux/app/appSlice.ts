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

export type AppState = {
  currentProject: Project | null;
  projects: Array<Project>;
  currentRoute: Route | null;
  loggedIn: boolean;
  curPlatform: Platform;
  curPage: AppPage;
  user: any;
  openWithVs: boolean;
  someModalOpen: boolean;
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
    openWithVs: false,
    someModalOpen: false,
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
    setOpenWithVs(state, action) {
      state.openWithVs = action.payload;
    },

    setSomeModalOpen(state, action) {
      state.someModalOpen = action.payload;
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
  setOpenWithVs,
  setSomeModalOpen,
  setProjects,
  addProject,
  setLoggedIn,
  setCurrentProject,
  setCurrentRoute,
  removeProject,
} = appSlice.actions;
export default appSlice.reducer;
