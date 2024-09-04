import { ReactNode, useContext } from 'react';
import { AppContext } from '../../context';
import { NAV_ROUTES, RoutePath } from '../../routes';
import { NavLink, Outlet } from 'react-router-dom';

export default function AppLayout() {
  const context = useContext(AppContext);

  let navLinks: ReactNode[] | null = null;
  if (NAV_ROUTES.length > 1) {
    navLinks = NAV_ROUTES.map(({ text, path }) => (
      <NavLink key={path} to={path} className="body2 strong" reloadDocument>
        {text}
      </NavLink>
    ));
  }

  return (
    <>
      <header className="app-bar">
        {context.logo && (
          <img
            className="app-bar-logo"
            src={context.logo.src}
            alt={context.logo.alt}
          />
        )}
        <span className="app-bar-text body1 strong">{context.title}</span>
        <nav className="app-bar-nav">{navLinks}</nav>
        <span className="flex-space" />
        {context.oauth.enabled && (
          <NavLink
            to={RoutePath.LOGOUT}
            className="body2 strong"
            reloadDocument
          >
            Sign out
          </NavLink>
        )}
      </header>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
