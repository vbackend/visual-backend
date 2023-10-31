import { Route, RouteFuncs, RouteNode, RouteType } from '@/shared/models/route';
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useRef,
  useState,
} from 'react';
import '@/renderer/styles/Project/RouteRow.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { BiSolidFilePlus } from 'react-icons/bi';

import Margin from 'renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { setCurRoute } from '@/renderer/redux/project/projectSlice';
import { RootState } from '@/renderer/redux/store';
import { toggleRouteOpened } from '@/renderer/redux/routes/routesSlice';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';

type RouteRowProps = {
  node: RouteNode;
  parent: RouteNode | null;
  level: number;
  setCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  setSelectedRoute: Dispatch<SetStateAction<Route | null>>;
};

function RouteRow({
  node,
  parent,
  level,
  setCreateModalOpen,
  setSelectedRoute,
}: RouteRowProps) {
  const dispatch = useDispatch();
  const routeBtnRef: any = useRef(null);
  const routeRef: any = useRef(null);
  const curProject = useSelector(
    (state: RootState) => state.app.currentProject
  );

  const routeClicked = () => {
    dispatch(setCurRoute(node));
  };

  const openedRoutes = useSelector(
    (state: RootState) => state.routes.openedRoutes
  );

  const getRoutePath = (route: Route) => {
    if (route.key == '') {
      return route.parentPath;
    } else {
      return `${route.parentPath}/${route.key}`;
    }
  };

  const rowClicked = (e: any) => {
    if (node.type != RouteType.group) {
      let title =
        node.type == RouteType.middleware
          ? `Middleware: ${node.key}`
          : `${node.type.toUpperCase()}   ${getRoutePath(node)}`;

      window.electron.openFile({
        path: `/src/api${node.parentFilePath}/${RouteFuncs.getFuncName(
          node
        )}.ts`,
        projKey: curProject!.key,
      });
      // dispatch(
      //   setCurFile({
      //     title: title,
      //     path: `/src/api${node.parentFilePath}/${RouteFuncs.getFuncName(
      //       node
      //     )}.ts`,
      //     type: EditorType.Route,
      //     metadata: node,
      //   })
      // );

      return;
    }
    let clickOnRoute =
      routeBtnRef.current.contains(e.target) ||
      e.target === routeBtnRef.current;
    if (!clickOnRoute) {
      dispatch(toggleRouteOpened(node));
    }
  };

  const handleContextMenu = async (e: any) => {
    if (routeRef.current.contains(e.target)) {
      e.preventDefault();
      await window.electron.showRouteContextMenu({
        route: node,
        projKey: curProject!.key,
        parent: parent,
      });
    }
  };

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return (
    <>
      <div
        ref={routeRef}
        className="routeRow"
        onClick={rowClicked}
        onDoubleClick={() => {
          if (node.type != RouteType.group) {
            routeClicked();
          }
        }}
        style={{ marginLeft: `${10 * level}px` }}
      >
        <FontAwesomeIcon
          icon={faChevronRight}
          className={`chevronIcon ${
            openedRoutes[node.id!] && 'chevronIconOpened'
          } ${node.type != RouteType.group && 'chevronIconHidden'}`}
        />
        <p className="type">{node.type.slice(0, 3).toUpperCase()}</p>
        <p className="path">{`${node.type != RouteType.middleware ? '/' : ''}${
          node.key
        }`}</p>
        {node.type === RouteType.group && (
          <>
            <button
              ref={routeBtnRef}
              className="groupActionBtn"
              onClick={() => {
                setCreateModalOpen(true);
                setSelectedRoute(node);
              }}
              onContextMenu={(e) => handleContextMenu(e)}
            >
              <BiSolidFilePlus className="icon" />
            </button>
          </>
        )}
      </div>
      {openedRoutes[node.id!] &&
        node.children.map((childNode: RouteNode, index: number) => (
          <RouteRow
            key={childNode.id}
            node={childNode}
            level={level + 1}
            parent={node}
            setCreateModalOpen={setCreateModalOpen}
            setSelectedRoute={setSelectedRoute}
          />
        ))}
    </>
  );
}

export default RouteRow;
