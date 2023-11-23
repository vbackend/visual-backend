import {
  removeEnvVars,
  updateEnvVars,
  writeEnvVars,
} from '@/main/generate/env';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import fs from 'fs';
import path from 'path';

function parseEnvFile(filePath: string) {
  try {
    // Read the content of the environment file
    const data = fs.readFileSync(filePath, 'utf8');

    // Split the file content into lines
    const lines = data.split('\n');

    // Initialize an empty array to store key-value pairs
    const envVariables = [];

    // Iterate through each line and parse key-value pairs
    for (const line of lines) {
      // Remove leading and trailing whitespace
      const trimmedLine = line.trim();

      // Ignore lines starting with "#" (comments) or empty lines
      if (!trimmedLine || trimmedLine.startsWith('#')) {
        continue;
      }

      // Split the line into key and value at the first "=" character
      const [key, value] = trimmedLine.split('=');

      // Store the key-value pair in the array
      envVariables.push({ key, value });
    }

    return envVariables;
  } catch (err: any) {
    console.error(`Error parsing env file: ${err.message}`);
    return [];
  }
}

export const getEnvVars = (e: Electron.IpcMainInvokeEvent, p: any) => {
  let { projKey } = p;
  let envPath = path.join(PathFuncs.getProjectPath(projKey), '.env');

  let envVars = parseEnvFile(envPath);

  return envVars;
};

export const createEnvVar = async (e: Electron.IpcMainInvokeEvent, p: any) => {
  let { projId, projKey, key, val } = p;
  await writeEnvVars(projId, projKey, [{ key, val }]);
  return;
};

export const editEnvVars = async (e: Electron.IpcMainInvokeEvent, p: any) => {
  let { projId, projKey, key, val } = p;
  await updateEnvVars(projId, projKey, [{ key, val }]);
  return;
};

export const deleteEnvVar = async (e: Electron.IpcMainInvokeEvent, p: any) => {
  let { projdId, projKey, key } = p;
  await removeEnvVars(projdId, projKey, [{ key, val: '' }]);
  return;
};
