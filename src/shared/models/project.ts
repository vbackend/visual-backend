export enum ProjectType {
  Express = 'express',
  FastAPI = 'fastapi',
}

export type Project = {
  _id: string;
  name: string;
  key: string;
  projectType?: ProjectType;
  gitlabProjectId: number;
  projectAccessToken: string;
  triggerId: string;
};

export type EnvVar = {
  key: string;
  val: string;
};

export class ProjectFuncs {
  static getKey = (name: string) => name.toLowerCase().replaceAll(' ', '-');
}
