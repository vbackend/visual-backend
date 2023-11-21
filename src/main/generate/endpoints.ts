import fs from 'fs';
import { Route, RouteFuncs, RouteType } from '@/shared/models/route';
import { BModule, BModuleFuncs } from '@/shared/models/BModule';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { ProjectService } from '@/main/services/ProjectService';
import { getRoutes } from '@/main/db/route/routeQueries';
import { getModules } from '../db/modules/moduleQueries';

export const writeRouterFile = async (
  parentPath: string,
  parentId: number,
  parentKey: string,
  parentDir: string
) => {
  let projRoutes = await getRoutes();
  let routeChildren: Array<Route> = [];

  // 1. Get all child routes of current group
  for (let i = 0; i < projRoutes.length; i++) {
    if (projRoutes[i].parentId == parentId) {
      routeChildren.push(projRoutes[i]);
    }
  }

  let file = ``;

  // 2. Write import statements
  file += `import express from 'express'\n`;

  for (let childRoute of routeChildren) {
    file += RouteFuncs.getImportStatement(childRoute);
  }

  // 3. Initialise router for parent
  let parentFuncName = RouteFuncs.getFuncNameFromStr(
    parentPath,
    parentKey,
    RouteType.group,
    parentId
  );

  file += `export const ${parentFuncName}Router = express.Router();\n`;
  for (let childRoute of routeChildren) {
    if (childRoute.type == RouteType.middleware)
      file += RouteFuncs.getUseStatement(childRoute, parentFuncName);
  }
  for (let childRoute of routeChildren) {
    if (childRoute.type != RouteType.middleware)
      file += RouteFuncs.getUseStatement(childRoute, parentFuncName);
  }

  let routerPath = `${parentDir}/${parentFuncName}Router.ts`;
  console.log('Router path:', routerPath);
  await FileFuncs.writeFile(routerPath, file);
};

export const createRouterGroupFolder = async (
  parentDir: string,
  newRoute: Route
) => {
  let funcName = RouteFuncs.getFuncName(newRoute);
  let newDirPath = `${parentDir}/${funcName}`;
  await FileFuncs.createDirIfNotExists(newDirPath);

  let routerFilePath = `${newDirPath}/${funcName}Router.ts`;
  let contents = `import express from 'express'
export const ${funcName}Router = express.Router();
    `;

  await FileFuncs.writeFile(routerFilePath, contents);
};

export const createRouteFile = async (parentDir: string, newRoute: Route) => {
  let funcName = RouteFuncs.getFuncName(newRoute);
  let path = `${parentDir}/${funcName}.ts`;

  let contents = `export const ${funcName} = async (req, res${
    newRoute.type == RouteType.middleware ? ', next' : ''
  }) => {
    // Complete function
}
    `;
  await FileFuncs.writeFile(path, contents);
};
