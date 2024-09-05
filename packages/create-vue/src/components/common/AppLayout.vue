<script setup lang="ts">
import { context } from '../../context';
import { routes, RoutePath, NAV_ROUTES } from '../../routes';
</script>

<template>
  <header class="app-bar">
    <img
      v-if="context.logo"
      class="app-bar-logo"
      :src="context.logo.src"
      :alt="context.logo.alt"
    />
    <span class="app-bar-text body1 strong">{{ context.title }}</span>
    <nav v-if="routes.length > 1" class="app-bar-nav">
      <RouterLink
        v-for="route in NAV_ROUTES"
        :to="route.path"
        :key="route.path"
        class="body2 strong"
        :activeClass="'active'"
        >{{ route.text }}</RouterLink
      >
    </nav>
    <span className="flex-space" />
    <RouterLink :to="RoutePath.LOGOUT" class="body2 strong"
      >Sign out</RouterLink
    >
  </header>
  <div class="container">
    <RouterView />
  </div>
</template>
