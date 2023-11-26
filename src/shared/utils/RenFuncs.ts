import {
  AppPage,
  Editor,
  Platform,
  setCurPage,
  setCurrentProject,
} from '@/renderer/redux/app/appSlice';
import { BFunc, BFuncHelpers } from '../models/BFunc';
import { BModule, BModuleType, modConfig } from '../models/BModule';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import {
  addFuncs,
  addModule,
  setCurModule,
} from '@/renderer/redux/module/moduleSlice';
import {
  ProjectTab,
  setCreateModuleOpen,
  setCurrentTab,
} from '@/renderer/redux/project/projectSlice';
import { Dispatch } from 'react';
import { AnyAction } from '@reduxjs/toolkit';
import {
  projWindowSizeNoVs,
  projWindowSizeVs,
} from '@/renderer/misc/constants';
import { Project } from '../models/project';

export class RenFuncs {
  static getMetaKey = (p: Platform) => {
    if (p == Platform.Darwin) {
      return '⌘';
    } else {
      return 'Ctl';
    }
  };

  static timeout = (delay: number) => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(true);
      }, delay);
    });
  };

  static getModuleFileTitle = (m: BModule) => {
    let config = modConfig[m.key];
    return config.title;
  };

  static getFuncFileData = (f: BFunc, m: BModule) => {
    let data = {
      title: `${this.getModuleFileTitle(m)}: ${f.key}`,
      path: `/src/modules/${m.path}/${BFuncHelpers.getFuncPath(f)}`,
      metadata: {
        type: EditorType.Func,
        id: f.id,
        moduleKey: m.key,
        extension: f.extension,
      },
    };
    console.log('Data:', data);
    return data;
  };

  static createModuleSuccess = (
    dispatch: Dispatch<AnyAction>,
    newModule: BModule,
    newFuncs: any
  ) => {
    dispatch(addModule(newModule));
    if (newFuncs && newFuncs.length > 0) {
      dispatch(addFuncs(newFuncs));
    }
    dispatch(setCreateModuleOpen(false));
    dispatch(setCurrentTab(ProjectTab.Module));
    dispatch(setCurModule(newModule));
  };

  static openProjectOld = (
    project: Project,
    dispatch: any,
    openWithVs: any
  ) => {
    if (openWithVs) {
      window.electron.openProjectInVs({ projKey: project.key });
    }
    window.electron.setWindowSize(
      openWithVs ? projWindowSizeVs : projWindowSizeNoVs
    );
    dispatch(setCurrentProject(project));
    dispatch(setCurPage(AppPage.Project));
  };

  static openProject = (
    project: Project,
    dispatch: any,
    editorToUse: Editor
  ) => {
    window.electron.setCurProject({
      projKey: project.key,
      projType: project.projectType,
    });
    if (editorToUse === Editor.VSCODE) {
      window.electron.openProjectInVs({ projKey: project.key });
    } else if (editorToUse === Editor.INTELLIJ) {
      window.electron.openProjectInIntelliJ({ projKey: project.key });
    }
    window.electron.setWindowSize(
      editorToUse != Editor.VISUALBACKEND
        ? projWindowSizeVs
        : projWindowSizeNoVs
    );
    dispatch(setCurrentProject(project));
    dispatch(setCurPage(AppPage.Project));
  };
}
