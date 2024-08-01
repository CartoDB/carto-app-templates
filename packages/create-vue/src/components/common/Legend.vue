<script setup lang="ts">
import Card from './Card.vue';
const props = withDefaults(defineProps<{ open?: boolean }>(), { open: true });
</script>
<template>
  <aside class="legend">
    <Card title="Legend" :open="props.open">
      <div class="skeleton" style="height: 7em" />
    </Card>
  </aside>
</template>
