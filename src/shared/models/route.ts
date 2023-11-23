import { ProjectType } from './project';

export type Route = {
  id?: number;
  parentId: number;
  parentPath: string;
  parentFilePath: string;
  key: string;
  type: string;
};

export type RouteNode = {
  id?: number;
  parentId: number;
  key: string;
  parentPath: string;
  parentFilePath: string;
  type: string;
  children: Array<RouteNode>;
};

export enum RouteType {
  group = 'grp',
  middleware = 'mid',
  dependency = 'dep',
  get = 'get',
  post = 'post',
  put = 'put',
  delete = 'delete',
  patch = 'patch',
}

export class RouteFuncs {
  static getPath = (route: Route) => {
    if (route.key == '') {
      return `${route.parentPath}`;
    } else {
      return `${route.parentPath}/${route.key}`;
    }
  };

  static getKey = (route: Route) => {
    let name = route.key;

    let newName;
    if (name[0] == ':') {
      newName = 'By' + name.charAt(1);
      if (name.length > 2) {
        newName += name.slice(2);
      }
    } else {
      newName = name.charAt(0).toUpperCase();
      if (name.length > 1) {
        newName += name.slice(1);
      }
    }

    const validKey = name.replace(/[^a-zA-Z0-9_]/g, '-');

    const trimmedKey = validKey.replace(/^[0-9]+/, '');

    return trimmedKey || 'invalid_key';
  };

  static camelise = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  };

  static getParentKey = (parentPath: string) => {
    let arr = parentPath.split('/');
    arr = arr.filter((x) => x != '');
    return arr[arr.length - 1];
  };

  static getPyFuncNameFromStr = (
    parentPath: string,
    key: string,
    type: string,
    id: number
  ) => {
    // handle key is empty
    if (key === '') {
      // Case 1: Root group, id is 1
      if (id == 1) return 'root';
      if (parentPath == '') {
        return `root_${type.toLowerCase()}`;
      }

      // Case 2: Middleware

      // Case 3: Endpoint
      return `${RouteFuncs.getParentKey(parentPath)}_${type.toLowerCase()}`;
    }

    // handle key is not empty
    let name = key;
    if (name[0] == '{' && name[name.length - 1] == '}') {
      name = name.replace('{', 'by_');
      name = name.slice(0, name.length - 1);
    }

    if (type == RouteType.group) {
      return name;
      // return this.camelise(name);
    } else if (type == RouteType.dependency) {
      return `${name}_dependency`;
    }
    {
      return `${type.toLowerCase()}_${name}`;
    }
  };

  static getFuncNameFromStr = (
    parentPath: string,
    key: string,
    type: string,
    id: number,
    projType?: ProjectType
  ) => {
    if (projType == ProjectType.FastAPI) {
      return this.getPyFuncNameFromStr(parentPath, key, type, id);
    }

    // handle key is empty
    if (key === '') {
      // Case 1: Root group, id is 1
      if (id == 1) return 'root';

      // Case 2: Middleware
      if (parentPath == '') {
        return `root_${type.toLowerCase()}`;
      } else {
        return `${RouteFuncs.getParentKey(parentPath)}_${type.toLowerCase()}`;
      }
    }

    // handle key is not empty
    let name = key;
    if (name[0] == ':') {
      name = name.replace(':', 'by_');
    }

    if (type == RouteType.group) {
      return name;
    } else if (type == RouteType.middleware) {
      return `${name}_middleware`;
    } else {
      return `${type.toLowerCase()}_${name}`;
    }
  };

  static getFuncName = (
    route: Route,
    projType: ProjectType = ProjectType.Express
  ) => {
    return this.getFuncNameFromStr(
      route.parentPath,
      route.key,
      route.type,
      route.id!,
      projType
    );
  };

  static getImportStatement = (
    route: Route,
    projectType: ProjectType = ProjectType.Express
  ) => {
    let funcName = this.getFuncName(route, projectType);
    if (projectType == ProjectType.FastAPI) {
      if (route.type === RouteType.group) {
        return `from .${funcName}.${funcName}_router import ${funcName}_router;\n`;
      } else {
        return `from .${funcName} import ${funcName}\n`;
      }
    }

    if (route.type === RouteType.group) {
      return `import { ${funcName}_router } from './${funcName}/${funcName}_router.js';\n`;
    } else {
      return `import { ${funcName} } from './${funcName}.js'\n`;
    }
  };

  static getUseStatement = (
    route: Route,
    parentFuncName: string,
    projType: ProjectType = ProjectType.Express
  ) => {
    let funcName = this.getFuncName(route, projType);

    if (projType == ProjectType.FastAPI) {
      if (route.type === RouteType.group) {
        return `${parentFuncName}_router.include_router(${funcName}_router)\n`;
      } else if (route.type === RouteType.dependency) {
        return `Depends(${funcName}), `;
      } else {
        return `${parentFuncName}_router.add_api_route(methods=['${route.type.toUpperCase()}'], path="/${
          route.key
        }", endpoint=${funcName})\n`;
      }
    }

    if (route.type === RouteType.group) {
      return `${parentFuncName}_router.use('/${route.key}', ${funcName}_router)\n`;
    } else if (route.type === RouteType.middleware) {
      return `${parentFuncName}_router.use(${funcName})\n`;
    } else
      return `${parentFuncName}_router.${route.type.toLowerCase()}('/${
        route.key
      }', ${funcName})\n`;
  };
}
