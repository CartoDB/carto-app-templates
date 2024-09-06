<script setup lang="ts">
/** Logout page, which immediately logs out and redirects to login. */

import { useAuth0 } from '@auth0/auth0-vue';
const { logout } = useAuth0();
logout();
</script>

<template>
  <p>Logging out…</p>
</template>
