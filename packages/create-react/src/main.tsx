import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import '@carto/create-common/style.css';

// TODO: Restore <React.StrictMode /> wrapper after resolution of
// https://github.com/visgl/deck.gl/issues/9379
ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
