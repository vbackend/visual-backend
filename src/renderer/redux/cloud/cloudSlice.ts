import { createSlice } from '@reduxjs/toolkit';
import { GBuild } from '@/shared/models/GBuild';
import {
  addBuildReducer,
  initCloudStateReducer,
  setCloudDataReducer,
} from './cloudReducer';

export type CloudState = {
  builds: Array<GBuild> | null;
  cloudRunService: any;
};

const getInitialState = (): CloudState => {
  return {
    builds: null,
    cloudRunService: null,
  };
};
// create a slice
export const cloudSlice = createSlice({
  name: 'cloudSlice',
  initialState: getInitialState(),

  reducers: {
    resetCloudState(state, action) {
      state.builds = null;
      state.cloudRunService = null;
    },
    initCloudState(state, action) {
      initCloudStateReducer(state, action);
    },
    addBuild(state, action) {
      addBuildReducer(state, action);
    },
    setCloudData(state, action) {
      setCloudDataReducer(state, action);
    },
  },
});

export const { resetCloudState, initCloudState, addBuild, setCloudData } =
  cloudSlice.actions;
export default cloudSlice.reducer;
