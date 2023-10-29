import { BModule, BModuleFuncs } from '@/shared/models/BModule';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import { getModules } from '../db/modules/moduleQueries';
import { FileFuncs } from '../helpers/fileFuncs';

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
