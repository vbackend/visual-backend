import fs from 'fs';

import { getProjectRoutes } from '../../db/projects/projectQueries';
import { getModules } from '../../db/modules/moduleQueries';
import { Route, RouteFuncs, RouteType } from '@/shared/models/route';
import { BModule, BModuleFuncs } from '@/shared/models/BModule';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { ProjectService } from '@/main/services/ProjectService';

export const writeRouterFile = async (
  parentId: number,
  parentKey: string,
  parentDir: string
) => {
  let projRoutes = await getProjectRoutes();
  let routeChildren: Array<Route> = [];

  // 1. Get all child routes of current group
  for (let i = 0; i < projRoutes.length; i++) {
    if (projRoutes[i].parentId == parentId) {
      routeChildren.push(projRoutes[i]);
    }
  }

  let file = ``;

  // 2. Write import statements
  file += `import express from 'express'\n`;

  for (let childRoute of routeChildren) {
    file += RouteFuncs.getImportStatement(childRoute);
  }

  // 3. Initialise router for parent
  let parentFuncName = RouteFuncs.getFuncNameFromStr(
    parentKey,
    RouteType.group,
    parentId
  );

  file += `export const ${parentFuncName}Router = express.Router();\n`;
  for (let childRoute of routeChildren) {
    if (childRoute.type == RouteType.middleware)
      file += RouteFuncs.getUseStatement(childRoute, parentFuncName);
  }
  for (let childRoute of routeChildren) {
    if (childRoute.type != RouteType.middleware)
      file += RouteFuncs.getUseStatement(childRoute, parentFuncName);
  }

  let routerPath = `${parentDir}/${parentFuncName}Router.ts`;
  await FileFuncs.writeFile(routerPath, file);
};

export const createRouterGroupFolder = async (
  parentDir: string,
  newRoute: Route
) => {
  let funcName = RouteFuncs.getFuncName(newRoute);
  let newDirPath = `${parentDir}/${funcName}`;
  await FileFuncs.createDirIfNotExists(newDirPath);

  let routerFilePath = `${newDirPath}/${funcName}Router.ts`;
  let contents = `import express from 'express'
export const ${funcName}Router = express.Router();
    `;

  await FileFuncs.writeFile(routerFilePath, contents);
};

export const createRouteFile = async (parentDir: string, newRoute: Route) => {
  let funcName = RouteFuncs.getFuncName(newRoute);
  let path = `${parentDir}/${funcName}.ts`;

  let contents = `export const ${funcName} = async (req, res${
    newRoute.type == RouteType.middleware ? ', next' : ''
  }) => {
    // Complete function
}
    `;
  await FileFuncs.writeFile(path, contents);
};

export const writeEnvVars = async (
  projId: string,
  projKey: string,
  envs: Array<{ key: string; val: string }>
) => {
  let promises = [];
  for (let i = 0; i < envs.length; i++) {
    let env = envs[i];
    const envPath = path.join(PathFuncs.getProjectPath(projKey), '.env');
    let newLine1 = `${env.key}=${env.val}`;
    await replaceEnvVarInFile(envPath, env.key, newLine1);
    promises.push(replaceEnvVarInFile(envPath, env.key, newLine1));
  }
  // promises.push(
  ProjectService.addEnvVars({ projectId: projId, envVars: envs });
  // );
  await Promise.all(promises);

  console.log('Successfully written env vars');
  return;
};

export const updateEnvVars = async (
  projId: string,
  projKey: string,
  envs: Array<{ key: string; val: string }>
) => {
  let promises = [];
  for (let i = 0; i < envs.length; i++) {
    let env = envs[i];
    const envPath = path.join(PathFuncs.getProjectPath(projKey), '.env');
    let newLine1 = `${env.key}=${env.val}`;
    await replaceEnvVarInFile(envPath, env.key, newLine1);
    promises.push(replaceEnvVarInFile(envPath, env.key, newLine1));
  }
  promises.push(
    ProjectService.updateEnvVars({ projectId: projId, envVars: envs })
  );
  await Promise.all(promises);

  console.log('Successfully written env vars');
  return;
};

export const replaceEnvVarInFile = async (
  filePath: string,
  key: string,
  newLine: string
) => {
  return new Promise((res, rej) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        fs.writeFile(filePath, newLine, (err) => {
          if (err) {
            console.error(
              'Error creating and writing to env file:',
              err.message
            );
            rej(false);
            return;
          } else {
            res(true);
          }
        });
      } else {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading .env file:', err.message);
            rej(false);
            return;
          }

          const lines = data.split('\n');
          const lineIndex = lines.findIndex((line) => line.includes(`${key}=`));

          if (lineIndex !== -1) {
            lines[lineIndex] = newLine;
          } else {
            lines.push(newLine);
          }

          const updatedContent = lines.join('\n');

          fs.writeFile(filePath, updatedContent, (err) => {
            if (err) {
              console.error('Error writing to .env file:', err.message);
              rej(err);
              return;
            } else res(true);
          });
        });
      }
    });
  });
};

export const removeEnvVar = async (
  projId: string,
  projKey: string,
  envs: Array<{ key: string; val: string }>
) => {
  let rootDir = PathFuncs.getProjectPath(projKey);
  const envPath = path.join(rootDir, '.env');
  let promises = [];
  for (let i = 0; i < envs.length; i++) {
    promises.push(removeEnvVarInFile(envPath, envs[i].key));
  }
  promises.push(
    ProjectService.deleteEnvVars({ projectId: projId, envVars: envs })
  );

  await Promise.all(promises);
  console.log('Successfully deleted env vars');
  return;
};

export const removeEnvVarInFile = async (filePath: string, key: string) => {
  return new Promise((res, rej) => {
    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Error creating and writing to env file:', err.message);
        rej(false);
      } else {
        fs.readFile(filePath, 'utf8', (err, data) => {
          if (err) {
            console.error('Error reading .env file:', err.message);
            rej(false);
            return;
          }

          const lines = data.split('\n');
          const lineIndex = lines.findIndex((line) => line.includes(`${key}=`));

          if (lineIndex !== -1) {
            lines.splice(lineIndex, 1);
          }

          const updatedContent = lines.join('\n');

          fs.writeFile(filePath, updatedContent, (err) => {
            if (err) {
              console.error('Error writing to .env file:', err.message);
              rej(err);
              return;
            } else res(true);
          });
        });
      }
    });
  });
};

export const writeIndexFile = async (projKey: string) => {
  let filePath = `${PathFuncs.getProjectPath(projKey)}/src/index.ts`;

  let modules: Array<BModule> = await getModules();

  let importStatements = ``;
  let funcStatements = ``;

  let initServices: any = {};
  let initServicesList: Array<string> = [];
  modules.map((bModule: BModule) => {
    if (bModule.init && !initServices[bModule.init]) {
      initServices[bModule.init] = true;
      initServicesList.push(bModule.init);
    }
  });

  initServicesList.map((key) => {
    importStatements += BModuleFuncs.getImportStatement(key);
    funcStatements += BModuleFuncs.getFuncStatement(key);
  });

  let fileContents = `
import { config } from 'dotenv';
import express from 'express';
import { Router } from './api/Router.js';
import bodyParser from 'body-parser';
import cors from 'cors';
import ngrok from "ngrok";

${importStatements}
const init = async () => {
  config();

${funcStatements}
  const app = express();
  app.use(cors());
  app.use(bodyParser.json());
  app.use('/', Router);
  app.get('/', (req: any, res: any) => {
    res.send('Hello from visual backend server!');
  });

  const args = process.argv.slice(2);
  let port = 8080;
  if (args.length > 0) {
    port = parseInt(args[0]);
  }

  const server = app.listen(port, () => {
    console.log(\`Server started at http://localhost:\${port}\`);
  });

  let url = await ngrok.connect(port);
	console.log("Public url:", url);

  // Handle server shutdown gracefully
  process.on('SIGTERM', () => {
    // console.log('Received SIGTERM. Shutting down gracefully...');
    server.close(() => {
      process.exit(0); // Terminate the process gracefully after the server is closed
    });
  });

  process.on('SIGINT', () => {
    // console.log('Received SIGINT. Shutting down gracefully...');
    server.close(() => {
      process.exit(0); // Terminate the process gracefully after the server is closed
    });
  });
};

init();  
  `;
  await FileFuncs.writeFile(filePath, fileContents);
};
