import { BinFuncs, MainFuncs } from '@/shared/utils/MainFuncs';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs-extra';
import { FileFuncs } from './fileFuncs';
import AdmZip from 'adm-zip';
import zlib from 'zlib';
import tar from 'tar';
import os from 'os';
import Store from 'electron-store';

import { nodeTypeKey } from '@/renderer/misc/constants';
import { NodeType } from '@/shared/models/NodeType';

export function checkNodeVersion(nodePath: string = 'node') {
  return new Promise<any>((res, rej) => {
    const nodeProcess = spawn(nodePath, ['-v']);

    let versionString = '';

    nodeProcess.stdout.on('data', (data) => {
      versionString += data.toString();
    });

    nodeProcess.on('error', (err) => {
      res([false, NodeType.NotFound]);
    });

    nodeProcess.on('close', (code) => {
      if (code !== 0) {
        res([false, NodeType.NotFound]);
        return;
      }

      versionString = versionString.trim();
      // console.log('Node version:', versionString);
      const versionParts = versionString.substring(1).split('.');
      const majorVersion = parseInt(versionParts[0], 10);

      if (majorVersion <= 18) {
        res([true, 'Node is installed']);
      } else {
        res([false, NodeType.InvalidVersion]);
      }
    });
  });
}

function is64Bit() {
  return ['arm64', 'ppc64', 'x64', 's390x'].includes(os.arch());
}

const unzipNodeMac = async () => {
  let nodeV = 'v18.18.2';

  let tarFileName =
    process.arch == 'arm64'
      ? `node-${nodeV}-darwin-arm64.tar.gz`
      : `node-${nodeV}-darwin-x64.tar.gz`;

  let inputPath = path.join(MainFuncs.getAssetsPath(), tarFileName);

  if (!fs.existsSync(inputPath)) {
    return;
  }

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
            ? `node-${nodeV}-darwin-arm64`
            : `node-${nodeV}-darwin-x64`;
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
  let zipFileName = is64Bit() ? 'node-lts-win-x64.zip' : 'node-lts-win-x86.zip';
  const zipFilePath = path.join(MainFuncs.getAssetsPath(), zipFileName);

  if (!fs.existsSync(zipFilePath)) {
    return;
  }

  let outputFolder = BinFuncs.getBinOutputFolder();
  const outputPath = path.join(outputFolder, 'node-lts');

  let nodeExists = await FileFuncs.folderExists(outputPath);
  if (nodeExists) return;

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

export const initNodeBinaries = async () => {
  let [nodeExists, _] = await checkNodeVersion();
  if (nodeExists) return;

  console.log('Unzipping node binaries...');
  if (process.platform == 'darwin') {
    await unzipNodeMac();
  } else if (process.platform == 'win32') {
    await unzipNodeWindows();
  }
};

export const setNodeType = async () => {
  let s = new Store();
  let [valid, _] = await checkNodeVersion(
    path.join(BinFuncs.getNodeBinPath(), 'node')
  );

  if (valid) {
    s.set(nodeTypeKey, NodeType.Downloaded);
    return;
  }

  let [valid2, msg2] = await checkNodeVersion();
  if (valid2) {
    s.set(nodeTypeKey, NodeType.Default);
    return;
  } else {
    s.set(nodeTypeKey, msg2);
  }
};
