import { app } from 'electron';
import { Route, RouteFuncs } from '../models/route';
import { Platform } from '@/renderer/redux/app/appSlice';

export class GenFuncs {
  static toKey = (name: string) => name.toLowerCase().replaceAll(' ', '-');

  static getRoutePath = (route: Route) => {
    if (route.key == '') {
      return route.parentPath;
    } else {
      return `${route.parentPath}/${route.key}`;
    }
  };

  static getFilePath = (route: Route) => {
    if (route.parentId == -1) {
      return '';
    } else {
      return `${route.parentFilePath}/${RouteFuncs.getFuncName(route)}`;
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
}
