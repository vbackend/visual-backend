import {
  configureStore,
  ThunkAction,
  Action,
  combineReducers,
} from '@reduxjs/toolkit';
import { Reducer } from 'react';
import appSlice from './app/appSlice';
import projectSlice from './project/projectSlice';
import moduleSlice from './module/moduleSlice';
import routesSlice from './routes/routesSlice';
import editorSlice from './editor/editorSlice';
import cloudSlice from './cloud/cloudSlice';

const store = configureStore({
  reducer: {
    app: appSlice,
    project: projectSlice,
    module: moduleSlice,
    routes: routesSlice,
    editor: editorSlice,
    cloud: cloudSlice,
  },
});

export default store;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
