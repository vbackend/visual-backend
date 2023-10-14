import { StripeService } from '@/main/services/StripeService';
import electron from 'electron';

export const openCheckoutPage = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { data } = await StripeService.getCheckoutLink();
  electron.shell.openExternal(data);
};

export const openCustomerPortal = async (
  e: Electron.IpcMainInvokeEvent,
  payload: any
) => {
  let { data } = await StripeService.getPortalLink();
  electron.shell.openExternal(data);
};
