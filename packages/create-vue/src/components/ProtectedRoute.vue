<script setup lang="ts">
/**
 * Wrapper component for routes that require authentication. If authentication
 * is disabled at the application level, this component does nothing.
 */
import { effect } from 'vue';
import AppLayout from './AppLayout.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { context } from '../context';
import { router, RoutePath } from '../routes';
import { useAuth } from '../hooks/useAuth';

useAuth();
const { isAuthenticated, isLoading } = useAuth0();

// If necessary, redirect to login page.
effect(() => {
  if (
    context.oauth.enabled &&
    !context.accessToken &&
    !isLoading.value &&
    !isAuthenticated.value
  ) {
    router.replace(RoutePath.LOGIN);
  }
});
</script>

<template>
  <!-- If we're logged in but still waiting for an access token, wait to render children. -->
  <template v-if="!context.oauth.enabled || context.accessToken">
    <AppLayout>
      <slot />
    </AppLayout>
  </template>
</template>
