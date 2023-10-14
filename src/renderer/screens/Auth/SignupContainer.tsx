import Margin from '@/renderer/components/general/Margin';
import { UserService } from '@/renderer/services/UserService';
import { Button, Input } from 'antd';
import '@/renderer/styles/Auth/AuthScreen.scss';
import { Dispatch, SetStateAction, useState } from 'react';
import { useNavigate } from 'react-router';
import { setCurPage, AppPage } from '@/renderer/redux/app/appSlice';
import { useDispatch } from 'react-redux';

type SignupContainerProps = {
  setIsSignUp: Dispatch<SetStateAction<boolean>>;
};

function SignupContainer({ setIsSignUp }: SignupContainerProps) {
  const dispatch = useDispatch();
  const [details, setDetails] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errText, setErrText] = useState('');
  const [loading, setLoading] = useState(false);

  const signup = async () => {
    if (
      details.password == '' ||
      details.email == '' ||
      details.firstName == '' ||
      details.lastName == '' ||
      details.confirmPassword == ''
    ) {
      setErrText('Please fill in all fields');
      return;
    }

    if (details.password != details.confirmPassword) {
      setErrText("Passwords don't match");
      return;
    }

    setLoading(true);

    try {
      let res = await UserService.signup(details);
      await window.electron.setAuthTokens(res.data);
      setLoading(false);
      dispatch(setCurPage(AppPage.Home));
    } catch (error: any) {
      if (error.response.status == 409) {
        setErrText('Email already taken');
      }
    }
    setLoading(false);
  };

  return (
    <>
      <p className="welcomeText">Create an account!</p>
      <div className="nameInputs">
        <Input
          value={details.firstName}
          onChange={(e) =>
            setDetails({ ...details, firstName: e.target.value })
          }
          className="authInput"
          placeholder="First Name"
        />
        <Input
          value={details.lastName}
          onChange={(e) => setDetails({ ...details, lastName: e.target.value })}
          className="authInput"
          placeholder="Last Name"
        />
      </div>
      <Margin height={15} />
      <Input
        value={details.email}
        onChange={(e) => setDetails({ ...details, email: e.target.value })}
        className="authInput"
        placeholder="Email"
      />
      <Margin height={15} />
      <Input
        value={details.password}
        onChange={(e) => setDetails({ ...details, password: e.target.value })}
        className="authInput"
        placeholder="Password"
        type="password"
      />
      <Margin height={15} />
      <Input
        value={details.confirmPassword}
        onChange={(e) =>
          setDetails({ ...details, confirmPassword: e.target.value })
        }
        className="authInput"
        placeholder="Confirm password"
        type="password"
      />
      {errText && <p className="errorText">{errText}</p>}
      <Button
        loading={loading}
        type="primary"
        onClick={signup}
        className="actionBtn"
      >
        Sign up
      </Button>
      <button onClick={() => setIsSignUp(false)} className="altText">
        Click here to login
      </button>
    </>
  );
}

export default SignupContainer;
