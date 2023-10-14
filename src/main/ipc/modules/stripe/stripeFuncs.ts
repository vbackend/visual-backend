import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { envConsts } from '@/renderer/misc/constants';
import { BModuleType, modConfig } from '@/shared/models/BModule';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { BFuncHelpers } from '@/shared/models/BFunc';

export const addWebhookTemplate = async (payload: any, index: number) => {
  let { projKey, module, templatesChecked } = payload;
  let mConfig = modConfig[module.key];
  let templates = mConfig.webhookTemplates;
  let template = templates[index];

  let newFuncs = [];

  for (let i = 0; i < template.functions.length; i++) {
    let func = template.functions[i];
    let newFunc = await insertFuncQuery(
      func.key,
      module.key,
      func.funcGroup,
      func.extension
    );
    newFuncs.push(newFunc);

    let fromPath = path.join(
      PathFuncs.getWebhookTemplatesPath(module.key),
      `${newFunc?.key}.txt`
    );
    let toPath = path.join(
      PathFuncs.getModulesPath(projKey),
      PathFuncs.getModulePath(mConfig.path),
      BFuncHelpers.getFuncPath(newFunc!)
    );
    await FileFuncs.copyFileContent(fromPath, toPath);
  }
  return newFuncs;
};

export const addWebhookTemplates = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { projKey, module, templatesChecked } = payload;

  let templates = modConfig[module.key].webhookTemplates;
  let returnFuncs: any = [];
  for (let i = 0; i < templates.length; i++) {
    if (templatesChecked[i]) {
      returnFuncs = returnFuncs.concat(await addWebhookTemplate(payload, i));
    }
  }
  return returnFuncs;
};
