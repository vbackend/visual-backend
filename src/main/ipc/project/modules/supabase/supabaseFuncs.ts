import { writeEnvVars } from '@/main/generate/env';
import { installPackages } from '@/main/generate/install';
import { modConfig } from '@/shared/models/BModule';
import { writeModuleStarterFuncs, writeModuleTemplate } from '../helpers';

export const createSupabaseModuleFiles = async (payload: any) => {
  let { projId, projKey, key } = payload;
  let bConfig = modConfig[key];

  let envs: Array<{ key: string; val: string }> = [];
  for (let i = 0; i < bConfig.envVars.length; i++) {
    let key = bConfig.envVars[i];
    let val = payload[key];
    envs.push({ key, val });
  }

  let promises = [];
  promises.push(writeEnvVars(projId, projKey, envs));
  promises.push(installPackages(bConfig.dependencies, projKey));

  // 3. create init file
  if (bConfig.initFile) {
    promises.push(
      writeModuleTemplate(bConfig.path, bConfig.initFile, `init.ts`, projKey)
    );
  }

  // 4. handle starter funcs
  try {
    let newFuncs = await writeModuleStarterFuncs(projKey, key);
    await Promise.all(promises);
    return newFuncs;
  } catch (error) {
    console.log('Failed to create module files');
    return { error: 'Failed to create module files' };
  }
};
