import { useState } from 'react';
import SignupContainer from './SignupContainer';
import '@/renderer/styles/Auth/AuthScreen.scss';
import LoginContainer from './LoginContainer';

function AuthScreen() {
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <div className="authBg">
      <h1>Visual Backend</h1>
      <div
        className="authContainer"
        style={isSignUp ? { width: '350px' } : { width: '300px' }}
      >
        {isSignUp ? (
          <SignupContainer setIsSignUp={setIsSignUp} />
        ) : (
          <LoginContainer setIsSignUp={setIsSignUp} />
        )}
      </div>
    </div>
  );
}

export default AuthScreen;
