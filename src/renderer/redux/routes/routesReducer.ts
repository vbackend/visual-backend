import { Route, RouteNode } from '@/shared/models/route';
import { RoutesState } from './routesSlice';

export const toggleRouteOpenedReducer = (state: RoutesState, action: any) => {
  let route = action.payload;
  if (!state.openedRoutes[route.id]) {
    state.openedRoutes[route.id] = false;
  }
  state.openedRoutes[route.id] = !state.openedRoutes[route.id];
};

const insertRoute = (node: RouteNode, routes: Array<Route>) => {
  for (let i = 0; i < routes.length; i++) {
    if (routes[i].parentId == node.id) {
      let newRouteNode: RouteNode = { ...routes[i], children: [] };
      node.children.push(newRouteNode);
      insertRoute(newRouteNode, routes);
    }
  }
};

export const initRoutesReducer = (state: RoutesState, action: any) => {
  let routes = action.payload.routes;

  let root = null;
  routes.map((route: Route) => {
    if (route.parentId == -1) {
      root = { ...route, children: [] };
      insertRoute(root, routes);
    }
  });
  state.rootNode = root;
  state.routes = action.payload.routes;
  state.openedRoutes = {};
};

const insertNodeRecursive = (curNode: RouteNode, newNode: RouteNode) => {
  if (curNode.id == newNode.parentId) {
    curNode.children.push(newNode);
    return curNode;
  }

  for (let i = 0; i < curNode.children.length; i++) {
    curNode.children[i] = insertNodeRecursive(curNode.children[i], newNode);
  }

  return curNode;
};

export const addRouteReducer = (state: RoutesState, action: any) => {
  let newNode = action.payload;

  state.rootNode = insertNodeRecursive(state.rootNode!, newNode);
};

const deleteNodeRecursive = (curNode: RouteNode, deletedNode: RouteNode) => {
  if (curNode.id == deletedNode.parentId) {
    curNode.children = curNode.children.filter(
      (child) => child.id !== deletedNode.id
    );
    return curNode;
  }

  for (let i = 0; i < curNode.children.length; i++) {
    curNode.children[i] = deleteNodeRecursive(curNode.children[i], deletedNode);
  }

  return curNode;
};
export const deleteRouteReducer = (state: RoutesState, action: any) => {
  let deletedNode = action.payload;
  state.rootNode = deleteNodeRecursive(state.rootNode!, deletedNode);
};
