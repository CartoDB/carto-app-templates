<script setup lang="ts">
/**
 * Card UI. Used as a simple, collapsible container for widgets, legends,
 * and layer selection. If the title is omitted, no header is shown and
 * the card is no longer collapsible.
 */
const props = withDefaults(
  defineProps<{
    title?: string;
    open?: boolean;
  }>(),
  {
    title: undefined,
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
