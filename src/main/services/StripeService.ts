import axios from 'axios';
import { requestInterceptor, responseInterceptor } from './config';
import { endpoint } from '@/renderer/misc/constants';

axios.interceptors.request.use(requestInterceptor, (error) =>
  Promise.reject(error)
);

axios.interceptors.response.use((response) => {
  return response;
}, responseInterceptor);

export class StripeService {
  static getCheckoutLink = async () =>
    await axios.get(`${endpoint}/private/stripe/checkout_link`);
  static getPortalLink = async () =>
    await axios.get(`${endpoint}/private/stripe/portal_link`);
}
