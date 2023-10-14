import { BrowserWindow, app } from 'electron';
import { Actions } from '../../actions';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { ChildProcess, exec, spawn } from 'child_process';

function compareVersions(version1: string, version2: string) {
  const parts1 = version1.split('.').map(Number);
  const parts2 = version2.split('.').map(Number);

  for (let i = 0; i < parts1.length; i++) {
    if (parts1[i] < parts2[i]) {
      return -1;
    }
    if (parts1[i] > parts2[i]) {
      return 1;
    }
  }

  return 0;
}

const getNodePath = () => {
  let detectPathCmd =
    process.platform == 'darwin' ? 'which node' : 'where node';

  return new Promise((res, rej) => {
    exec(detectPathCmd, (whichError, whichStdout, whichStderr) => {
      if (!whichError) {
        const nodePath = whichStdout.trim();
        res(nodePath);
      } else res(null);
    });
  });
};

const checkNodeVer = async (w: BrowserWindow) => {
  return new Promise((res, rej) => {
    let nodePath = BinFuncs.getNodeBinPath();
    exec(`${nodePath} -v`, async (err, stdout, stderr) => {
      if (err) {
        w.webContents.send(Actions.UPDATE_TERMINAL, {
          type: 'error',
          data: 'Node is not installed. Please install node ver <= 18.17.1',
        });
        res(false);
        return;
      }

      let nodeVersion = stdout.trim().slice(1);
      const requiredVersion = '18.17.1';
      if (compareVersions(nodeVersion, requiredVersion) <= 0) {
        res(true);
      } else {
        let nodePath = await getNodePath();
        w.webContents.send(Actions.UPDATE_TERMINAL, {
          type: 'error',
          data: `Node version detected is ${nodeVersion}. Required version is <= 18.17.1${
            nodePath && `\nPath to node used: ${nodePath}`
          }`,
        });
        res(false);
        return;
      }
    });
  });
};

async function startServer(
  g: {
    serverProcess: ChildProcess | null;
  },
  projPath: string,
  port: string,
  window: BrowserWindow
) {
  window.webContents.send(Actions.UPDATE_TERMINAL, {
    data: 'Starting server...',
  });

  let finalPort = port ? port : '8080';
  console.log('Port:', port);

  let npmPath = BinFuncs.getNpmPath();
  g.serverProcess = spawn(npmPath, ['run', 'dev', finalPort, '--silent'], {
    cwd: projPath,
  });

  g.serverProcess.on('spawn', () => {
    window.webContents.send(Actions.UPDATE_TERMINAL, {
      type: 'SPAWNED',
    });
  });

  g.serverProcess.on('close', (code) => {
    window.webContents.send(Actions.UPDATE_TERMINAL, {
      type: 'CLOSED',
      data: 'Server process closed',
    });
    g.serverProcess = null;
  });

  if (g.serverProcess && g.serverProcess.stdout && g.serverProcess.stderr) {
    g.serverProcess.stdout.on('data', (data) => {
      const decoder = new TextDecoder('utf-8');

      window.webContents.send(Actions.UPDATE_TERMINAL, {
        type: 'stdout',
        data: data.toString(),
      });
    });

    g.serverProcess.stderr.on('data', (data) => {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(data);
      console.log('Server process encountered an error: ', text);
      window.webContents.send(Actions.UPDATE_TERMINAL, {
        type: 'error',
        data: text,
      });
    });
  }
}

import treeKill from 'tree-kill';
import { BinFuncs, MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
export async function stopServer(g: { serverProcess: ChildProcess | null }) {
  return new Promise(async (resolve, reject) => {
    if (g.serverProcess) {
      console.log('Killing process with pid:', g.serverProcess.pid);
      treeKill(g.serverProcess.pid!, (err) => {});

      g.serverProcess.on('exit', () => {
        g.serverProcess = null;
        resolve(true);
      });
    } else {
      resolve(true);
    }
  });
}

export const runServer = async (
  event: Electron.IpcMainEvent,
  payload: any,
  window: any,
  g: {
    serverProcess: ChildProcess | null;
  }
) => {
  const decoder = new TextDecoder('utf-8');

  const { projKey, port } = payload;

  let projPath = PathFuncs.getProjectPath(projKey);
  await stopServer(g);

  await GenFuncs.timeout(500);
  startServer(g, projPath, port, window);
};

export const killServer = (
  event: Electron.IpcMainEvent,
  payload: any,
  window: any,
  g: {
    serverProcess: ChildProcess | null;
  }
) => {
  stopServer(g);
};
