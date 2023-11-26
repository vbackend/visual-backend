import React from 'react';
import '@/renderer/styles/Project/SectionManager/SectionManager.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { ProjectTab } from '@/renderer/redux/project/projectSlice';
import ModuleScreen from './Modules/ModuleScreen';
import HostingManager from './HostingScreen/HostingManager';
import PackageManager from './PackageManager/PackageManager';
import { BModuleType } from '@/shared/models/BModule';
import EnvManager from './EnvManager/EnvManager';
import RoutesManager from './RoutesManager/RoutesManager';
import { Editor } from '@/renderer/redux/app/appSlice';

function SectionManager() {
  let curTab = useSelector((state: RootState) => state.project.currentTab);
  let editorToUse = useSelector((state: RootState) => state.app.editorToUse);

  return (
    <div
      className="sectionManager"
      style={
        editorToUse != Editor.VISUALBACKEND
          ? {
              maxWidth: '300px',
              minWidth: '300px',
            }
          : {}
      }
    >
      {curTab == ProjectTab.Routes ? (
        <RoutesManager />
      ) : curTab == ProjectTab.Module ? (
        <ModuleScreen />
      ) : curTab == ProjectTab.Packages ? (
        <PackageManager />
      ) : curTab == ProjectTab.Env ? (
        <EnvManager />
      ) : (
        <HostingManager />
      )}
    </div>
  );
}

export default SectionManager;
