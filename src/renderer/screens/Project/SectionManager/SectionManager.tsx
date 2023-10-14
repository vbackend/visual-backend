import React from 'react';
import RoutesScreen from '../RoutesScreen/RoutesScreen';
import '@/renderer/styles/Project/SectionManager/SectionManager.scss';
import { useSelector } from 'react-redux';
import { RootState } from '@/renderer/redux/store';
import { ProjectTab } from '@/renderer/redux/project/projectSlice';
import ModuleScreen from '../Modules/ModuleScreen';
import HostingManager from './HostingScreen/HostingManager';
import PackageManager from '../PackageManager/PackageManager';
import { BModuleType } from '@/shared/models/BModule';
import EnvManager from '../EnvManager/EnvManager';

function SectionManager() {
  let curTab = useSelector((state: RootState) => state.project.currentTab);

  return (
    <div className="sectionManager">
      {curTab == ProjectTab.Routes ? (
        <RoutesScreen />
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
