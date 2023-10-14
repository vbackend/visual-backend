export enum BuildStatus {
  SUCCESS = 'SUCCESS',
  WORKING = 'WORKING',
}

export type GBuild = {
  id: string;
  status: BuildStatus;
  createTime: number;
};
