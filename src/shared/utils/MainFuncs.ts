import { app } from 'electron';
import path from 'path';
import { modConfig, pyModConfig } from '../models/BModule';
import Store from 'electron-store';
import { curProjectKey, nodeTypeKey } from '@/renderer/misc/constants';
import { NodeType } from '../models/NodeType';
import { ProjectType } from '../models/project';

export class MainFuncs {
  static getCurProject = () => {
    let s = new Store();
    let curProjString: any = s.get(curProjectKey);

    let curProj = JSON.parse(curProjString);
    if (!curProj.projType) curProj.projType = ProjectType.Express;

    return curProj;
  };

  static getExtension = (projType: ProjectType) => {
    return projType == ProjectType.FastAPI ? 'py' : 'ts';
  };

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

  static getModConfig = (modKey: string, projType: string) => {
    if (projType == ProjectType.FastAPI) {
      return pyModConfig[modKey];
    } else {
      return modConfig[modKey];
    }
  };
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

  static getModTemplatesPath = (projType: string) => {
    return path.join(this.getCodeTemplatesPath(), projType, 'modules');
  };

  static getModulesPath = (projKey: string) => {
    return path.join(this.getProjectPath(projKey), 'src', 'modules');
  };

  static getModulePath = (mPath: string) => {
    return path.join(...mPath.split('/'));
  };

  static getWebhookTemplatesPath = (
    modKey: string,
    projType: ProjectType = ProjectType.Express
  ) => {
    let mConfig = modConfig[modKey];
    return path.join(
      PathFuncs.getModTemplatesPath(projType),
      mConfig.path,
      'webhook-templates'
    );
  };

  static getApiDir = (projKey: string) => {
    // let { projKey, projType } = MainFuncs.getCurProject();

    return path.join(this.getProjectPath(projKey), 'src', 'api');
    // if (projType == ProjectType.FastAPI) {
    //   return path.join(this.getProjectPath(projKey), 'api');
    // } else {
    // }
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
      process.env.PATH = `${this.getNodeBinPath()}${
        process.platform == 'win32' ? ';' : ':'
      }${process.env.PATH}`;
    }
  };

  static getNpmPath = () => {
    return process.platform == 'win32' ? 'npm.cmd' : 'npm';
    // let s = new Store();
    // let nodeType = s.get(nodeTypeKey);
    // if (nodeType == NodeType.Default) {
    //   console.log('Using default npm');
    // }

    // this.appendNodePath();
    // console.log('Using downloaded npm');
    // if (process.platform == 'darwin') {
    //   return path.join(this.getNodeBinPath(), 'npm');
    // } else {
    //   return path.join(this.getNodeBinPath(), 'npm.cmd');
    // }
  };

  static getPyPath = () => {
    if (process.platform == 'win32') {
      return 'py';
    } else {
      return 'python3';
    }
  };

  static getEnvPyPath = (projKey: string) => {
    if (process.platform == 'win32') {
      return path.join(
        PathFuncs.getProjectPath(projKey),
        '.venv',
        'scripts',
        'python'
      );
    } else {
      return path.join(
        PathFuncs.getProjectPath(projKey),
        '.venv',
        'bin',
        this.getPyPath()
      );
    }
  };
}
