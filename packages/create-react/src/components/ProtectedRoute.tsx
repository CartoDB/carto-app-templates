import { Navigate } from 'react-router-dom';
import { RoutePath } from '../routes';
import { useAuth0 } from '@auth0/auth0-react';
import { AppContext } from '../context';
import { useContext } from 'react';
import { useAuth } from '../hooks/useAuth';

/**
 * Wrapper component for routes that require authentication. If authentication
 * is disabled at the application level, this component does nothing.
 */
export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  useAuth();
  const { isAuthenticated, isLoading } = useAuth0();
  const { oauth, accessToken } = useContext(AppContext);

  // If necessary, redirect to login page.
  if (oauth.enabled && !isLoading && !isAuthenticated && !accessToken) {
    return <Navigate to={RoutePath.LOGIN} />;
  }

  // If  we're logged in but still waiting for an access token, wait to render children.
  return !oauth.enabled || accessToken ? children : null;
}
