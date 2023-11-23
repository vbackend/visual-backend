import { GenFuncs } from '../utils/GenFuncs';
import { BModule, BModuleFuncs } from './BModule';

export enum ExtensionType {
  ts = 'ts',
  html = 'html',
  tsx = 'tsx',
}

export type BFunc = {
  id?: number;
  key: string;
  moduleKey: string;
  funcGroup: string;
  extension: string;
};

export class BFuncHelpers {
  static camelise = (str: string) => {
    return str.replace(/(?:^\w|[A-Z]|\b\w|\s+)/g, function (match, index) {
      if (+match === 0) return ''; // or if (/\s+/.test(match)) for white spaces
      return index === 0 ? match.toLowerCase() : match.toUpperCase();
    });
  };

  static getImportStatement = (func: BFunc, m: BModule) => {
    let funcName = BFuncHelpers.getFuncName(func);
    let path =
      func.funcGroup == '*' ? `${funcName}` : `${func.funcGroup}/${funcName}`;

    if (func.extension == 'html')
      return `import fs from 'fs';
import ejs from 'ejs';
import path from 'path'`;

    return `import { ${funcName} } from '@/modules/${m.path}/${path}.js'`;
  };

  static nameToFuncName = (name: string) => {
    return this.camelise(name);
  };

  static getFuncName = (func: BFunc) => {
    // return this.camelise(`${func.key}`);
    return func.key;
  };

  static getFuncCallTemplate = (f: BFunc) => {
    if (f.extension == 'html') {
      return `
let htmlFilePath = path.join(process.cwd(), 'src/modules/resend/templates', '${this.getFuncName(
        f
      )}.html')
const template = fs.readFileSync(htmlFilePath, 'utf8');
const data = { varKey: 'value' };
const htmlString = ejs.render(template, data);`;
    } else return `${this.getFuncName(f)}();`;
  };

  static getFuncPath = (f: BFunc) => {
    if (f.funcGroup == '*') {
      return `${f.key}.${f.extension}`;
    } else return `${f.funcGroup}/${f.key}.${f.extension}`;
  };
}
