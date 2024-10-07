import { useAuth0 } from '@auth0/auth0-react';
import { useContext } from 'react';
import { AppContext } from '../../context';

/** Login page, showing a button that redirects to login form. */
export default function LoginView() {
  const { title, subtitle, logo } = useContext(AppContext);
  const { loginWithRedirect } = useAuth0();
  return (
    <main className="login">
      {logo && <img className="login-logo" src={logo.src} alt={logo.alt} />}
      <h1 className="title">{title}</h1>
      <p className="subtitle">{subtitle}</p>
      <button className="body1" onClick={() => loginWithRedirect()}>
        Login with CARTO
      </button>
      <p className="caption">Use your CARTO credentials</p>
    </main>
  );
}
