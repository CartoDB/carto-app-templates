import { createApp, Plugin } from 'vue';
import '@carto/create-common/style.css';
import App from './App.vue';
import { router } from './routes';
import { context } from './context';
import { createAuth0 } from '@auth0/auth0-vue';

const app = createApp(App);

app.use(router);

if (context.oauth.enabled) {
  app.use(
    createAuth0({
      domain: context.oauth.domain,
      clientId: context.oauth.clientId!,
      cacheLocation: 'localstorage',
      authorizationParams: {
        audience: context.oauth.audience,
        organization: context.oauth.organizationId,
        redirect_uri: window.location.origin,
        scope: context.oauth.scopes.join(' '),
      },
    }) as unknown as Plugin<[]>,
  );
}

app.mount('#root');

document.title = context.title;
