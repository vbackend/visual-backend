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
} from 'electron';
import { autoUpdater } from 'electron-updater';
import log from 'electron-log';
import MenuBuilder from './menu';
import { resolveHtmlPath } from './util';
import {
  Actions,
  FirebaseActions,
  ModuleActions,
  MongoActions,
  ResendActions,
} from './actions';
import { ChildProcess } from 'child_process';
import {
  createModule,
  deleteModule,
  showModuleContextMenu,
} from './ipc/project/modules/moduleFuncs';
import {
  getDbCols,
  getMongoCols,
  getMongoDbs,
} from './ipc/project/modules/mongodb/mongoFuncs';
import {
  createProject,
  deleteProject,
  initProject,
  updateYamlAndGitPush,
} from './ipc/project/projectFuncs';
import {
  createRouteGroup,
  createEndpoint,
  deleteRoute,
} from './ipc/project/routeFuncs';
import {
  runServer,
  killServer,
  stopServer,
} from './ipc/terminal/terminalFuncs';

class AppUpdater {
  constructor() {
    log.transports.file.level = 'info';
    autoUpdater.logger = log;
    autoUpdater.checkForUpdatesAndNotify();
  }
}

let mainWindow: BrowserWindow | null = null;

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
    width: 650,
    height: 550,
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
  // eslint-disable-next-line
  new AppUpdater();
};

/**
 * Add event listeners...
 */
import Store from 'electron-store';
import {
  deleteTokens,
  getAccessToken,
  getRefreshToken,
  setAuthTokens,
} from './ipc/auth/authFuncs';
import { getFileContents, saveFileContents } from './ipc/project/editorFuncs';
import { FileFuncs } from './helpers/fileFuncs';
let globalVars: {
  serverProcess: ChildProcess | null;
  store: Store;
} = {
  serverProcess: null,
  store: new Store(),
};

import fixPath from 'fix-path';
import {
  deleteNpmPackage,
  getProjectPackages,
  installNpmPackage,
} from './ipc/project/packageFuncs';

import fs from 'fs';
import zlib from 'zlib';
import tar from 'tar';
import AdmZip from 'adm-zip';
import os from 'os';

function is64Bit() {
  return ['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch());
}

const unzipNodeMac = async () => {
  let tarFileName =
    process.arch == 'arm64' ? 'node-lts-arm64.tar.gz' : 'node-lts-x64.tar.gz';
  let inputPath = path.join(MainFuncs.getAssetsPath(), tarFileName);
  let outputFolder = BinFuncs.getBinOutputFolder();
  const outputPath = path.join(outputFolder, 'node-lts');

  let nodeExists = await FileFuncs.folderExists(outputPath);
  if (nodeExists) return;

  try {
    const readStream = fs.createReadStream(inputPath);
    const gunzip = zlib.createGunzip();
    readStream.pipe(gunzip);

    const extract = tar.extract({
      cwd: outputFolder, // Set the output directory for extraction
    });
    gunzip.pipe(extract);

    await new Promise((resolve, reject) => {
      extract.on('error', reject);
      extract.on('end', async () => {
        let nodeFolderName =
          process.arch == 'arm64'
            ? 'node-v18.17.1-darwin-arm64'
            : 'node-v18.17.1-darwin-x64';
        let oldDir = path.join(outputFolder, nodeFolderName);
        let newDir = outputPath;

        await FileFuncs.renameDir(oldDir, newDir);
        resolve(true);
      });
    });

    console.log('Extraction completed successfully.');
  } catch (err) {
    console.error('Error extracting the archive:', err);
  }
};

const unzipNodeWindows = async () => {
  let outputFolder = BinFuncs.getBinOutputFolder();

  const outputPath = path.join(outputFolder, 'node-lts');

  let nodeExists = await FileFuncs.folderExists(outputPath);
  if (nodeExists) return;

  let zipFileName = is64Bit() ? 'node-lts-win-x64.zip' : 'node-lts-win-x86.zip';
  const zipFilePath = path.join(MainFuncs.getAssetsPath(), zipFileName);

  const zip = new AdmZip(zipFilePath);

  try {
    zip.extractAllTo(outputFolder);

    let zipOutputName = is64Bit()
      ? 'node-v18.17.1-win-x64'
      : 'node-v18.17.1-win-x86';
    FileFuncs.renameDir(path.join(outputFolder, zipOutputName), outputPath);
  } catch (error: any) {
    console.error('Error extracting .zip file:', error.message);
  }
};

const init = async () => {
  ipcMain.on(
    Actions.SET_WINDOW_SIZE,
    (e: Electron.IpcMainEvent, payload: any) => {
      mainWindow?.setSize(payload.width, payload.height);
    }
  );

  ipcMain.handle(
    Actions.GET_DEVICE_TYPE,
    (e: Electron.IpcMainInvokeEvent, payload: any) => {
      return process.platform;
    }
  );

  ipcMain.handle(
    Actions.GET_APP_PATHS,
    (e: Electron.IpcMainInvokeEvent, payload: any) => {
      return {
        userData: app.getPath('userData'),
        dirname: __dirname,
      };
    }
  );

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

import treeKill from 'tree-kill';
import { BinFuncs, MainFuncs } from '@/shared/utils/MainFuncs';
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

app.on('window-all-closed', async () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed

  app.quit();
});

app.on('quit', async () => {});

app.setAsDefaultProtocolClient('visual-backend');

import url from 'node:url';

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
    createWindow();
    fixPath();

    await FileFuncs.createDirIfNotExists(
      path.join(app.getPath('userData'), 'projects')
    );

    await FileFuncs.createDirIfNotExists(BinFuncs.getBinOutputFolder());

    if (process.platform == 'darwin') {
      unzipNodeMac();
    } else {
      unzipNodeWindows();
    }

    init();
    firebaseInit();
    moduleInit();
    mongoInit();
    envInit();
    resendInit();

    app.on('activate', async () => {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (mainWindow === null) createWindow();
    });
  })
  .catch(console.log);
