import path from 'path';
import { app } from 'electron';
import {
  simpleGit,
  SimpleGit,
  CleanOptions,
  SimpleGitOptions,
} from 'simple-git';
import { connectDb, db, disconnectDb } from '../../db/connect';
import { getProjectRoutes } from '../../db/projects/projectQueries';
import { createRouterGroupFolder, writeRouterFile } from './templateGenerate';
import { insertRoute } from '../../db/route/routeQueries';
import { MongoClient } from 'mongodb';
import { getModuleFuncs, getModules } from '@/main/db/modules/moduleQueries';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { Route, RouteType } from '@/shared/models/route';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { installPackages } from '@/main/generate/install';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import axios from 'axios';

import {
  generateCloudBuildYaml,
  writeCloudBuildYaml,
} from '@/main/generate/cloudbuild';

export const createProject = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { projId, projAccessToken, projKey } = payload;

  let projectDir = MainFuncs.getProjectPath(projKey);

  // 1. Copy project over
  console.log('1. Creating project folder');
  let assetDir = path.join(MainFuncs.getAssetsPath(), 'express-template');
  await FileFuncs.copyDir(assetDir, projectDir);

  // 2. Run npm install
  console.log('2. Running npm install');

  try {
    let success = await installPackages([], projKey);
    if (!success) {
      return { error: 'Failed to install npm packages' };
    }
  } catch (error) {
    console.log('Failed to run npm install:', error);
    return { error: 'Failed to install npm packages' };
  }

  // 3. Create db
  console.log('3. Creating db file');
  let dbPath = path.join(projectDir, `${projKey}.db`);
  FileFuncs.createFileIfNotExists(dbPath);
  await connectDb(projKey);

  // 4. insert into db
  console.log('4. Inserting root route');
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

export const initProject = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { projectId, projKey } = payload;
  await connectDb(projKey);

  // make db
  let routes = await getProjectRoutes();

  // Get project modules & funcs
  let modules = await getModules();
  let funcs = await getModuleFuncs();

  return {
    routes,
    modules,
    funcs,
  };
};

export const updateYamlAndGitPush = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { project } = payload;
  try {
    let { data } = await ProjectService.getProjectSecretStatements(project._id);
    let setSecretsString = '';

    for (const env in data) {
      setSecretsString += `      --set-secrets=${env}=${data[env]}:latest\n`;
    }

    await writeCloudBuildYaml(project.key, project._id, setSecretsString);
  } catch (error) {
    console.log('Failed to set secrets string:', error);
    return false;
  }

  let baseDir = PathFuncs.getProjectPath(project.key);

  const options: Partial<SimpleGitOptions> = {
    baseDir: baseDir,
    binary: 'git',
    maxConcurrentProcesses: 6,
    trimmed: false,
  };

  let git: SimpleGit = simpleGit(options);

  try {
    let isRepo = await git.checkIsRepo();
    if (!isRepo) {
      console.log('Initialising new repo');
      await git.init({ '--initial-branch': 'main' });
    }
  } catch (error) {
    console.log('Git init error:', error);
    return false;
  }

  try {
    await git.add('.');
    await git.commit('Saving changes');
    let uri = `https://vb_proj_access_token:${project.projectAccessToken}@gitlab.com/johnyeocx/${project._id}.git`;
    await git.push(uri, 'main');
    console.log('Successfully pushed project to gitlab');
  } catch (error) {
    console.log('Failed to push project to gitlab:', error);
    return false;
  }

  return true;
};

import fs from 'fs-extra';
import { ProjectService } from '@/main/services/ProjectService';
export const deleteProject = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { project } = payload;
  let dbPath = path.join(
    MainFuncs.getProjectPath(project.key),
    `${project.key}.db`
  );
  await disconnectDb();
  // fs.closeSync(dbPath)
  console.log('Deleting project folder');
  fs.removeSync(MainFuncs.getProjectPath(project.key));
  return true;
};
