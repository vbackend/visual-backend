import { Route, RouteFuncs, RouteNode, RouteType } from '@/shared/models/route';
import React, { Dispatch, SetStateAction, useEffect, useRef } from 'react';
import '@/renderer/styles/Project/RouteRow.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { BiSolidFilePlus } from 'react-icons/bi';
import { useDispatch, useSelector } from 'react-redux';
import { setCurRoute } from '@/renderer/redux/project/projectSlice';
import { RootState } from '@/renderer/redux/store';
import { toggleRouteOpened } from '@/renderer/redux/routes/routesSlice';
import { EditorType, setCurFile } from '@/renderer/redux/editor/editorSlice';
import { Editor } from '@/renderer/redux/app/appSlice';
import { GenFuncs } from '@/shared/utils/GenFuncs';

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
  const editorToUse = useSelector((state: RootState) => state.app.editorToUse);

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
    let projType = curProject?.projectType;

    let path = `/src/api${node.parentFilePath}/${RouteFuncs.getFuncName(
      node,
      curProject!.projectType
    )}.${GenFuncs.getExtension(projType!)}`;

    if (node.type != RouteType.group) {
      let title =
        node.type == RouteType.middleware
          ? `Middleware: ${node.key}`
          : `${node.type.toUpperCase()} ${getRoutePath(node)}`;

      if (editorToUse != Editor.VISUALBACKEND) {
        window.electron.openFile({
          path,
          projKey: curProject!.key,
        });
      } else {
        dispatch(
          setCurFile({
            title: title,
            path,
            type: EditorType.Route,
            metadata: node,
          })
        );
      }

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
      console.log('Node:', node);
      await window.electron.showRouteContextMenu({
        route: node,
        projKey: curProject!.key,
        parent: parent,
      });
    }
  };

  const sortNodesByType = (nodes: RouteNode[]) => {
    let newNodes = [...nodes];
    return newNodes.sort((a: RouteNode, b: RouteNode) => {
      // Check if a is a priority type
      const aIsPriority =
        a.type === RouteType.middleware || a.type === RouteType.dependency;

      // Check if b is a priority type
      const bIsPriority =
        b.type === RouteType.middleware || b.type === RouteType.dependency;

      if (aIsPriority && !bIsPriority) {
        return -1; // a comes before b
      } else if (!aIsPriority && bIsPriority) {
        return 1; // b comes before a
      }

      // If both are priority types or both are not, maintain current order
      return 0;
    });
  };

  useEffect(() => {
    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [node]);

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
        <p className="path">{`${
          node.type != RouteType.middleware && node.type != RouteType.dependency
            ? '/'
            : ''
        }${node.key}`}</p>
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
        sortNodesByType(node.children).map(
          (childNode: RouteNode, index: number) => (
            <RouteRow
              key={childNode.id}
              node={childNode}
              level={level + 1}
              parent={node}
              setCreateModalOpen={setCreateModalOpen}
              setSelectedRoute={setSelectedRoute}
            />
          )
        )}
    </>
  );
}

export default RouteRow;
