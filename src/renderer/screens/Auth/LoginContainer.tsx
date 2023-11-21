import Margin from '@/renderer/components/general/Margin';
import { AppPage, setCurPage } from '@/renderer/redux/app/appSlice';
import { UserService } from '@/renderer/services/UserService';
import { Button, Input } from 'antd';
import React, { Dispatch, SetStateAction, useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router';
type LoginContainerProps = {
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
};

function LoginContainer({ setIsSignUp }: LoginContainerProps) {
  const dispatch = useDispatch();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  const login = async () => {
    setLoading(true);

    try {
      let res = await UserService.login(email, password);
      console.log('Res:', res);
      await window.electron.setAuthTokens(res.data);
      dispatch(setCurPage(AppPage.Home));
    } catch (error) {
      console.log(error);
      setErrorText('Email or password was invalid');
    }
    setLoading(false);
  };

  return (
    <>
      <p className="welcomeText"> Welcome back!</p>
      <Input
        className="authInput"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
      />
      <Margin height={15} />
      <Input
        className="authInput"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        type="password"
      />
      <Button
        type="primary"
        onClick={login}
        className="actionBtn"
        loading={loading}
      >
        Login
      </Button>
      <button onClick={() => setIsSignUp(true)} className="altText">
        Click here to create an account
      </button>
      {errorText && <p className="errorText">{errorText}</p>}
    </>
  );
}

export default LoginContainer;
