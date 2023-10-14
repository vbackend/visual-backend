import { Project } from '@/shared/models/project';
import { AppPage, AppState } from './appSlice';
import { Route } from '@/shared/models/route';

export const setAppPageReducer = (
  state: AppState,
  action: {
    payload: AppPage;
  }
) => {
  state.curPage = action.payload;
};

export const setLoggedInReducer = (
  state: AppState,
  action: {
    payload: boolean;
  }
) => {
  state.loggedIn = action.payload;
};

export const setProjectsReducer = (
  state: AppState,
  action: {
    payload: Array<Project>;
  }
) => {
  state.projects = action.payload;
};

export const addProjectReducer = (
  state: AppState,
  action: {
    payload: Project;
  }
) => {
  let newProjs = [...state.projects];
  newProjs.push(action.payload);
  state.projects = newProjs;
};

export const setProjectReducer = (
  state: AppState,
  action: {
    payload: Project;
  }
) => {
  state.currentProject = action.payload;
};

export const setRouteReducer = (
  state: AppState,
  action: {
    payload: Route;
  }
) => {
  state.currentRoute = action.payload;
};

export const removeProjectReducer = (state: AppState, action: any) => {
  const { id } = action.payload;
  const updatedProjs = state.projects.filter((item) => item._id !== id);
  state.projects = updatedProjs;
  state.currentProject = null;
};
