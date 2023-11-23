import { connectDb } from '@/main/db/connect';
import { insertRoute } from '@/main/db/route/routeQueries';
import {
  checkPython3Ver,
  createVirtualEnv,
  installPyRequirements,
} from '@/main/generate/fastapi/pythonInstall';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { RouteType } from '@/shared/models/route';
import { MainFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

// PYTHON FUNCTIONS
export const createFastAPIProject = async (payload: any) => {
  const { projKey } = payload;
  let projectDir = MainFuncs.getProjectPath(projKey);

  // 1. Check if python3 is installed
  console.log('1. Checking that python3 is installed');
  let { installed, error } = await checkPython3Ver();
  if (!installed) {
    return { error: 'python3 not found' };
  }

  // 3. Copy project over
  console.log('2. Creating project folder');
  let assetDir = path.join(MainFuncs.getAssetsPath(), 'fastapi-template');
  await FileFuncs.copyDir(assetDir, projectDir);

  // 3. Run pip install

  try {
    console.log('3. Creating python venv');
    await createVirtualEnv(projKey);

    console.log('4. Installing python requirements.txt');
    await installPyRequirements(projKey);
  } catch (error) {
    console.log('Failed to create python env and install reqs:', error);
    return { error: 'Failed to create python venv & install requirements' };
  }

  // 3. Create db
  console.log('5. Creating db file');
  let dbPath = path.join(projectDir, `${projKey}.db`);
  FileFuncs.createFileIfNotExists(dbPath);
  await connectDb(projKey);

  // 4. insert into db
  console.log('6. Inserting root route');
  let newRoute = await insertRoute({
    key: '',
    parentPath: '',
    parentFilePath: '',
    parentId: -1,
    type: RouteType.group,
  });
  console.log('Success');
  return { error: null };
};
