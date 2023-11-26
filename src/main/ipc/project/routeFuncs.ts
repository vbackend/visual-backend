import {
  checkIfRouteExists,
  getRoutes,
  getRoutesByParent,
  insertRoute,
  removeRouteQuery,
} from '@/main/db/route/routeQueries';
import { Route, RouteFuncs, RouteNode, RouteType } from '@/shared/models/route';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { BrowserWindow, Menu } from 'electron';

import { Actions } from '@/main/actions';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import {
  createRouteFile,
  createRouterGroupFolder,
  writeRouterFile,
} from '@/main/generate/endpoints';
import { ProjectType } from '@/shared/models/project';
import { writePyRouterFile } from '@/main/generate/fastapi/pyEndpointsGen';

const checkForDuplicateRouteGroup = async (
  curRoute: Route,
  newKey: string,
  newType: RouteType
) => {
  if (newType == RouteType.group) {
    let childRoutes = await getRoutesByParent(
      `${GenFuncs.getRoutePath(curRoute)}`
    );

    let curFuncName = RouteFuncs.getFuncName(curRoute);
    childRoutes.map((route: Route) => {
      if (
        route.key === newKey ||
        curFuncName ===
          RouteFuncs.getFuncNameFromStr(
            RouteFuncs.getPath(curRoute),
            newKey,
            newType,
            0
          )
      ) {
        return true;
      }
    });
    return false;
  }
};

const checkForDuplicateRoute = async (
  curRoute: Route,
  newRoute: Route,
  routeKey: string,
  method: string
) => {
  let routes = await getRoutes();

  let newRoutePath = GenFuncs.getRoutePath(newRoute);

  // TO CHANGE (INEFFICIENT)
  let matchIndex = routes.findIndex(
    (route: Route) =>
      GenFuncs.getRoutePath(route) == newRoutePath &&
      route.type == newRoute.type
  );

  return matchIndex != -1;
};

export const createRouteGroup = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { curRoute, routeKey } = payload;

  const { projKey, projType } = MainFuncs.getCurProject();

  let apiDir = PathFuncs.getApiDir(projKey);

  let newRoute: Route = {
    parentId: curRoute.id,
    parentPath: GenFuncs.getRoutePath(curRoute),
    parentFilePath: GenFuncs.getFilePath(curRoute),
    key: routeKey,
    type: RouteType.group,
  };

  // 1. Check if route exists
  if (routeKey == '') {
    return {
      error: 'Route group must not be empty',
    };
  }

  let hasDuplicate = await checkForDuplicateRouteGroup(
    curRoute,
    routeKey,
    RouteType.group
  );

  if (hasDuplicate) {
    return {
      error: 'Route already exists',
    };
  }

  let lastId: null | number = await insertRoute(newRoute);
  if (!lastId) {
    return false;
  }

  let parentDir = `${apiDir}${GenFuncs.getFilePath(curRoute)}`;

  await writeRouterFile(
    curRoute.parentPath,
    curRoute.id,
    curRoute.key,
    parentDir,
    projType
  );

  // 2. Create group folder
  createRouterGroupFolder(parentDir, newRoute, projType);
  newRoute.id = lastId;
  return {
    error: null,
    newRoute: newRoute,
  };
};

export const createEndpoint = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { routeKey, curRoute, method } = payload;
  let { projKey, projType } = MainFuncs.getCurProject();
  let apiDir = PathFuncs.getApiDir(projKey);

  let newRoute: Route = {
    parentId: curRoute.id,
    parentPath: GenFuncs.getRoutePath(curRoute),
    parentFilePath: GenFuncs.getFilePath(curRoute),
    key: routeKey,
    type: method,
  };

  if (await checkForDuplicateRoute(curRoute, newRoute, routeKey, method)) {
    return { error: 'Route already exists' };
  }

  // 1. If route key empty, check for parent
  let newId = await insertRoute(newRoute);
  if (!newId) return { error: 'Failed to create' };
  newRoute = { id: newId, ...newRoute };

  // 1. Create route folder
  let parentDir = `${apiDir}${GenFuncs.getFilePath(curRoute)}`;
  await createRouteFile(parentDir, newRoute, projType);

  // 2. Write router file
  await writeRouterFile(
    curRoute.parentPath,
    curRoute.id,
    curRoute.key,
    parentDir,
    projType
  );

  return {
    error: null,
    newRoute: { id: newId, ...newRoute },
  };
};

const getNodeAndChildrenIds = async (
  curNode: RouteNode,
  res: Array<number>
) => {
  res.push(curNode.id!);
  for (let i = 0; i < curNode.children.length; i++) {
    getNodeAndChildrenIds(curNode.children[i], res);
  }
};

export const deleteRoute = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any,
  window: BrowserWindow
) => {
  const { route, parent } = payload;
  const { projKey, projType } = MainFuncs.getCurProject();
  let apiDir = PathFuncs.getApiDir(projKey);

  if (route.parentId != -1) {
    Menu.buildFromTemplate([
      {
        label: 'Delete route',
        click: async () => {
          let deleteIds: Array<number> = [];

          getNodeAndChildrenIds(route, deleteIds);
          // return;
          for (let i = 0; i < deleteIds.length; i++) {
            await removeRouteQuery(deleteIds[i]);
          }

          // 2. delete folder / files
          let routeFilePath = `${apiDir}${GenFuncs.getFilePath(
            route,
            projType
          )}`;
          if (route.type == RouteType.group) {
            await FileFuncs.deleteDir(routeFilePath);
          } else {
            routeFilePath += `.${MainFuncs.getExtension(projType)}`;
            await FileFuncs.deleteFile(routeFilePath);
          }

          // write router file of parent group
          let parentDir = `${apiDir}${GenFuncs.getFilePath(parent)}`;
          await writeRouterFile(
            parent.parentPath,
            parent.id,
            parent.key,
            parentDir,
            projType
          );
          window.webContents.send(Actions.UPDATE_ROUTE_DELETED, route);
        },
      },
    ]).popup({ window: window! });
  }
};
