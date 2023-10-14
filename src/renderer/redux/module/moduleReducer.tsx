import { BFunc } from '@/shared/models/BFunc';
import { ModuleState } from './moduleSlice';
import { BModule } from '@/shared/models/BModule';

export const initModulesReducer = (state: ModuleState, action: any) => {
  state.modules = action.payload.modules;
  state.funcs = action.payload.funcs;
  state.mongo = {
    funcs: null,
    cols: null,
  };
};

export const setCurModuleReducer = (state: ModuleState, action: any) => {
  state.curModule = action.payload;
};

export const setMongoDataReducer = (state: ModuleState, action: any) => {
  state.mongo = action.payload;
};

export const addModuleReducer = (state: ModuleState, action: any) => {
  if (state.modules === null) {
    state.modules = [];
  }
  let newMods = [...state.modules];
  newMods.push(action.payload);
  state.modules = newMods;
};

export const addMongoFuncReducer = (state: ModuleState, action: any) => {
  if (state.mongo.funcs === null || state.funcs === null) return;
  let newModFuncs = [...state.mongo.funcs];
  let newFuncs = [...state.funcs];
  newFuncs.push(action.payload);
  newModFuncs.push(action.payload);

  state.mongo.funcs = newModFuncs;
  state.funcs = newFuncs;
};

export const addFuncReducer = (state: ModuleState, action: any) => {
  if (state.funcs === null) return;
  let newFuncs = [...state.funcs!];
  newFuncs.push(action.payload);
  state.funcs = newFuncs;
};

export const addFuncsReducer = (state: ModuleState, action: any) => {
  if (state.funcs === null) return;
  let newFuncs = [...state.funcs!];
  newFuncs = newFuncs.concat(action.payload);
  state.funcs = newFuncs;
};

export const deleteFuncReducer = (state: ModuleState, action: any) => {
  let func = action.payload;
  let funcIndex = state.funcs!.findIndex((f: BFunc) => f.id == func.id);
  let newFuncs = [...state.funcs!];
  if (funcIndex != -1) {
    newFuncs.splice(funcIndex, 1);
    state.funcs = newFuncs;
  }
};

export const setModuleMetadataReducer = (state: ModuleState, action: any) => {
  let { module, metadata } = action.payload;
  let index = state.modules!.findIndex((m: BModule) => m.key == module.key);

  if (index == -1) return;
  state.modules![index].metadata = metadata;

  if (state.curModule?.key == module.key) {
    state.curModule!.metadata = metadata;
  }
};

export const deleteModuleReducer = (state: ModuleState, action: any) => {
  let mod = action.payload;
  let modIndex = state.modules!.findIndex((m: BModule) => m.key === mod.key);

  let newMods = [...state.modules!];
  newMods.splice(modIndex, 1);
  state.modules = newMods;

  let newFuncs = [...state.funcs!];
  newFuncs = newFuncs.filter((f: BFunc) => f.moduleKey != mod.key);
  state.funcs = newFuncs;
};
