import axios from 'axios';
import { requestInterceptor, responseInterceptor } from './config';
import { endpoint } from '@/renderer/misc/constants';
import { ProjectType } from '@/shared/models/project';

axios.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios.interceptors.response.use((response) => {
  return response;
}, responseInterceptor);

export class GptService {
  static generateFunc = async (data: {
    funcScaffold: string;
    funcName: string;
    serviceName: string;
    details: string;
    projectType: ProjectType;
  }) => await axios.post(`${endpoint}/private/gpt/generate_function`, data);
}
