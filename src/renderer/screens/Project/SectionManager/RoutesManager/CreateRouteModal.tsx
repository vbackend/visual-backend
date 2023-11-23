import { Dispatch, SetStateAction, useState } from 'react';
import '@/renderer/styles/Project/CreateRouteModal.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faXmark } from '@fortawesome/free-solid-svg-icons';
import { Button, Dropdown, Input, Menu, MenuProps, Select } from 'antd';
import Margin from 'renderer/components/general/Margin';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'renderer/redux/store';
import { Route, RouteNode, RouteType } from '@/shared/models/route';
import { addRoute } from '@/renderer/redux/routes/routesSlice';
import { ProjectType } from '@/shared/models/project';

type CreateRouteModalProps = {
  setCreateModalOpen: Dispatch<SetStateAction<boolean>>;
  selectedRoute: Route;
};
function CreateRouteModal({
  setCreateModalOpen,
  selectedRoute,
}: CreateRouteModalProps) {
  const project = useSelector((state: RootState) => state.app.currentProject);
  const [name, setName] = useState('');
  const [type, setType] = useState('grp');
  const [errorText, setErrorText] = useState('');
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  function sanitizePath(path: string) {
    // Remove leading and trailing spaces
    const trimmedPath = path.trim();

    // Remove consecutive slashes and replace with a single slash
    const normalizedPath = trimmedPath.replace(/\/+/g, '/');

    // Ensure the path starts with a slash
    const sanitizedPath = normalizedPath.startsWith('/')
      ? normalizedPath.slice(1)
      : normalizedPath;

    return sanitizedPath;
  }

  function isValidString(key: string): { valid: boolean; error: string } {
    if (
      key.length === 0 &&
      type != RouteType.group &&
      type != RouteType.middleware &&
      type != RouteType.dependency
    ) {
      return { valid: true, error: '' };
    }

    if (key.length == 0) {
      return { valid: false, error: 'Path name cannot be empty for this type' };
    }
    // Regular expression for valid JavaScript function names
    const validFunctionNameRegex = /^[:]?[a-zA-Z_$][a-zA-Z0-9_$]*$/;

    // Regular expression for valid URL path components
    const validPathComponentRegex = /^[a-zA-Z0-9\-._~!$&'()*+,;=:@/]*$/;

    // Check if the key is valid as both a JavaScript function name and a URL path component
    return {
      valid:
        validFunctionNameRegex.test(key) && validPathComponentRegex.test(key),
      error:
        "Path name can only contain alphanumeric characters and '_' or a ':' at the start. It also cannot begin with numbers.",
    };
  }

  const createClicked = async () => {
    setLoading(true);
    let path = sanitizePath(name);

    let { valid, error } = isValidString(path);
    if (!valid) {
      setErrorText(error);
      return;
    }

    setErrorText('');

    if (type == RouteType.group) {
      let { error, newRoute } = await window.electron.createRouteGroup({
        projKey: project!.key,
        curRoute: selectedRoute,
        routeKey: path,
      });

      if (error) {
        setErrorText(error);
        setLoading(false);
        return;
      }
      setLoading(false);
      let newNode: RouteNode = { ...newRoute, children: [] };
      dispatch(addRoute(newNode));
      setCreateModalOpen(false);
    } else {
      let { error, newRoute } = await window.electron.createEndpoint({
        projKey: project!.key,
        routeKey: path,
        curRoute: selectedRoute,
        method: type,
      });

      if (error) {
        setErrorText(error);
        setLoading(false);
        return;
      }

      setLoading(false);
      let newNode: RouteNode = { ...newRoute, children: [] };
      dispatch(addRoute(newNode));
      setCreateModalOpen(false);
    }
  };

  return (
    <div className="modalBackground">
      <div className="contentContainer">
        <div className="topBar">
          <p className="title">Create route</p>

          <button
            className="closeBtn"
            onClick={() => {
              setCreateModalOpen(false);
            }}
          >
            <FontAwesomeIcon icon={faXmark} className="icon" />
          </button>
        </div>

        <div>
          <p className="recText">
            It's recommended to use snake_case for route names
          </p>
          <Select
            className="methodSelect"
            defaultValue="grp"
            style={{ width: 150 }}
            onChange={(val) => setType(val)}
            options={[
              { value: 'grp', label: 'GROUP' },
              project?.projectType == ProjectType.FastAPI
                ? { value: 'dep', label: 'DEPENDENCY' }
                : { value: 'mid', label: 'MIDDLEWARE' },
              { value: 'get', label: 'GET' },
              { value: 'put', label: 'PUT' },
              { value: 'post', label: 'POST' },
              { value: 'delete', label: 'DELETE' },
              { value: 'patch', label: 'PATCH' },
            ]}
          />
          <Margin height={20} />
        </div>

        <div className="pathContainer">
          <Input
            placeholder={`${
              type == RouteType.middleware ? 'Middleware name' : 'path_name'
            }`}
            className="createInput"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <Margin height={20} />
        <Button type="primary" onClick={() => createClicked()}>
          Create
        </Button>
        {errorText && <p className="errorText">{errorText}</p>}
      </div>
    </div>
  );
}

export default CreateRouteModal;
