import { useContext } from 'react'
import { AppContext, DEFAULT_APP_CONTEXT } from './context'
import { Map } from './components/Map'

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
          <main className="map">
            <Map />
          </main>
        </div>
      </AppContext.Provider>
    </>
  )
}

export default App
