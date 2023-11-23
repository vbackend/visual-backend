import { FileFuncs } from '@/main/helpers/fileFuncs';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { BinFuncs, MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import { exec, fork, spawn } from 'child_process';
import path from 'path';

export const checkPython3Ver = (): Promise<{
  installed: boolean;
  error: string;
}> => {
  return new Promise((res, rej) => {
    const pythonProcess = spawn(BinFuncs.getPyPath(), ['--version']);

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        res({ installed: true, error: '' });
      } else {
        res({ installed: false, error: 'python3 is not installed' });
      }
    });
  });
};

export const createVirtualEnv = (projKey: string) => {
  return new Promise((res, reject) => {
    const venvProcess = spawn(BinFuncs.getPyPath(), ['-m', 'venv', '.venv'], {
      cwd: `${PathFuncs.getProjectPath(projKey)}`,
    });

    venvProcess.on('exit', (code) => {
      if (code === 0) {
        res(true);
      } else {
        reject('Failed to create py venv');
      }
    });
  });
};

export const installPyRequirements = async (projKey: string) => {

  return new Promise((res, rej) => {
    const installProcess = spawn(
      BinFuncs.getEnvPyPath(projKey),
      ['-m', 'pip', 'install', '-r', 'requirements.txt'],
      {
        cwd: PathFuncs.getProjectPath(projKey),
      }
    );

    installProcess.on('exit', (code: number) => {
      if (code == 0) {
        res(true);
      } else {
        rej('Failed to install python requirements');
      }
    });
  });
};

export const installPyPackages = async (
  packages: Array<string>,
  projKey: string
) => {
  return new Promise((res, rej) => {
    const installProcess = spawn(
      BinFuncs.getEnvPyPath(projKey),
      ['-m', 'pip', 'install', ...packages],
      {
        cwd: PathFuncs.getProjectPath(projKey),
      }
    );

    installProcess.on('exit', (code: number) => {
      if (code == 0) {
        console.log('Successfully installed python packages');
        res(true);
      } else {
        rej('Failed to install python packages');
      }
    });
  });
};

export const uninstallPyPackages = async (
  packages: Array<string>,
  projKey: string
) => {
  return new Promise((res, rej) => {
    const installProcess = spawn(
      BinFuncs.getEnvPyPath(projKey),
      ['-m', 'pip', 'uninstall', '-y', ...packages],
      {
        cwd: PathFuncs.getProjectPath(projKey),
      }
    );

    installProcess.on('exit', (code: number) => {
      if (code == 0) {
        console.log('Successfully uninstalled python packages');
        res(true);
      } else {
        rej('Failed to uninstall python packages');
      }
    });
  });
};

export const freezePyPackages = async (projKey: string) => {
  return new Promise((res, rej) => {
    const installProcess = spawn(
      BinFuncs.getEnvPyPath(projKey),
      ['-m', 'pip', 'freeze'],
      {
        cwd: PathFuncs.getProjectPath(projKey),
      }
    );

    let frozenReqs = '';
    installProcess.stdout.on('data', (data) => {
      const decoder = new TextDecoder('utf-8');
      const text = decoder.decode(data);
      frozenReqs += text;
    });

    installProcess.on('exit', async (code: number) => {
      if (code == 0) {
        await FileFuncs.writeFile(
          path.join(PathFuncs.getProjectPath(projKey), 'requirements.txt'),
          frozenReqs
        );
        res(true);
      } else {
        rej('Failed to freeze python packages');
      }
    });
  });
};
