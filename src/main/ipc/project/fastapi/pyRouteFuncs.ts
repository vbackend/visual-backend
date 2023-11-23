import {
  checkIfRouteExists,
  getRouteByKeyAndParentId,
  getRoutesByParent,
  insertRoute,
  removeRouteQuery,
} from '@/main/db/route/routeQueries';
import { Route, RouteFuncs, RouteNode, RouteType } from '@/shared/models/route';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { BrowserWindow, Menu, app } from 'electron';

import { Actions } from '@/main/actions';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import {
  createRouterGroupFolder,
} from '@/main/generate/endpoints';
import { writePyRouterFile } from '@/main/generate/fastapi/pyEndpointsGen';

const checkForDuplicateRoute = async (
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

export const createPyRouteGroup = async (payload: any) => {
  let { curRoute, routeKey } = payload;
  let { projKey } = MainFuncs.getCurProject();
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

  let hasDuplicate = await checkForDuplicateRoute(
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

  await writePyRouterFile(
    curRoute.parentPath,
    curRoute.id,
    curRoute.key,
    parentDir
  );

  // // 2. Create group folder
  createRouterGroupFolder(parentDir, newRoute);
  newRoute.id = lastId;
  return {
    error: null,
    newRoute: newRoute,
  };
};

// export const createEndpoint = async (
//   event: Electron.IpcMainInvokeEvent,
//   payload: any
// ) => {
//   let { projKey, routeKey, curRoute, method } = payload;

//   let apiDir = `${PathFuncs.getProjectPath(projKey)}/src/api`;

//   let newRoute: Route = {
//     parentId: curRoute.id,
//     parentPath: GenFuncs.getRoutePath(curRoute),
//     parentFilePath: GenFuncs.getFilePath(curRoute),
//     key: routeKey,
//     type: method,
//   };

//   // 1. Check if parent path and key exists
//   let route1 = await checkIfRouteExists(
//     GenFuncs.getRoutePath(curRoute),
//     routeKey,
//     method
//   );
//   let route2 = await checkIfRouteExists(
//     curRoute.parentPath,
//     curRoute.key,
//     method
//   );
//   let route3 = await checkIfRouteExists(
//     GenFuncs.getRoutePath(newRoute),
//     '',
//     method
//   );

//   if (route1 || route2 || route3) {
//     return { error: 'Route already exists' };
//   }

//   // 1. If route key empty, check for parent
//   let newId = await insertRoute(newRoute);
//   if (!newId) return { error: 'Failed to create' };
//   newRoute = { id: newId, ...newRoute };

//   // 1. Create route folder
//   let parentDir = `${apiDir}${GenFuncs.getFilePath(curRoute)}`;
//   await createRouteFile(parentDir, newRoute);

//   // 2. Write router file
//   await writeRouterFile(
//     curRoute.parentPath,
//     curRoute.id,
//     curRoute.key,
//     parentDir
//   );

//   return {
//     error: null,
//     newRoute: { id: newId, ...newRoute },
//   };
// };

// const getNodeAndChildrenIds = async (
//   curNode: RouteNode,
//   res: Array<number>
// ) => {
//   res.push(curNode.id!);
//   for (let i = 0; i < curNode.children.length; i++) {
//     getNodeAndChildrenIds(curNode.children[i], res);
//   }
// };

// export const deleteRoute = async (
//   event: Electron.IpcMainInvokeEvent,
//   payload: any,
//   window: BrowserWindow
// ) => {
//   const { route, parent, projKey } = payload;

//   if (route.parentId != -1) {
//     Menu.buildFromTemplate([
//       {
//         label: 'Delete route',
//         click: async () => {
//           let apiDir = `${PathFuncs.getProjectPath(projKey)}/src/api`;
//           let deleteIds: Array<number> = [];
//           getNodeAndChildrenIds(route, deleteIds);
//           for (let i = 0; i < deleteIds.length; i++) {
//             await removeRouteQuery(deleteIds[i]);
//           }

//           // 2. delete folder / files
//           let routeFilePath = `${apiDir}${GenFuncs.getFilePath(route)}`;
//           if (route.type == RouteType.group) {
//             await FileFuncs.deleteDir(routeFilePath);
//           } else {
//             routeFilePath += '.ts';
//             await FileFuncs.deleteFile(routeFilePath);
//           }

//           // write router file of parent group
//           let parentDir = `${apiDir}${GenFuncs.getFilePath(parent)}`;
//           await writeRouterFile(
//             parent.parentPath,
//             parent.id,
//             parent.key,
//             parentDir
//           );
//           window.webContents.send(Actions.UPDATE_ROUTE_DELETED, route);
//         },
//       },
//     ]).popup({ window: window! });
//   }
// };
