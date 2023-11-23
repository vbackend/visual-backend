import { BModule, BModuleFuncs } from '@/shared/models/BModule';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import { getModules } from '../db/modules/moduleQueries';
import { FileFuncs } from '../helpers/fileFuncs';
import { ProjectType } from '@/shared/models/project';
import path from 'path';

export const writeIndexFile = async (
  projKey: string,
  projType: ProjectType = ProjectType.Express
) => {
  let filePath = `${PathFuncs.getProjectPath(projKey)}/src/${
    projType == ProjectType.FastAPI ? 'main.py' : 'index.ts'
  }`;

  let modules: Array<BModule> = await getModules();

  let initServices: any = {};
  let initServicesList: Array<string> = [];
  modules.map((bModule: BModule) => {
    if (bModule.init && !initServices[bModule.init]) {
      initServices[bModule.init] = true;
      initServicesList.push(bModule.init);
    }
  });

  let importStatements = ``;
  let funcStatements = ``;
  let endStatements = ``;
  initServicesList.map((key: string) => {
    importStatements += BModuleFuncs.getImportStatement(key, projType);
    funcStatements += BModuleFuncs.getFuncStatement(key, projType);
    endStatements += BModuleFuncs.getPyEndStatement(key, projType);
  });

  let indexPath = path.join(
    PathFuncs.getCodeTemplatesPath(),
    projType,
    'general',
    'index.txt'
  );

  let scaffold: any = await FileFuncs.readFile(indexPath);

  // 1. Add import statements
  scaffold = scaffold.replace('{{import_statements}}', importStatements);
  scaffold = scaffold.replace('{{func_statements}}', funcStatements);

  if (projType == ProjectType.FastAPI) {
    scaffold = scaffold.replace('{{end_statements}}', endStatements);
  }

  await FileFuncs.writeFile(filePath, scaffold);
};
