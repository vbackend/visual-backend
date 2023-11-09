import { BrowserWindow, IpcMainEvent } from 'electron';
export const closeWindow = (mainWindow: BrowserWindow) => {
  mainWindow.close();
};
export const minimizeWindow = (mainWindow: BrowserWindow) => {
  mainWindow.minimize();
};

export const maximizeWindow = (mainWindow: BrowserWindow) => {
  mainWindow.maximize();
};
