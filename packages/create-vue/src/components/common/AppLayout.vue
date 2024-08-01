<script setup lang="ts">
import { context } from '../../context';

const navLinks: unknown[] = [];
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
    <nav v-if="navLinks.length" class="app-bar-nav">TODO</nav>
  </header>
  <div class="container">
    <slot />
  </div>
</template>
