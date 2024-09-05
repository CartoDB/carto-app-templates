import { Navigate } from 'react-router-dom';
import { RoutePath } from '../../routes';
import { useAuth0 } from '@auth0/auth0-react';
import { AppContext } from '../../context';
import { useContext } from 'react';
import { useAuth } from '../../hooks/useAuth';

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  useAuth();
  const { isAuthenticated, isLoading } = useAuth0();
  const { oauth, accessToken } = useContext(AppContext);

  if (oauth.enabled && !isLoading && !isAuthenticated && !accessToken) {
    return <Navigate to={RoutePath.LOGIN} />;
  }

  return !oauth.enabled || accessToken ? children : null;
}
