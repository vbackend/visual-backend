export enum DbType {
  MySQL = 'MySQL',
  MongoDB = 'MongoDB',
}

export type DbConn = {
  id: number;
  type: DbType;
  connString: string;
  dbName: string;
};
