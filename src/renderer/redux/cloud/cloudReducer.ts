import { CloudState } from './cloudSlice';

export const initCloudStateReducer = (state: CloudState, action: any) => {
  state.builds = action.payload.builds;
  state.cloudRunService = action.payload.cloudRunService;
};

export const addBuildReducer = (state: CloudState, action: any) => {
  let newBuilds = [action.payload, ...state.builds];
  state.builds = newBuilds;
};

export const setCloudDataReducer = (state: CloudState, action: any) => {
  state.builds = action.payload.builds;
  state.cloudRunService = action.payload.cloudRunService;
};
