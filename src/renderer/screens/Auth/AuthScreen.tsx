import { useEffect, useState } from 'react';
import '@/renderer/styles/Auth/AuthScreen.scss';
import { Button } from 'antd';
import { useDispatch } from 'react-redux';
import { AppPage, setCurPage } from '@/renderer/redux/app/appSlice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGithub } from '@fortawesome/free-brands-svg-icons';

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);
  const dispatch = useDispatch();

  let redirectUri = 'visual-backend://eliseapp.com/auth/callback';
  let githubSignIn = `https://github.com/login/oauth/authorize?client_id=Iv1.c8341ac1688e6ef8&redirect_uri=${redirectUri}`;

  useEffect(() => {
    let handleMessage: any = (event: any, payload: any) => {
      if (payload.status == 'success') {
        dispatch(setCurPage(AppPage.Home));
      }
    };

    window.electron.onAuthUpdate(handleMessage);
  }, []);
  return (
    <div className="authBg">
      <h1>Visual Backend</h1>
      {/* <div
        className="authContainer"
        style={isSignUp ? { width: '350px' } : { width: '300px' }}
      > */}
      <Button
        onClick={() => {
          window.electron.openExternalPage(githubSignIn);
        }}
        className="githubBtn"
      >
        <FontAwesomeIcon icon={faGithub} className="icon" />
        <p className="text">Login with GitHub</p>
      </Button>
      {/* {isSignUp ? (
          <SignupContainer setIsSignUp={setIsSignUp} />
        ) : (
          <LoginContainer setIsSignUp={setIsSignUp} />
        )} */}
      {/* </div> */}
    </div>
  );
}

export default AuthScreen;
