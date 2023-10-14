import axios from 'axios';
import { requestInterceptor, responseInterceptor } from './config';
import { endpoint } from '@/renderer/misc/constants';

axios.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios.interceptors.response.use((response) => {
  return response;
}, responseInterceptor);

export class ProjectService {
  static getProjectSecretStatements = async (projId: string) =>
    await axios.get(`${endpoint}/private/projects/${projId}/secrets`);

  static addEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/env_vars`, data);

  static deleteEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/delete_env_vars`, data);

  static updateEnvVars = async (data: any) =>
    await axios.post(`${endpoint}/private/projects/update_env_vars`, data);
}
