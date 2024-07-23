import { createContext, useContext } from 'react'
import cartoLogo from '/carto.svg'

interface AppContextProps {
  title: string,
  logo?: {
    src: string,
    alt: string,
  },
  pages: { name: string, href: string }[],
  theme: {
    textColor: string,
    backgroundColor: string,
    primaryColor: string,
    secondaryColor: string,
  },
}

const DEFAULT_APP_CONTEXT = {
  title: /* replace:title:begin */'Untitled'/* replace:title:end */,
  logo: {
    src: cartoLogo,
    alt: 'CARTO logo',
  },
  pages: [{name: 'default', href: '/'}],
  theme: {
    textColor: '#000000',
    backgroundColor: '#FFFFFF',
    primaryColor: '#162945',
    secondaryColor: '#45546A',
  },
};

const AppContext = createContext<AppContextProps>(DEFAULT_APP_CONTEXT)

function App() {
  const context = useContext(AppContext)

  return (
    <>
      <AppContext.Provider value={DEFAULT_APP_CONTEXT}>
        <header className="header">
          {context.logo && <img className="header-logo" src={context.logo.src} alt={context.logo.alt} />}
          <span className="header-text">
              {context.title}
          </span>
          <nav className="header-nav">
            <ul>
              {context.pages.length > 1 && context.pages.map(({ name, href }) => <a href={href}>{name}</a>)}
            </ul>
          </nav>
        </header>
        <div className="container">
          <aside className="sidebar"></aside>
          <main className="map"></main>
        </div>
      </AppContext.Provider>
    </>
  )
}

export default App
