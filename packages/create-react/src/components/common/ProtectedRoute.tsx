import { Navigate } from 'react-router-dom';
// import { useAuth0 } from '@auth0/auth0-react';
import { RoutePath } from '../../routes';

export default function ProtectedRoute({
  children,
}: {
  children: JSX.Element;
}) {
  // TODO(impl): Auth
  // const { isAuthenticated, isLoading } = useAuth0();

  // if (!initialState.oauth) {
  //   return children;
  // }

  const authenticated = true; //notAuthenticated = !isLoading && !isAuthenticated && !accessToken;

  if (!authenticated) {
    return <Navigate to={RoutePath.LOGIN} />;
  }

  return children;
  // return !!accessToken ? children : null;
}
