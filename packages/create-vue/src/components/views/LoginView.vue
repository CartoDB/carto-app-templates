<script setup lang="ts">
/** Login page, showing a button that redirects to login form. */

import { useAuth0 } from '@auth0/auth0-vue';
import { context } from '../../context';
const { loginWithRedirect } = useAuth0();
</script>

<template>
  <main class="login">
    <img
      v-if="context.logo"
      class="login-logo"
      :src="context.logo.src"
      :alt="context.logo.alt"
    />
    <h1 class="title">{{ context.title }}</h1>
    <p class="subtitle">{{ context.subtitle }}</p>
    <button class="body1" @click="() => loginWithRedirect()">
      Login with CARTO
    </button>
    <p class="caption">Use your CARTO credentials</p>
  </main>
</template>
