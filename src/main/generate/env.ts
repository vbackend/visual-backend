import { PathFuncs } from '@/shared/utils/MainFuncs';
import { ProjectService } from '../services/ProjectService';
import path from 'path';
import fs from 'fs-extra';

export const writeEnvVars = async (
  projId: string,
  projKey: string,
  envs: Array<{ key: string; val: string }>
) => {
  for (let i = 0; i < envs.length; i++) {
    let env = envs[i];
    const envPath = path.join(PathFuncs.getProjectPath(projKey), '.env');
    let newLine1 = `${env.key}=${env.val}`;
    await replaceEnvVarInFile(envPath, env.key, newLine1);
  }
  // promises.push(
  await ProjectService.addEnvVars({ projectId: projId, envVars: envs });
  // );

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

// Remove env vars
export const removeEnvVars = async (
  projId: string,
  projKey: string,
  envs: Array<{ key: string; val: string }>
) => {
  let rootDir = PathFuncs.getProjectPath(projKey);
  const envPath = path.join(rootDir, '.env');
  for (let i = 0; i < envs.length; i++) {
    await removeEnvVarInFile(envPath, envs[i].key);
  }
  await ProjectService.deleteEnvVars({ projectId: projId, envVars: envs });
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
            } else {
              console.log('Successfully deleted env var:', key);
              res(true);
            }
          });
        });
      }
    });
  });
};
