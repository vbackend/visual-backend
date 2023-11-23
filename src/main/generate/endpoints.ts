import { Route, RouteFuncs, RouteType } from '@/shared/models/route';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { getRoutes } from '@/main/db/route/routeQueries';
import { ProjectType } from '@/shared/models/project';

export const writeRouterFile = async (
  parentPath: string,
  parentId: number,
  parentKey: string,
  parentDir: string,
  projType: ProjectType = ProjectType.Express
) => {
  let projRoutes = await getRoutes();
  let routeChildren: Array<Route> = [];

  // 1. Get all child routes of current group
  for (let i = 0; i < projRoutes.length; i++) {
    if (projRoutes[i].parentId == parentId) {
      routeChildren.push(projRoutes[i]);
    }
  }

  // 2. Read in scaffold
  let indexTemplatePath = path.join(
    PathFuncs.getCodeTemplatesPath(),
    projType,
    'router.txt'
  );
  let scaffold: any = await FileFuncs.readFile(indexTemplatePath);

  // 3. Add import statements
  let importStatements = '';
  for (let childRoute of routeChildren) {
    importStatements += RouteFuncs.getImportStatement(childRoute, projType);
  }
  scaffold = scaffold.replace('{{import_statements}}', importStatements);

  // 4. Initialise router for parent
  let parentFuncName = RouteFuncs.getFuncNameFromStr(
    parentPath,
    parentKey,
    RouteType.group,
    parentId,
    projType
  );
  scaffold = scaffold.replaceAll('{{func_name}}', parentFuncName);
  scaffold = scaffold.replaceAll(
    '{{route_key}}',
    `${parentKey != '' ? '/' : ''}${parentKey}`
  );

  // 5. Add dep statements for fast api
  let depStatements = '';
  if (projType == ProjectType.FastAPI) {
    let count = 0;
    for (let childRoute of routeChildren) {
      if (childRoute.type == RouteType.dependency) {
        count += 1;
        depStatements += RouteFuncs.getUseStatement(
          childRoute,
          parentFuncName,
          projType
        );
      }
    }
    if (count > 0) {
      depStatements =
        ', dependencies = [' +
        depStatements.slice(0, depStatements.length - 2) +
        ']';
    }
    scaffold = scaffold.replace('{{dependencies}}', depStatements);
  }

  // 6. Add middleware statements for express
  let endpointStatements = '';
  if (projType == ProjectType.Express) {
    for (let childRoute of routeChildren) {
      if (childRoute.type == RouteType.middleware)
        endpointStatements += RouteFuncs.getUseStatement(
          childRoute,
          parentFuncName,
          projType
        );
    }
  }

  // 7. Add endpoint statements for both
  for (let childRoute of routeChildren) {
    if (
      childRoute.type != RouteType.middleware &&
      childRoute.type != RouteType.dependency
    )
      endpointStatements += RouteFuncs.getUseStatement(
        childRoute,
        parentFuncName,
        projType
      );
  }
  scaffold = scaffold.replace('{{endpoints}}', endpointStatements);

  // 6. Write to file
  let routerPath =
    projType == ProjectType.FastAPI
      ? `${parentDir}/${parentFuncName}_router.py`
      : `${parentDir}/${parentFuncName}_router.ts`;
  await FileFuncs.writeFile(routerPath, scaffold);
};

export const createRouterGroupFolder = async (
  parentDir: string,
  newRoute: Route,
  projType: ProjectType = ProjectType.Express
) => {
  let funcName = RouteFuncs.getFuncName(newRoute, projType);
  let newDirPath = `${parentDir}/${funcName}`;
  await FileFuncs.createDirIfNotExists(newDirPath);

  let routerFilePath = '';
  let contents: any = await FileFuncs.readFile(
    path.join(PathFuncs.getCodeTemplatesPath(), projType, 'router_init.txt')
  );

  // FASTAPI
  if (projType == ProjectType.FastAPI) {
    routerFilePath = `${newDirPath}/${funcName}_router.py`;
    contents = contents.replace('{{route_key}}', newRoute.key);
    contents = contents.replace('{{func_name}}', funcName);
  }

  // EXPRESS
  if (projType == ProjectType.Express) {
    routerFilePath = `${newDirPath}/${funcName}_router.ts`;
    contents = contents.replace('{{func_name}}', funcName);
  }

  await FileFuncs.writeFile(routerFilePath, contents);
};

export const createRouteFile = async (
  parentDir: string,
  newRoute: Route,
  projType: ProjectType = ProjectType.Express
) => {
  let funcName = RouteFuncs.getFuncName(newRoute, projType);
  let routePath =
    projType == ProjectType.FastAPI
      ? `${parentDir}/${funcName}.py`
      : `${parentDir}/${funcName}.ts`;

  let contents: any = await FileFuncs.readFile(
    path.join(PathFuncs.getCodeTemplatesPath(), projType, 'endpoint_init.txt')
  );

  contents = contents.replace('{{func_name}}', funcName);
  if (projType == ProjectType.FastAPI) {
    contents =
      newRoute.type == RouteType.dependency
        ? contents.replace(
            '{{dependency_text}}',
            `
    # Execute code before request
    yield
    # Execute code after request
    `
          )
        : contents.replace('{{dependency_text}}', '');
  }

  if (projType == ProjectType.Express) {
    contents =
      newRoute.type == RouteType.middleware
        ? contents.replace('{{middleware_text}}', ', next')
        : contents.replace('{{middleware_text}}', '');
  }

  await FileFuncs.writeFile(routePath, contents);
};
