import sqlite3, { Database } from 'sqlite3';
import { app } from 'electron';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import path from 'path';
import { MainFuncs } from '@/shared/utils/MainFuncs';

let sqlite = sqlite3.verbose();
export let db: sqlite3.Database;

export const createTables = async () => {
  // 1. Create route table
  const createRouteTableQuery = `
      CREATE TABLE IF NOT EXISTS route (
        route_id INTEGER PRIMARY KEY AUTOINCREMENT,
        parent_id INTEGER NULL,
        route_key STRING,
        parent_path STRING,
        parent_file_path STRING,
        type STRING
      );
  `;

  // 2. db_conn
  const createDbConnTable = `
      CREATE TABLE IF NOT EXISTS db_conn (
				conn_id INTEGER PRIMARY KEY AUTOINCREMENT,
				project_id STRING,
				db_type STRING,
				conn_string STRING,				
				db_name STRING				
      );
  `;

  // 3. table params
  const createFuncTable = `
			CREATE TABLE IF NOT EXISTS func (
        func_id INTEGER PRIMARY KEY AUTOINCREMENT,
        key TEXT,
        module_key TEXT,
				func_group TEXT, 
        extension TEXT
			);
	`;

  // 4. create modules table
  const createModulesTable = `
			CREATE TABLE IF NOT EXISTS module (
				module_id INTEGER PRIMARY KEY AUTOINCREMENT,
				key STRING,
        path STRING,
				init STRING,
        metadata STRING
			);
	`;

  let queries = [createRouteTableQuery, createFuncTable, createModulesTable];

  const promises = [];

  for (let i = 0; i < queries.length; i++) {
    promises.push(
      new Promise((res, rej) => {
        db.run(queries[i], (createErr: any) => {
          if (createErr) {
            console.error('Error creating table:', createErr);
            rej(createErr);
          } else {
            res(true);
          }
        });
      })
    );
  }

  let res = await Promise.all(promises);
  return;
};

export const connectDb = async (projKey: string) => {
  let pathToDb = path.join(MainFuncs.getProjectPath(projKey), `${projKey}.db`);

  return new Promise((res, rej) => {
    db = new sqlite.Database(pathToDb, async (err: any) => {
      if (err) {
        rej(err);
      } else {
        await createTables();
        res(true);
      }
    });
  });
};

export const disconnectDb = async () => {
  return new Promise((res, rej) => {
    db.close((err) => {
      if (err) {
        console.log('Failed to close db:', err);
        rej(err);
      } else {
        console.log('Closed db');
        res(true);
      }
    });
  });
};
