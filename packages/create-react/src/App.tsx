import { RouterProvider } from 'react-router-dom';
import { AppContext, DEFAULT_APP_CONTEXT } from './context';
import { router } from './routes';

function App() {
  return (
    <AppContext.Provider value={DEFAULT_APP_CONTEXT}>
      <RouterProvider router={router} />
    </AppContext.Provider>
  );
}

export default App;
