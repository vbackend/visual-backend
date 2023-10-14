import axios from 'axios';
import { endpoint } from '../misc/constants';
import { requestInterceptor, responseInterceptor } from './config';

axios.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios.interceptors.response.use((response) => {
  return response;
}, responseInterceptor);

export class UserService {
  static getUser = async () => await axios.get(`${endpoint}/private/user`);

  static getProjects = async () =>
    await axios.get(`${endpoint}/private/user/projects`);

  static login = async (email: string, password: string) =>
    await axios.post(`${endpoint}/public/auth/login`, {
      email,
      password,
    });

  static signup = async (details: any) =>
    await axios.post(`${endpoint}/public/auth/signup`, details);
}
