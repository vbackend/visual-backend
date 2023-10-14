import { FileFuncs } from '@/main/helpers/fileFuncs';
import { GenFuncs } from '@/shared/utils/GenFuncs';
import { PathFuncs } from '@/shared/utils/MainFuncs';
import fs from 'fs';

export const writeMongoDbInit = async (projKey: string, dbName: string) => {
  let dbModulePath = `${PathFuncs.getModulesPath(projKey)}/mongo`;

  await FileFuncs.createDirIfNotExists(dbModulePath);

  let dbInitPath = `${dbModulePath}/init.ts`;
  let contents = `import { Db, MongoClient } from "mongodb";
export let mongoCli: MongoClient;
export let defaultDb: Db;

export const initMongo = async () => {
try {
    let connString = process.env.mongoConnString
    mongoCli = new MongoClient(connString!);
    await mongoCli.connect();
    defaultDb = mongoCli.db('${dbName}')
    console.log("DB module initialised");
} catch (err) {
    console.error("Error connecting to MongoDB:", err);
}
}
    `;

  await FileFuncs.writeFile(dbInitPath, contents);
};
