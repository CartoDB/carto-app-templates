import { Auth0Provider } from '@auth0/auth0-react';
import { RouterProvider } from 'react-router-dom';
import { AppContext, DEFAULT_APP_CONTEXT } from './context';
import { router } from './routes';
import { useEffect, useState } from 'react';

function App() {
  // Override 'setAccessToken' in AppContext, so that auth callbacks can
  // provide an updated access token.
  const [accessToken, setAccessToken] = useState(
    DEFAULT_APP_CONTEXT.accessToken,
  );

  useEffect(() => void (document.title = DEFAULT_APP_CONTEXT.title), []);

  return (
    <AppContext.Provider
      value={{ ...DEFAULT_APP_CONTEXT, accessToken, setAccessToken }}
    >
      <Auth0Provider
        domain={DEFAULT_APP_CONTEXT.oauth.domain}
        clientId={DEFAULT_APP_CONTEXT.oauth.clientId}
        cacheLocation="localstorage"
        authorizationParams={{
          audience: DEFAULT_APP_CONTEXT.oauth.audience,
          organization: DEFAULT_APP_CONTEXT.oauth.organizationId,
          redirect_uri: window.location.origin,
          scope: DEFAULT_APP_CONTEXT.oauth.scopes.join(' '),
        }}
      >
        <RouterProvider router={router} />
      </Auth0Provider>
    </AppContext.Provider>
  );
}

export default App;
