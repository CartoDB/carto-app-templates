<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    title?: string;
    open?: boolean;
  }>(),
  {
    open: true,
  },
);
</script>

<template>
  <template v-if="props.title">
    <details class="card" :open="props.open">
      <summary class="card-summary">
        <span class="body1 card-summary-title">{{ props.title }}</span>
      </summary>
      <div class="card-content">
        <slot />
      </div>
    </details>
  </template>

  <template v-else>
    <section class="card">
      <div class="card-content"><slot /></div>
    </section>
  </template>
</template>
