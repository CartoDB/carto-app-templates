<script setup lang="ts">
import { effect } from 'vue';
import AppLayout from './AppLayout.vue';
import { useAuth0 } from '@auth0/auth0-vue';
import { context } from '../../context';
import { router, RoutePath } from '../../routes';
import { useAuth } from '../../hooks/useAuth';

useAuth();
const { isAuthenticated, isLoading } = useAuth0();

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
  <template v-if="!context.oauth.enabled || context.accessToken">
    <AppLayout>
      <slot />
    </AppLayout>
  </template>
</template>
