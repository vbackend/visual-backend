import { BModule } from '@/shared/models/BModule';
import { db } from '../connect';
import { BFunc } from '@/shared/models/BFunc';

export const createModuleQuery = async (module: BModule) => {
  let query = `
    INSERT INTO module (key, init, path, metadata) VALUES (?, ?, ?, ?)
  `;

  return new Promise((res, rej) => {
    db.run(
      query,
      [module.key, module.init, module.path, module.metadata],
      (err) => {
        if (err) {
          console.log('Failed to create module:', err);
          rej(true);
        } else {
          res(true);
        }
      }
    );
  });
};

export const deleteModuleQuery = async (moduleKey: string) => {
  let query = `
    DELETE FROM module WHERE key=?
  `;

  return new Promise((res, rej) => {
    db.run(query, [moduleKey], (err) => {
      if (err) {
        console.log('Failed to delete module:', err);
        rej(true);
      } else {
        res(true);
      }
    });
  });
};

export const getModules = async (): Promise<Array<BModule>> => {
  let query = `
    SELECT module_id, path, key, init, metadata FROM module
  `;

  return new Promise((res, rej) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.log('Failed to create module');
        rej(true);
      } else {
        let modules: Array<BModule> = [];
        rows.map((row: any) =>
          modules.push({
            id: row.module_id,
            path: row.path,
            key: row.key,
            init: row.init,
            metadata: JSON.parse(row.metadata),
          })
        );

        res(modules);
      }
    });
  });
};

export const getModuleFuncs = async (): Promise<Array<BFunc>> => {
  let query = `
  SELECT f.func_id, f.module_key, f."key", f.func_group, f.extension FROM 
  func as f;
  `;

  return new Promise((res, rej) => {
    db.all(query, (err, rows) => {
      if (err) {
        console.log('Failed to create module');
        rej(true);
      } else {
        let funcs: Array<BFunc> = [];
        rows.map((row: any) =>
          funcs.push({
            id: row.func_id,
            key: row.key,
            moduleKey: row.module_key,
            funcGroup: row.func_group,
            extension: row.extension,
          })
        );

        res(funcs);
      }
    });
  });
};

export const editModuleMetadata = async (
  newMetadata: string,
  moduleKey: string
) => {
  let query = `
    UPDATE module SET metadata=? WHERE key=?
  `;

  return new Promise((res, rej) => {
    db.run(query, [newMetadata, moduleKey], (err) => {
      if (err) {
        console.log(err);
        rej(false);
      } else {
        res(true);
      }
    });
  });
};
