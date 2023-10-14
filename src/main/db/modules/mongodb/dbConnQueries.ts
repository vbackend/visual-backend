import { MongoClient } from 'mongodb';
import { DbConn } from '../../../../models/dbConn';
import { db } from '../../connect';

export const getProjectDbConns = async (
  projectId: string
): Promise<DbConn | null> => {
  return new Promise((res, rej) => {
    let query = `SELECT conn_id, db_type, conn_string, db_name FROM db_conn 
        WHERE project_id=? ORDER BY conn_id ASC`;

    db.get(query, [projectId], (err, row: any) => {
      if (err) {
        console.error('Error retrieving db connections:', err);
        rej(err);
      } else {
        if (!row) {
          res(null);
          return;
        }

        let dbConn: DbConn = {
          id: row.conn_id,
          type: row.db_type,
          dbName: row.db_name,
          connString: row.conn_string,
        };
        res(dbConn);
      }
    });
  });
};

export const createDbConnQuery = async (
  projectId: string,
  dbConn: any
): Promise<boolean> => {
  return new Promise((res, rej) => {
    let query = `
    INSERT INTO db_conn (project_id, db_name, db_type, conn_string) 
    VALUES (?, ?, ?, ?)
    `;

    db.get(
      query,
      [projectId, dbConn.dbName, dbConn.dbType, dbConn.connString],
      (err, row: any) => {
        if (err) {
          console.error('Failed to create db conn', err);
          rej(err);
        } else {
          res(true);
        }
      }
    );
  });
};
