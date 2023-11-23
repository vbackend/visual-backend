import { app } from 'electron';
import { Route, RouteFuncs } from '../models/route';
import { Platform } from '@/renderer/redux/app/appSlice';
import { ProjectType } from '../models/project';
import { modConfig, pyModConfig } from '../models/BModule';

export class GenFuncs {
  static toKey = (name: string) => name.toLowerCase().replaceAll(' ', '-');

  static getRoutePath = (route: Route) => {
    if (route.key == '') {
      return route.parentPath;
    } else {
      return `${route.parentPath}/${route.key}`;
    }
  };

  static getFilePath = (
    route: Route,
    projType: ProjectType = ProjectType.Express
  ) => {
    if (route.parentId == -1) {
      return '';
    } else {
      return `${route.parentFilePath}/${RouteFuncs.getFuncName(
        route,
        projType
      )}`;
    }
  };

  static timeout(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static camelise = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  };

  static getExtension = (projType: ProjectType) => {
    return projType == ProjectType.FastAPI ? 'py' : 'ts';
  };

  static isFastApi = (projType: ProjectType) => {
    return projType == ProjectType.FastAPI;
  };

  static getModConfig = (modKey: string, projType: string) => {
    if (projType == ProjectType.FastAPI) {
      return pyModConfig[modKey];
    } else {
      return modConfig[modKey];
    }
  };
}
