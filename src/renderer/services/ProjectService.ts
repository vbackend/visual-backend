import axios from 'axios';
import { endpoint } from '../misc/constants';
import { requestInterceptor, responseInterceptor } from './config';

axios.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios.interceptors.response.use((response) => {
  return response;
}, responseInterceptor);

export class ProjectService {
  static createProject = async (name: string, type: string) =>
    await axios.post(`${endpoint}/private/projects`, {
      name,
      type,
    });

  static getProjectData = async (id: string) =>
    await axios.get(`${endpoint}/private/projects/${id}`);

  static createBuild = async (id: string) =>
    await axios.post(`${endpoint}/private/projects/build/${id}`);

  static deleteProject = async (id: string) =>
    await axios.delete(`${endpoint}/private/projects/${id}`);

  static getCloudData = async (id: string) =>
    await axios.get(`${endpoint}/private/projects/${id}/cloud`);

  static createProjectTrigger = async (id: string) =>
    await axios.post(`${endpoint}/private/projects/triggers/${id}`, null);

  static addEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/env_vars`, data);
  static deleteEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/delete_env_vars`, data);
  static updateEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/update_env_vars`, data);
}
