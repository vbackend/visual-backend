import { createSlice } from '@reduxjs/toolkit';
import { Route, RouteNode } from '@/shared/models/route';
import {
  addRouteReducer,
  deleteRouteReducer,
  initRoutesReducer,
  toggleRouteOpenedReducer,
} from './routesReducer';

export type RoutesState = {
  openedRoutes: { [key: number]: boolean };
  routes: Array<Route>;
  rootNode: RouteNode | null;
};

const getInitialState = (): RoutesState => {
  return {
    openedRoutes: {},
    routes: [],
    rootNode: null,
  };
};
// create a slice
export const routesSlice = createSlice({
  name: 'routesSlice',
  initialState: getInitialState(),

  reducers: {
    toggleRouteOpened(state, action) {
      toggleRouteOpenedReducer(state, action);
    },
    initRoutes(state, action) {
      initRoutesReducer(state, action);
    },
    addRoute(state, action) {
      addRouteReducer(state, action);
    },
    deleteRoute(state, action) {
      deleteRouteReducer(state, action);
    },
  },
});

export const { initRoutes, toggleRouteOpened, addRoute, deleteRoute } =
  routesSlice.actions;
export default routesSlice.reducer;
