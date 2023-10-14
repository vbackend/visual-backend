import { db } from '../connect';
import { BFunc } from '@/shared/models/BFunc';

export const getFuncByKey = (key: string) => {
  let query = `
      SELECT func_id, key, module_key, func_group, extension FROM func WHERE key=?
    `;
  return new Promise((res, rej) => {
    db.get(query, [key], (err, row: any) => {
      if (err) {
        rej(err);
      } else {
        if (!row) {
          res(null);
          return;
        }
        res({
          id: row.func_id,
          key: row.key,
          moduleKey: row.module_key,
          funcGroup: row.func_group,
          extension: row.extension,
        });
      }
    });
  });
};

export const getFuncsByModule = (key: string): Promise<Array<BFunc>> => {
  let query = `
      SELECT func_id, key, module_key, func_group, extension FROM func WHERE module_key=?
    `;
  return new Promise((res, rej) => {
    db.all(query, [key], (err, rows: any) => {
      if (err) {
        console.log('Failed to get module funcs:', err);
        rej(err);
      } else {
        let funcs: Array<BFunc> = [];
        for (const row of rows) {
          funcs.push({
            id: row.func_id,
            key: row.key,
            moduleKey: row.module_key,
            funcGroup: row.func_group,
            extension: row.extension,
          });
        }
        res(funcs);
      }
    });
  });
};

export const insertFuncQuery = async (
  key: string,
  moduleKey: string,
  funcGroup: string,
  extension: string
): Promise<null | BFunc> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO func (key, module_key, func_group, extension) 
      VALUES (?, ?, ?, ?)
      `,
      [key, moduleKey, funcGroup, extension],
      function (err) {
        if (err) {
          console.error('Error inserting func:', err);
          reject(null);
        } else {
          const result = this;
          resolve({
            id: this.lastID,
            key,
            moduleKey,
            funcGroup,
            extension,
          });
        }
      }
    );
  });
};

export const deleteFuncQuery = async (id: number): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      DELETE from func WHERE func_id=?
      `,
      [id],
      function (err) {
        if (err) {
          console.error('Error deleting func:', err);
          reject(null);
        } else {
          resolve(true);
        }
      }
    );
  });
};

export const deleteFuncByModule = async (key: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      DELETE from func WHERE module_key=?
      `,
      [key],
      function (err) {
        if (err) {
          console.error('Error deleting module funcs:', err);
          reject(null);
        } else {
          resolve(true);
        }
      }
    );
  });
};
