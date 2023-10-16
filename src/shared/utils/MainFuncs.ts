import { spawn } from 'child_process';
import { app } from 'electron';
import { platform } from 'os';
import path from 'path';
import { modConfig } from '../models/BModule';

export class MainFuncs {
  static getDataPath = () => {
    if (process.env.NODE_ENV != 'production') {
      return path.join(app.getPath('userData'), '..', 'visual-backend');
    }
    return path.join(app.getPath('userData'));
  };

  static getProjectPath = (projKey: string) => {
    if (process.env.NODE_ENV != 'production') {
      return path.join(
        app.getPath('userData'),
        '..',
        'visual-backend',
        'projects',
        projKey
      );
    }
    return path.join(app.getPath('userData'), 'projects', projKey);
  };

  static getScriptsPath = () => {
    if (process.env.NODE_ENV === 'production') {
      // return `${app.getAppPath()}/../assets/scripts`;
      return path.join(process.resourcesPath, 'assets', 'scripts');
    } else {
      return `${app.getAppPath()}/assets/scripts`;
    }
  };

  static getAssetsPath = () => {
    if (process.env.NODE_ENV === 'production') {
      return path.join(process.resourcesPath, 'assets');
    } else {
      return path.join(app.getAppPath(), 'assets');
    }
  };

  static addQuotesToPathWithSpaces(inputPath: string) {
    const pathSegments = inputPath.split(path.sep);

    // Process each path segment
    const modifiedPathSegments = pathSegments.map((segment) => {
      // Replace spaces with backslashes in the segment
      return segment.replace(/ /g, '\\ ');
    });

    // Join the segments back together to form the modified path
    const modifiedPath = modifiedPathSegments.join(path.sep);

    return modifiedPath;
  }
}

export class PathFuncs {
  static getProjectPath = (projKey: string) => {
    if (process.env.NODE_ENV != 'production') {
      return path.join(
        app.getPath('userData'),
        '..',
        'visual-backend',
        'projects',
        projKey
      );
    }

    return path.join(app.getPath('userData'), 'projects', projKey);
  };

  static getAssetsPath = () => {
    if (process.env.NODE_ENV === 'production') {
      return path.join(process.resourcesPath, 'assets');
    } else {
      return path.join(app.getAppPath(), 'assets');
    }
  };

  static getCodeTemplatesPath = () => {
    return path.join(this.getAssetsPath(), 'code-templates');
  };

  static getModulesPath = (projKey: string) => {
    return path.join(this.getProjectPath(projKey), 'src', 'modules');
  };

  static getModulePath = (mPath: string) => {
    return path.join(...mPath.split('/'));
  };

  static getWebhookTemplatesPath = (modKey: string) => {
    let mConfig = modConfig[modKey];
    return path.join(
      PathFuncs.getCodeTemplatesPath(),
      mConfig.path,
      'webhook-templates'
    );
  };
}

export class BinFuncs {
  static getBinOutputFolder() {
    return path.join(MainFuncs.getDataPath(), 'bin');
  }

  static getNodeBinPath = () => {
    if (process.env.NODE_BINARY_PATH) {
      return process.env.NODE_BINARY_PATH;
    }

    let nodePath = path.join(this.getBinOutputFolder(), 'node-lts');

    if (process.platform == 'win32') {
      return nodePath;
    } else {
      return path.join(nodePath, 'bin');
    }
  };

  static appendNodePath = () => {
    let nodeBinPath = this.getNodeBinPath();
    if (process.env.PATH && !process.env.PATH.includes(nodeBinPath)) {
      process.env.PATH = `${this.getNodeBinPath()}:${process.env.PATH}`;
    }
  };

  static getNpmPath = () => {
    this.appendNodePath();
    console.log('Node Bin Path:', this.getNodeBinPath());
    if (process.platform == 'darwin') {
      return path.join(this.getNodeBinPath(), 'npm');
    } else {
      return path.join(this.getNodeBinPath(), 'npm.cmd');
    }
  };
}
