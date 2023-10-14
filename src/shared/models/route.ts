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
  get = 'get',
  post = 'post',
  patch = 'patch',
  delete = 'delete',
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

  static getFuncNameFromStr = (key: string, type: string, id: number) => {
    if (key === '') return '';
    // let name = key.replace('-', ' ');
    // name = key.replace('_', ' ');
    let name = key;
    if (name[0] == ':') {
      name = name.replace(':', 'by_');
    }

    if (type == RouteType.group) {
      return name;
      // return this.camelise(name);
    } else if (type == RouteType.middleware) {
      return `${name}_middleware`;
      // return this.camelise(`${name} ${id} middleware`);
    }
    {
      return `${type.toLowerCase()}_${name}`;
      // return this.camelise(`${type.toLowerCase()} ${name} ${id}`);
    }
  };

  static getFuncName = (route: Route) => {
    return this.getFuncNameFromStr(route.key, route.type, route.id!);
  };

  static getImportStatement = (route: Route) => {
    if (route.type === RouteType.group) {
      let funcName = this.getFuncName(route);
      return `import { ${funcName}Router } from './${funcName}/${funcName}Router.js';\n`;
    } else {
      let funcName = this.getFuncName(route);
      return `import { ${funcName} } from './${funcName}.js'\n`;
    }
  };

  static getUseStatement = (route: Route, parentFuncName: string) => {
    if (route.type === RouteType.group) {
      return `${parentFuncName}Router.use('/${route.key}', ${this.getFuncName(
        route
      )}Router)\n`;
    } else if (route.type === RouteType.middleware) {
      return `${parentFuncName}Router.use(${this.getFuncName(route)})\n`;
    } else
      return `${parentFuncName}Router.${route.type.toLowerCase()}('/${
        route.key
      }', ${this.getFuncName(route)})\n`;
  };
}
