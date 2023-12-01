// Disable no-unused-vars, broken for spread args
/* eslint no-unused-vars: off */
import { contextBridge, ipcRenderer, IpcRendererEvent } from 'electron';
import {
  Actions,
  EditorActions,
  FirebaseActions,
  ModuleActions,
  MongoActions,
  ProjectActions,
  ResendActions,
} from './actions';

export type Channels = 'ipc-example';

const projectHandler = {
  setCurProject: (payload: any) =>
    ipcRenderer.invoke(ProjectActions.SET_CURRENT_PROJECT, payload),
};

const firebaseHandler = {
  checkFirebaseCredentials: (payload: any) =>
    ipcRenderer.invoke(FirebaseActions.CHECK_FIREBASE_CREDENTIALS, payload),

  getCurrentFirebase: (payload: any) =>
    ipcRenderer.invoke(FirebaseActions.GET_CURRENT_FIREBASE, payload),

  createFbAuth: (payload: any) =>
    ipcRenderer.invoke(FirebaseActions.CREATE_FIREBASE_AUTH, payload),
  createFbFirestore: (payload: any) =>
    ipcRenderer.invoke(FirebaseActions.CREATE_FIREBASE_FIRESTORE, payload),
  setFirestoreMetadata: (payload: any) =>
    ipcRenderer.invoke(FirebaseActions.SET_FIRESTORE_METADATA, payload),
};

const moduleHandler = {
  showFuncContextMenu: (payload: any) =>
    ipcRenderer.invoke(Actions.SHOW_FUNC_CONTEXT_MENU, payload),
  onFuncDeleted: (payload: any) =>
    ipcRenderer.on(Actions.UPDATE_FUNC_DELETED, payload),
  removeFuncDeletedListener: () =>
    ipcRenderer.removeAllListeners(Actions.UPDATE_FUNC_DELETED),

  createFunc: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_NEW_FUNC, payload),

  createModule: (payload: any) =>
    ipcRenderer.invoke(ModuleActions.CREATE_MODULE, payload),

  showModuleContextMenu: (payload: any) =>
    ipcRenderer.invoke(ModuleActions.SHOW_MODULE_CONTEXT_MENU, payload),
  deleteModule: (payload: any) =>
    ipcRenderer.invoke(ModuleActions.DELETE_MODULE, payload),
  onModuleDeleteClicked: (payload: any) =>
    ipcRenderer.on(ModuleActions.UPDATE_MODULE_DELETE_CLICKED, payload),
  removeModuleDeleteClickedListener: () =>
    ipcRenderer.removeAllListeners(ModuleActions.UPDATE_MODULE_DELETE_CLICKED),

  addWebhookTemplates: (payload: any) =>
    ipcRenderer.invoke(ModuleActions.ADD_WEBHOOK_TEMPLATES, payload),

  setModuleMetadata: (payload: any) =>
    ipcRenderer.invoke(ModuleActions.SET_MODULE_METADATA, payload),
};

const mongoHandler = {
  getMongoCols: (payload: any) =>
    ipcRenderer.invoke(MongoActions.GET_MONGO_COLS, payload),
};

const resendHandler = {
  createEmailTemplate: (payload: any) =>
    ipcRenderer.invoke(ResendActions.CREATE_EMAIL_TEMPLATE, payload),
};

const envHandler = {
  getEnvVars: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_ENV_VARS, payload),
  createEnvVar: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_ENV_VAR, payload),
  deleteEnvVar: (payload: any) =>
    ipcRenderer.invoke(Actions.DELETE_ENV_VAR, payload),
  editEnvVars: (payload: any) =>
    ipcRenderer.invoke(Actions.EDIT_ENV_VAR, payload),
};

const editorHandler = {
  openFile: (payload: any) =>
    ipcRenderer.send(EditorActions.OPEN_FILE, payload),
  openProjectInVs: (payload: any) =>
    ipcRenderer.send(EditorActions.OPEN_PROJECT_IN_VS, payload),
  openProjectInIntelliJ: (payload: any) =>
    ipcRenderer.send(EditorActions.OPEN_PROJECT_IN_INTELLIJ, payload),
};

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, ...args: unknown[]) {
      ipcRenderer.send(channel, ...args);
    },
    on(channel: string, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args);

      ipcRenderer.on(channel, subscription);

      return () => {
        ipcRenderer.removeListener(channel, subscription);
      };
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args));
    },
  },

  // update check result
  updateCheckResult: (callback: any) =>
    ipcRenderer.on(Actions.UPDATE_CHECK_RESULT, callback),
  removeUpdateCheckResultListener: () =>
    ipcRenderer.removeAllListeners(Actions.UPDATE_CHECK_RESULT),

  // SEND ACTIONS

  setWindowSize: (payload: any) =>
    ipcRenderer.send(Actions.SET_WINDOW_SIZE, payload),
  getDeviceType: () => ipcRenderer.invoke(Actions.GET_DEVICE_TYPE),
  getAppPaths: () => ipcRenderer.invoke(Actions.GET_APP_PATHS),
  getNodeType: () => ipcRenderer.invoke(Actions.GET_NODE_TYPE),
  getOpenWithVs: () => ipcRenderer.invoke(Actions.GET_OPEN_WITH_VS),
  setOpenWithVs: (payload: any) =>
    ipcRenderer.invoke(Actions.SET_OPEN_WITH_VS, payload),
  checkVsRequirementsMet: () =>
    ipcRenderer.invoke(Actions.CHECK_VS_REQUIREMENTS_MET),

  getEditorToUse: () => ipcRenderer.invoke(Actions.GET_EDITOR_TO_USE),
  setEditorToUse: (payload: any) =>
    ipcRenderer.invoke(Actions.SET_EDITOR_TO_USE, payload),

  ...firebaseHandler,
  ...moduleHandler,
  ...mongoHandler,
  ...envHandler,
  ...resendHandler,
  ...editorHandler,
  ...projectHandler,

  createProject: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_PROJECT, payload),

  checkBinInstalled: (payload: any) =>
    ipcRenderer.invoke(Actions.CHECK_BIN_INSTALLED, payload),

  openCheckoutPage: (payload: any) =>
    ipcRenderer.invoke(Actions.OPEN_CHECKOUT_PAGE, payload),

  onCheckoutStatusUpdated: (callback: any) =>
    ipcRenderer.on(Actions.UPDATE_CHECKOUT_STATUS, callback),
  removeCheckoutStatusListener: () =>
    ipcRenderer.removeAllListeners(Actions.UPDATE_CHECKOUT_STATUS),

  openPortalPage: (payload: any) =>
    ipcRenderer.invoke(Actions.OPEN_CUSTOMER_PORTAL, payload),

  getFileContents: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_FILE_CONTENTS, payload),
  saveFileContents: (payload: any) =>
    ipcRenderer.invoke(Actions.SAVE_FILE_CONTENTS, payload),

  updateYamlAndGitPush: (payload: any) =>
    ipcRenderer.invoke(Actions.GIT_PUSH_PROJECT, payload),

  deleteProject: (payload: any) =>
    ipcRenderer.invoke(Actions.DELETE_PROJECT, payload),

  showRouteContextMenu: (payload: any) =>
    ipcRenderer.invoke(Actions.SHOW_ROUTE_CONTEXT_MENU, payload),

  onRouteDeleted: (listener: any) =>
    ipcRenderer.on(Actions.UPDATE_ROUTE_DELETED, listener),

  removeRouteListener: () =>
    ipcRenderer.removeAllListeners(Actions.UPDATE_ROUTE_DELETED),

  // ROUTE
  createRouteGroup: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_ROUTE_GROUP, payload),
  createEndpoint: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_ENDPOINT, payload),

  initProject: (payload: any) =>
    ipcRenderer.invoke(Actions.INIT_PROJECT, payload),

  runServer: (payload: any) => ipcRenderer.send(Actions.RUN_SERVER, payload),
  killServer: (payload: any) => ipcRenderer.send(Actions.KILL_SERVER, payload),

  getEndpointData: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_ENDPOINT_DATA, payload),

  // MongoDB Funcs
  getMongoConnDatabases: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_MONGO_CONN_DATABASES, payload),

  createMongoDbModule: (payload: any) =>
    ipcRenderer.invoke(Actions.CREATE_MONGODB_MODULE, payload),

  // Packages
  getProjectPackages: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_NPM_PACKAGES, payload),
  installNpmPackage: (payload: any) =>
    ipcRenderer.invoke(Actions.INSTALL_NPM_PACKAGE, payload),
  deleteNpmPackage: (payload: any) =>
    ipcRenderer.invoke(Actions.DELETE_NPM_PACKAGE, payload),

  // FUNCS
  getModuleFuncData: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_MODULE_FUNC_DATA, payload),
  saveModuleFuncData: (payload: any) =>
    ipcRenderer.invoke(Actions.SAVE_MODULE_FUNC_DATA, payload),

  // UPDATE TERMINAL
  onUpdateTerminal: (callback: any) =>
    ipcRenderer.on(Actions.UPDATE_TERMINAL, callback),

  removeTermListener: () =>
    ipcRenderer.removeAllListeners(Actions.UPDATE_TERMINAL),

  // auth
  setAuthTokens: (payload: any) =>
    ipcRenderer.invoke(Actions.SET_AUTH_TOKENS, payload),

  getAccessToken: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_ACCESS_TOKEN, payload),
  getRefreshToken: (payload: any) =>
    ipcRenderer.invoke(Actions.GET_REFRESH_TOKEN, payload),
  deleteAuthTokens: () => ipcRenderer.invoke(Actions.DELETE_AUTH_TOKENS),
};

contextBridge.exposeInMainWorld('electron', electronHandler);

export type ElectronHandler = typeof electronHandler;
