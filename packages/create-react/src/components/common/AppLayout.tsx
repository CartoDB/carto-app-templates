import { useContext } from 'react';
import { AppContext } from '../../context';
import { NAV_ROUTES } from '../../routes';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  const context = useContext(AppContext);

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
        <span className="header-text">{context.title}</span>
        <nav className="header-nav">
          <ul>
            {NAV_ROUTES.length > 1 &&
              NAV_ROUTES.map(({ text, path }) => (
                <a href={path} key={path}>
                  {text}
                </a>
              ))}
          </ul>
        </nav>
      </header>
      <div className="container">
        <Outlet />
      </div>
    </>
  );
}
