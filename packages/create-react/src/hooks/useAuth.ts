import { useCallback, useContext, useEffect, useMemo } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useSearchParams } from 'react-router-dom';
import { AppContext } from '../context';

const FORCE_LOGIN_PARAM = 'forceLogin';

export function useAuth() {
  const { setAccessToken, accountsUrl, oauth } = useContext(AppContext);
  const { isAuthenticated, getAccessTokenSilently, user, loginWithRedirect } =
    useAuth0();
  const [searchParams] = useSearchParams();

  const organizationId = oauth.organizationId || '';
  const namespace = oauth.namespace;
  const hasForceLogin = searchParams.has(FORCE_LOGIN_PARAM);

  const getAccessToken = useCallback(async () => {
    setAccessToken(await getAccessTokenSilently());
  }, [setAccessToken, getAccessTokenSilently]);

  const userMetadata = useMemo(() => {
    if (!user) return;
    return user[`${namespace}user_metadata`];
  }, [user, namespace]);

  const redirectAccountUri = useMemo(() => {
    return `${accountsUrl}${organizationId ? `sso/${organizationId}` : ''}`;
  }, [accountsUrl, organizationId]);

  useEffect(() => {
    if (hasForceLogin) {
      // if FORCE_LOGIN_PARAM is set a relogin is required to refresh userMetadata
      loginWithRedirect();
    } else if (isAuthenticated && userMetadata) {
      getAccessToken();
    } else if (isAuthenticated) {
      // No organizations associated with the user, we need to redirect to app.carto.com to complete the signup process
      const searchParams = new URLSearchParams({
        redirectUri: `${window.location.origin}?${FORCE_LOGIN_PARAM}=true`,
      });
      window.location.href = `${redirectAccountUri}?${searchParams}`;
    }
  }, [
    hasForceLogin,
    getAccessToken,
    isAuthenticated,
    loginWithRedirect,
    redirectAccountUri,
    userMetadata,
  ]);

  return;
}
