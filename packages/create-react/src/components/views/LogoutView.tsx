import { useAuth0 } from '@auth0/auth0-react';

export default function LogoutView() {
  const { logout } = useAuth0();

  logout();

  return <p>Logging out…</p>;
}
