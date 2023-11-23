import { MongoClient } from 'mongodb';
import { GenFuncs } from '@/shared/utils/GenFuncs';

export const getMongoDbs = async (
  event: Electron.IpcMainInvokeEvent,
  payload: string
) => {
  // await GenFuncs.timeout(500);
  console.log('Getting mongodbs');
  try {
    let client = new MongoClient(payload, {
      tlsAllowInvalidCertificates: true,
    });
    await client.connect();
    const admin = client.db('admin');

    const result = await admin.command({ listDatabases: 1, nameOnly: true });
    return result.databases;
  } catch {
    console.log('Failed to get mongo client');
    return undefined;
  }
};

export const getDbCols = async (connString: string, dbName: string) => {
  const client = new MongoClient(connString);
  try {
    await client.connect();
    const database = client.db(dbName);
    const collectionNames = await database.listCollections().toArray();
    const collectionNamesArray = collectionNames.map(
      (collection) => collection.name
    );
    return collectionNamesArray;
  } catch (err) {
    console.error('Error getting collections:', err);
    throw err;
  } finally {
    client.close();
  }
};

export const getMongoCols = async (
  event: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  // 1. get cols
  const { connString, dbName } = payload;

  try {
    let cols = await getDbCols(connString, dbName);
    return { cols };
  } catch (error) {
    return { error: 'Failed to connect to mongodb' };
  }
};
