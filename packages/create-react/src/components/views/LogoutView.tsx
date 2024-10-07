import { useAuth0 } from '@auth0/auth0-react';

/** Logout page, which immediately logs out and redirects to login. */
export default function LogoutView() {
  const { logout } = useAuth0();

  logout();

  return <p>Logging out…</p>;
}
