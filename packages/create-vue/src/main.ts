import { createApp } from 'vue';
import '@carto/create-common/style.css';
import App from './App.vue';
import { router } from './routes';

createApp(App).use(router).mount('#root');
