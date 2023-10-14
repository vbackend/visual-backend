import { Database, sqlite3 } from 'sqlite3';
import { db } from '../connect';
import { Route } from '@/shared/models/route';

export const getProjectRoutes = async (): Promise<Array<Route>> => {
  let query = `SELECT route_id, parent_id, route_key, parent_path, parent_file_path, type FROM route 
  ORDER BY route_id ASC`;

  return new Promise((resolve, reject) => {
    db.all(query, [], (err, rows) => {
      if (err) {
        console.error('Error retrieving pojectRows:', err);
        reject(err);
      } else {
        let routes: Array<Route> = [];
        rows.map((row: any) => {
          routes.push({
            id: row.route_id,
            parentId: row.parent_id,
            key: row.route_key,
            parentPath: row.parent_path,
            parentFilePath: row.parent_file_path,
            type: row.type,
          });
        });

        resolve(routes);
      }
    });
  });
};
