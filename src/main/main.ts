/* eslint global-require: off, no-console: off, promise/always-return: off */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build:main`, this file is compiled to
 * `./src/main.js` using webpack. This gives us some performance wins.
 */
import path from 'path';
import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  Menu,
  globalShortcut,
  nativeTheme,
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  Actions,
  EditorActions,
  FirebaseActions,
  ModuleActions,
  MongoActions,
  ProjectActions,
  ResendActions,
} from './actions';
import { ChildProcess } from 'child_process';
import {
  createModule,
  deleteModule,
  setModuleMetadata,
  showModuleContextMenu,
} from './ipc/project/modules/moduleFuncs';
import {
  getMongoCols,
  getMongoDbs,
} from './ipc/project/modules/mongodb/mongoFuncs';
import {
  checkBinInstalled,
  createProject,
  deleteProject,
  initProject,
  setCurProject,
  updateYamlAndGitPush,
} from './ipc/project/projectFuncs';
import {
  createRouteGroup,
  createEndpoint,
  deleteRoute,
} from './ipc/project/routeFuncs';
import { runServer, killServer } from './ipc/terminal/terminalFuncs';

import fixPath from 'fix-path';
import {
  deleteNpmPackage,
  getProjectPackages,
  installNpmPackage,
} from './ipc/project/packageFuncs';

import Store from 'electron-store';
import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './ipc/auth/authFuncs';
import {
  getFileContents,
  openFile,
  openProjectInIntelliJ,
  openProjectInVs,
  saveFileContents,
} from './ipc/project/editorFuncs';
import { FileFuncs } from './helpers/fileFuncs';

import treeKill from 'tree-kill';
import { BinFuncs } from '@/shared/utils/MainFuncs';
import {
  checkFirebaseCredentials,
  getCurrentFirebase,
  setFirestoreMetadata,
} from './ipc/project/modules/firebase/firebaseFuncs';
import {
  createEnvVar,
  deleteEnvVar,
  editEnvVars,
  getEnvVars,
} from './ipc/project/envFuncs';
import { createEmailTemplate } from './ipc/project/modules/resend/resendFuncs';
import { createFunc, deleteFunc } from './ipc/project/modules/funcFuncs';
import { addWebhookTemplates } from './ipc/project/modules/stripe/stripeFuncs';
import {
  openCheckoutPage,
  openCustomerPortal,
} from './ipc/auth/subscriptionFuncs';
import { config } from 'dotenv';
import { initNodeBinaries, setNodeType } from './helpers/binFuncs';
import {
  checkVsRequirementsMet,
  getDeviceType,
  getEditorToUse,
  getNodeType,
  getOpenWithVs,
  setEditorToUse,
  setOpenWithVs,
  setWindowSze,
} from './ipc/home/homeFuncs';
import { electronStoreKeys, homeWindowSize } from '@/renderer/misc/constants';
import { Editor } from '@/shared/models/Editor';

config();

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

autoUpdater.autoDownload = false;
autoUpdater.autoInstallOnAppQuit = false;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

const isDebug =
  process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true';

if (isDebug) {
  require('electron-debug')();
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = ['REACT_DEVELOPER_TOOLS'];

  return installer
    .default(
      extensions.map((name) => installer[name]),
      forceDownload
    )
    .catch(console.log);
};

const createWindow = async () => {
  if (isDebug) {
    // await installExtensions();
  }

  const RESOURCES_PATH = app.isPackaged
    ? path.join(process.resourcesPath, 'assets')
    : path.join(__dirname, '../../assets');

  const getAssetPath = (...paths: string[]): string => {
    return path.join(RESOURCES_PATH, ...paths);
  };

  mainWindow = new BrowserWindow({
    show: false,
    ...homeWindowSize,
    // maxWidth: 500,
    // transparent: true,
    // frame: false,

    icon: getAssetPath('icon.png'),
    webPreferences: {
      // devTools: false,
      preload: app.isPackaged
        ? path.join(__dirname, 'preload.js')
        : path.join(__dirname, '../../.erb/dll/preload.js'),
    },
  });

  mainWindow.loadURL(resolveHtmlPath('index.html'));

  mainWindow.on('ready-to-show', async () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    if (process.env.START_MINIMIZED) {
      mainWindow.minimize();
    } else {
      mainWindow.show();
    }
  });

  mainWindow.on('close', async () => {});

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();

  // Open urls in the user's browser
  mainWindow.webContents.setWindowOpenHandler((edata: any) => {
    shell.openExternal(edata.url);
    return { action: 'deny' };
  });

  // Remove this if your app does not use auto updates
  // new AppUpdater();
};

// EVENT LISTENERS
let globalVars: {
  serverProcess: ChildProcess | null;
  store: Store;
} = {
  serverProcess: null,
  store: new Store(),
};

const init = async () => {
  // Home Funcs
  nativeTheme.themeSource = 'light';
  ipcMain.on(Actions.SET_WINDOW_SIZE, (_, p: any) =>
    setWindowSze(p, mainWindow!)
  );

  ipcMain.handle(Actions.GET_DEVICE_TYPE, getDeviceType);
  ipcMain.handle(Actions.GET_NODE_TYPE, getNodeType);
  ipcMain.handle(Actions.CHECK_BIN_INSTALLED, checkBinInstalled);
  ipcMain.handle(Actions.GET_OPEN_WITH_VS, getOpenWithVs);
  ipcMain.handle(Actions.SET_OPEN_WITH_VS, (e: any, p: any) =>
    setOpenWithVs(e, p, mainWindow!)
  );
  ipcMain.handle(Actions.CHECK_VS_REQUIREMENTS_MET, checkVsRequirementsMet);

  ipcMain.handle(Actions.GET_EDITOR_TO_USE, getEditorToUse);
  ipcMain.handle(Actions.SET_EDITOR_TO_USE, (e: any, p: any) => {
    setEditorToUse(e, p, mainWindow!);
  });

  ipcMain.handle(Actions.OPEN_CHECKOUT_PAGE, openCheckoutPage);
  ipcMain.handle(Actions.OPEN_CUSTOMER_PORTAL, openCustomerPortal);

  // PROJECT
  ipcMain.handle(Actions.CREATE_PROJECT, createProject);
  ipcMain.handle(Actions.GET_FILE_CONTENTS, getFileContents);
  ipcMain.handle(Actions.SAVE_FILE_CONTENTS, saveFileContents);
  ipcMain.handle(Actions.GIT_PUSH_PROJECT, updateYamlAndGitPush);
  ipcMain.handle(Actions.DELETE_PROJECT, deleteProject);
  ipcMain.handle(Actions.GET_NPM_PACKAGES, getProjectPackages);
  ipcMain.handle(Actions.INSTALL_NPM_PACKAGE, installNpmPackage);
  ipcMain.handle(Actions.DELETE_NPM_PACKAGE, deleteNpmPackage);

  // ROUTE
  ipcMain.handle(Actions.CREATE_ROUTE_GROUP, createRouteGroup);
  ipcMain.handle(Actions.CREATE_ENDPOINT, createEndpoint);

  ipcMain.handle(Actions.SHOW_ROUTE_CONTEXT_MENU, (e, p) =>
    deleteRoute(e, p, mainWindow!)
  );

  // MODULE & FUNCS GENERAL
  ipcMain.handle(Actions.CREATE_NEW_FUNC, createFunc);
  ipcMain.handle(Actions.SHOW_FUNC_CONTEXT_MENU, (e, p) =>
    deleteFunc(e, p, mainWindow!)
  );

  //
  ipcMain.on(Actions.RUN_SERVER, (event: Electron.IpcMainEvent, payload: any) =>
    runServer(event, payload, mainWindow, globalVars)
  );

  ipcMain.on(
    Actions.KILL_SERVER,
    (event: Electron.IpcMainEvent, payload: any) =>
      killServer(event, payload, mainWindow, globalVars)
  );

  ipcMain.handle(Actions.INIT_PROJECT, initProject);

  // db funcs
  ipcMain.handle(Actions.GET_MONGO_CONN_DATABASES, getMongoDbs);

  // auth funcs
  ipcMain.handle(Actions.SET_AUTH_TOKENS, (e: any, p: any) =>
    setAuthTokens(e, p, globalVars)
  );

  ipcMain.handle(Actions.GET_ACCESS_TOKEN, (e: any, p: any) =>
    getAccessToken(e, p, globalVars)
  );

  ipcMain.handle(Actions.GET_REFRESH_TOKEN, getRefreshToken);
  ipcMain.handle(Actions.DELETE_AUTH_TOKENS, deleteTokens);
};

const projectInit = async () => {
  ipcMain.handle(ProjectActions.SET_CURRENT_PROJECT, setCurProject);
};

const mongoInit = async () => {
  ipcMain.handle(MongoActions.GET_MONGO_COLS, getMongoCols);
};

const firebaseInit = async () => {
  ipcMain.handle(
    FirebaseActions.CHECK_FIREBASE_CREDENTIALS,
    checkFirebaseCredentials
  );

  ipcMain.handle(FirebaseActions.GET_CURRENT_FIREBASE, getCurrentFirebase);
  ipcMain.handle(FirebaseActions.SET_FIRESTORE_METADATA, setFirestoreMetadata);
};

const moduleInit = async () => {
  ipcMain.handle(ModuleActions.SHOW_MODULE_CONTEXT_MENU, (e, p) =>
    showModuleContextMenu(p, mainWindow!)
  );

  ipcMain.handle(ModuleActions.CREATE_MODULE, createModule);
  ipcMain.handle(ModuleActions.DELETE_MODULE, deleteModule);
  ipcMain.handle(ModuleActions.ADD_WEBHOOK_TEMPLATES, addWebhookTemplates);
  ipcMain.handle(ModuleActions.SET_MODULE_METADATA, setModuleMetadata);
};

const envInit = async () => {
  ipcMain.handle(Actions.GET_ENV_VARS, getEnvVars);
  ipcMain.handle(Actions.CREATE_ENV_VAR, createEnvVar);
  ipcMain.handle(Actions.DELETE_ENV_VAR, deleteEnvVar);
  ipcMain.handle(Actions.EDIT_ENV_VAR, editEnvVars);
};

const resendInit = async () => {
  ipcMain.handle(ResendActions.CREATE_EMAIL_TEMPLATE, createEmailTemplate);
};

const editorInit = async () => {
  ipcMain.on(EditorActions.OPEN_FILE, openFile);
  ipcMain.on(EditorActions.OPEN_PROJECT_IN_VS, openProjectInVs);

  ipcMain.on(EditorActions.OPEN_PROJECT_IN_INTELLIJ, openProjectInIntelliJ);
};

let quitting = false;
app.on('before-quit', async (e) => {
  if (!quitting && globalVars.serverProcess && globalVars.serverProcess.pid) {
    quitting = true;
    e.preventDefault();
    treeKill(globalVars.serverProcess.pid, (err) => {
      globalVars.serverProcess = null;
      if (err) {
        console.error('Error killing process:', err);
      }
      app.quit(); // Call app.quit() once when quitting is confirmed
    });
  }
});

app.on('window-all-closed', async () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed

  app.quit();
});

app.on('quit', async () => {});

app.setAsDefaultProtocolClient('visual-backend');

app.on('open-url', (event, url) => {
  const parsedUrl = new URL(url);
  if (url.includes('visual-backend://checkout_completed')) {
    if (mainWindow) {
      mainWindow.webContents.send(
        Actions.UPDATE_CHECKOUT_STATUS,
        parsedUrl.pathname
      );
    }
  }
});

const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
    // the commandLine is array of strings in which last element is deep link url
    console.log('Welcome Back', `You arrived from: ${commandLine.pop()}`);
  });

  // // Create mainWindow, load the rest of the app, etc...
  // app.whenReady().then(() => {
  //   createWindow()
  // })
}

app
  .whenReady()
  .then(async () => {
    // autoUpdater.checkForUpdates();

    // await initNodeBinaries();
    // await setNodeType();

    createWindow();
    fixPath();

    await FileFuncs.createDirIfNotExists(
      path.join(app.getPath('userData'), 'projects')
    );

    await FileFuncs.createDirIfNotExists(BinFuncs.getBinOutputFolder());

    let s = new Store();
    if (!s.get(electronStoreKeys.editorToUseKey)) {
      s.set(electronStoreKeys.editorToUseKey, Editor.VISUALBACKEND);
    }

    init();
    projectInit();
    firebaseInit();
    moduleInit();
    mongoInit();
    envInit();
    resendInit();
    editorInit();

    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);

autoUpdater.on('update-available', (info) => {
  mainWindow?.webContents.send(
    Actions.UPDATE_CHECK_RESULT,
    `UPDATE AVAILABLE: ${info}`
  );
});

autoUpdater.on('update-not-available', (info) => {
  mainWindow?.webContents.send(
    Actions.UPDATE_CHECK_RESULT,
    `UPDATE NOT AVAILABLE ${info}`
  );
});

autoUpdater.on('update-downloaded', (info) => {
  mainWindow?.webContents.send(
    Actions.UPDATE_CHECK_RESULT,
    `UPDATE downloaded ${info}`
  );
});

autoUpdater.on('error', (info) => {
  mainWindow?.webContents.send(
    Actions.UPDATE_CHECK_RESULT,
    `UPDATE check error ${info}`
  );
});
