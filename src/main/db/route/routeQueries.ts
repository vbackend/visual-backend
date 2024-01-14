import { Route } from '@/shared/models/route';
import { db } from '../connect';
import { error } from 'console';

export const getRoutes = async (): Promise<Array<Route>> => {
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

export const insertRoute = async (route: Route): Promise<null | number> => {
  return new Promise((resolve, reject) => {
    db.run(
      `
      INSERT INTO route (parent_id, route_key, parent_path, parent_file_path, type)
      VALUES (?, ?, ?, ?, ?)
            `,
      [
        route.parentId,
        route.key,
        route.parentPath,
        route.parentFilePath,
        route.type,
      ],
      function (err) {
        if (err) {
          console.error('Error inserting route:', err);
          reject(null);
        } else {
          const result = this;
          resolve(result.lastID);
        }
      }
    );
  });
};

export const getRouteByKeyAndParentId = async (
  parentId: number,
  routeKey: string
): Promise<Route> => {
  let query = `SELECT route_id, parent_id, route_key, parent_path, parent_file_path, type FROM route
  WHERE parent_id=? AND route_key=?`;

  return new Promise((resolve, reject) => {
    db.get(query, [parentId, routeKey], (err, row: any) => {
      if (err) {
        console.error('Error retrieving pojectRows:', err);
        reject(err);
      } else {
        if (!row) {
          resolve(row);
          return;
        }
        let route: Route = {
          id: row.route_id,
          parentId: row.parent_id,
          key: row.route_key,
          parentPath: row.parent_path,
          parentFilePath: row.parent_file_path,
          type: row.type,
        };

        resolve(route);
      }
    });
  });
};

export const getRoutesByParent = async (
  parentPath: string
): Promise<Array<Route>> => {
  let query = `SELECT route_id, parent_id, route_key, parent_path, parent_file_path, type FROM route
  WHERE parent_path=?`;

  return new Promise((resolve, reject) => {
    db.all(query, [parentPath], (err, rows: any) => {
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

export const checkIfRouteExists = async (
  parentPath: string,
  routeKey: string,
  type: string
): Promise<Route> => {
  let query = `SELECT route_id, parent_id, route_key, parent_path, parent_file_path, type FROM route
  WHERE parent_path=? AND route_key=? AND type=?`;

  return new Promise((resolve, reject) => {
    db.get(query, [parentPath, routeKey, type], (err, row: any) => {
      if (err) {
        console.error('Error retrieving pojectRows:', err);
        reject(err);
      } else {
        if (!row) {
          resolve(row);
          return;
        }
        let route: Route = {
          id: row.route_id,
          parentId: row.parent_id,
          key: row.route_key,
          parentPath: row.parent_path,
          parentFilePath: row.parent_file_path,
          type: row.type,
        };

        resolve(route);
      }
    });
  });
};

export const removeRouteQuery = async (routeId: number): Promise<any> => {
  let query = `DELETE FROM route WHERE route_id=?`;

  return new Promise((resolve, reject) => {
    db.run(query, [routeId], (err) => {
      if (err) {
        console.error('Error retrieving pojectRows:', err);
        reject(err);
      } else {
        resolve(true);
      }
    });
  });
};
