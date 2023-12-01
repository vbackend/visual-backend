import { GenFuncs } from '@/shared/utils/GenFuncs';
import { BinFuncs, MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import { exec, fork, spawn } from 'child_process';

export function checkNodeVer() {
  return new Promise<any>((res, rej) => {
    const nodeProcess = spawn('node', ['-v']);

    let versionString = '';

    nodeProcess.on('close', (code) => {
      if (code === 0) {
        res({ installed: true, error: '' });
      } else {
        res({ installed: false, error: 'node is not installed' });
      }
      return;
      versionString = versionString.trim();
      // console.log('Node version:', versionString);
      const versionParts = versionString.substring(1).split('.');
      const majorVersion = parseInt(versionParts[0], 10);

      res(true);
      // if (majorVersion <= 18) {
      //   res([true, 'Node is installed']);
      // } else {
      //   res([false, NodeType.InvalidVersion]);
      // }
    });
  });
}

export const installPackages = async (
  packages: Array<string>,
  projKey: string
) => {
  let npmPath = BinFuncs.getNpmPath();

  const installProcess = spawn(npmPath, ['install', ...packages], {
    cwd: `${PathFuncs.getProjectPath(projKey)}`,
  });

  installProcess.stdout.on('data', (data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
  });

  installProcess.stderr.on('data', (data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
  });

  return new Promise((res, rej) => {
    installProcess.on('exit', (code: number) => {
      if (code == 0) {
        console.log('Successfuly ran npm install');
        res(true);
      } else {
        console.log('Failed to install packages: ', packages);
        rej(false);
      }
    });
  });
};

export const deletePackages = async (
  packages: Array<string>,
  projKey: string
) => {
  let npmPath = BinFuncs.getNpmPath();

  const deleteProcess = spawn(npmPath, ['remove', ...packages], {
    cwd: `${PathFuncs.getProjectPath(projKey)}`,
  });

  deleteProcess.stdout.on('data', (data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
  });

  deleteProcess.stderr.on('data', (data) => {
    const decoder = new TextDecoder('utf-8');
    const text = decoder.decode(data);
  });

  return new Promise((res, rej) => {
    deleteProcess.on('exit', (code: number) => {
      if (code == 0) {
        console.log('Successfully ran npm remove');
        res(true);
      } else {
        console.log('Failed to delete package: ', packages);
        rej(false);
      }
    });
  });
};
