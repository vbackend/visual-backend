import { getRoutes } from '@/main/db/route/routeQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { ProjectType } from '@/shared/models/project';
import { Route, RouteFuncs, RouteType } from '@/shared/models/route';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export const writePyRouterFile = async (
  parentPath: string,
  parentId: number,
  parentKey: string,
  parentDir: string
) => {
  let projRoutes = await getRoutes();
  let routeChildren: Array<Route> = [];

  let { projType } = MainFuncs.getCurProject();

  // 1. Get all child routes of current group
  for (let i = 0; i < projRoutes.length; i++) {
    if (projRoutes[i].parentId == parentId) {
      routeChildren.push(projRoutes[i]);
    }
  }

  // 2. Get scaffold
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

  scaffold = scaffold.replaceAll('{{route_key}}', parentFuncName);

  // for (let childRoute of routeChildren) {
  //   if (childRoute.type == RouteType.middleware)
  //     file += RouteFuncs.getUseStatement(childRoute, parentFuncName);
  // }
  let endpointStatements = '';
  for (let childRoute of routeChildren) {
    // if (childRoute.type != RouteType.middleware)
    endpointStatements += RouteFuncs.getUseStatement(
      childRoute,
      parentFuncName,
      projType
    );
  }
  scaffold = scaffold.replace('{{endpoints}}', endpointStatements);

  let routerPath = `${parentDir}/${parentFuncName}_router.py`; // change for flexibility
  await FileFuncs.writeFile(routerPath, scaffold);
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
