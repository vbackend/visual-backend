import { insertFuncQuery } from '@/main/db/funcs/funcQueries';
import { FileFuncs } from '@/main/helpers/fileFuncs';
import { BFuncHelpers } from '@/shared/models/BFunc';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import path from 'path';

export enum TemplateType {
  ReactEmail = 'react-email',
  Html = 'html',
}

export const createEmailTemplate = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  const { projKey, name, type } = payload;

  // copy paste from template
  let resendTemplatePath = path.join(
    PathFuncs.getCodeTemplatesPath(),
    'resend'
  );
  let templatesFolder = path.join(
    PathFuncs.getModulesPath(projKey),
    'resend',
    'templates'
  );

  let templatePath, targetPath, extension;
  let funcName = BFuncHelpers.nameToFuncName(name);

  if (type == TemplateType.Html) {
    templatePath = path.join(resendTemplatePath, 'htmlTemplate.txt');
    targetPath = path.join(templatesFolder, `${funcName}.html`);
    extension = 'html';
  } else {
    templatePath = path.join(resendTemplatePath, 'reactEmailTemplate.txt');
    targetPath = path.join(templatesFolder, `${funcName}.tsx`);
    extension = 'tsx';
  }

  await FileFuncs.createDirIfNotExists(templatesFolder);
  await FileFuncs.copyFileContent(templatePath, targetPath);

  // insert func
  let newFunc = await insertFuncQuery(name, 'resend', 'templates', extension);
  return { newFunc, error: null };
};
