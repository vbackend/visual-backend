import { BrowserWindow, app } from 'electron';
import { Actions } from '../../actions';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { ChildProcess, spawn } from 'child_process';

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

  let npmPath = BinFuncs.getNpmPath();
  let { projKey, projType } = MainFuncs.getCurProject();

  if (projType == ProjectType.FastAPI) {
    g.serverProcess = spawn(
      BinFuncs.getEnvPyPath(projKey),
      ['-m', 'uvicorn', 'src.main:app', '--port', finalPort],
      {
        cwd: projPath,
      }
    );
  } else {
    g.serverProcess = spawn(npmPath, ['run', 'dev', finalPort, '--silent'], {
      cwd: projPath,
    });
  }

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
import { ProjectType } from '@/shared/models/project';
export async function stopServer(g: { serverProcess: ChildProcess | null }) {
  return new Promise(async (resolve, reject) => {
    if (g.serverProcess) {
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
