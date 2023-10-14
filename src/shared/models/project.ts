export type Project = {
  _id: string;
  name: string;
  key: string;
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
