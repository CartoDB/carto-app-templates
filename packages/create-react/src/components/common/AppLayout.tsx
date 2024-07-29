import { ReactNode, useContext } from 'react';
import { AppContext } from '../../context';
import { NAV_ROUTES } from '../../routes';
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
      <header className="header">
        {context.logo && (
          <img
            className="header-logo"
            src={context.logo.src}
            alt={context.logo.alt}
          />
        )}
        <span className="header-text body1 strong">{context.title}</span>
        <nav className="header-nav">{navLinks}</nav>
      </header>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
