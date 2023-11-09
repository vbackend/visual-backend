import './App.scss';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './redux/store';
import ProjectScreen from './screens/Project/ProjectScreen';
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
