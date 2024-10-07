import { useAuth0 } from '@auth0/auth0-vue';
import { useRoute } from 'vue-router';
import { context } from '../context';
import { computed, effect } from 'vue';

const FORCE_LOGIN_PARAM = 'forceLogin';

export function useAuth() {
  const route = useRoute();
  const {
    isAuthenticated,
    getAccessTokenSilently,
    user,
    loginWithRedirect,
    isLoading,
  } = useAuth0();

  const organizationId = context.oauth.organizationId || '';
  const namespace = context.oauth.namespace;

  const userMetadata = computed(() => {
    return user.value?.[`${namespace}user_metadata`];
  });

  const redirectAccountUri = computed(() => {
    return organizationId
      ? `${context.accountsUrl}sso/${organizationId}`
      : context.accountsUrl;
  });

  effect(async () => {
    if (route.query[FORCE_LOGIN_PARAM]) {
      // if FORCE_LOGIN_PARAM is set a relogin is required to refresh userMetadata
      loginWithRedirect();
    } else if (isAuthenticated.value && userMetadata.value) {
      context.accessToken = await getAccessTokenSilently();
    } else if (isAuthenticated.value && !isLoading.value) {
      // No organizations associated with the user, we need to redirect to app.carto.com to complete the signup process
      const searchParams = new URLSearchParams({
        redirectUri: `${window.location.origin}?${FORCE_LOGIN_PARAM}=true`,
      });
      window.location.href = `${redirectAccountUri.value}?${searchParams}`;
    }
  });

  return;
}
