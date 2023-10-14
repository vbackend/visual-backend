import { Route, RouteNode } from '@/shared/models/route';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';

import '@/renderer/styles/Project/Routes/RoutesScreen.scss';
import ManageRoutesScreen from './ManageRoutesScreen';
import { deleteRoute } from '@/renderer/redux/routes/routesSlice';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';

function RoutesScreen() {
  const dispatch = useDispatch();
  const rootNode = useSelector((state: RootState) => state.routes.rootNode);
  const curFile = useSelector((state: RootState) => state.editor.currentFile);

  const insertRoute = (node: RouteNode, routes: Array<Route>) => {
    for (let i = 0; i < routes.length; i++) {
      if (routes[i].parentId == node.id) {
        let newRouteNode: RouteNode = { ...routes[i], children: [] };
        node.children.push(newRouteNode);
        insertRoute(newRouteNode, routes);
      }
    }
  };

  const curFileIsChild = (node: RouteNode, childId: number) => {
    if (node.id == childId) {
      return true;
    }

    for (let i = 0; i < node.children.length; i++) {
      if (curFileIsChild(node.children[i], childId)) {
        return true;
      }
    }
    return false;
  };
  const handleRouteDeleted = async (event: any, payload: any) => {
    if (
      curFile &&
      curFile.type == EditorType.Route &&
      curFileIsChild(payload, curFile.metadata.id)
    ) {
      dispatch(setCurFile(null));
    }
    dispatch(deleteRoute(payload));
  };

  useEffect(() => {
    window.electron.onRouteDeleted(handleRouteDeleted);

    return () => {
      window.electron.removeRouteListener();
    };
  }, [curFile]);

  if (rootNode === null) return <></>;
  return <ManageRoutesScreen rootNode={rootNode!} />;
}

export default RoutesScreen;
