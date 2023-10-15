import logo from './logo.svg';
import './App.scss';
import Home from './screens/Home/Home';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import ProjectScreen from './screens/Project/ProjectScreen';
import { useCommand, useCommandA } from './hooks/shortcuts';
import {
  createBrowserRouter,
  createHashRouter,
  HashRouter,
  Route,
  RouterProvider,
} from 'react-router-dom';
import TerminalComponent from './screens/Project/Terminal/Terminal';
import AuthScreen from './screens/Auth/AuthScreen';
import { AppPage, setPlatform } from './redux/app/appSlice';
import HomeScreen from './screens/Home/Home';

function App() {
  const appState = useSelector((state: RootState) => state.app);
  const dispatch = useDispatch();
  const init = async () => {
    dispatch(setPlatform(await window.electron.getDeviceType()));
  };

  const curPage = appState.curPage;

  useEffect(() => {
    init();
  }, []);

  return (
    <>
      {curPage === AppPage.Auth ? (
        <AuthScreen />
      ) : curPage === AppPage.Home ? (
        <HomeScreen />
      ) : (
        <ProjectScreen />
      )}
    </>
  );
}

export default App;
