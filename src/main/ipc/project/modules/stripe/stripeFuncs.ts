import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { modConfig } from '@/shared/models/BModule';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { MainFuncs, PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';
import { BFuncHelpers } from '@/shared/models/BFunc';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { ProjectType } from '@/shared/models/project';

export const addWebhookTemplate = async (
  payload: any,
  index: number,
  projType: ProjectType = ProjectType.Express
) => {
  let { projKey, module } = payload;

  let mConfig = GenFuncs.getModConfig(module.key, projType);
  let templates = mConfig.webhookTemplates;
  let template = templates[index];

  let newFuncs = [];

  for (let i = 0; i < template.functions.length; i++) {
    let func = template.functions[i];
    let newFunc = await insertFuncQuery(
      func.key,
      module.key,
      func.funcGroup,
      MainFuncs.getExtension(projType)
    );
    newFuncs.push(newFunc);

    let fromPath = path.join(
      PathFuncs.getWebhookTemplatesPath(module.key, projType),
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
  let { projType } = MainFuncs.getCurProject();

  let mConfig = MainFuncs.getModConfig(module.key, projType);

  let templates = mConfig.webhookTemplates;
  let returnFuncs: any = [];
  for (let i = 0; i < templates.length; i++) {
    if (templatesChecked[i]) {
      returnFuncs = returnFuncs.concat(
        await addWebhookTemplate(payload, i, projType)
      );
    }
  }
  return returnFuncs;
};
