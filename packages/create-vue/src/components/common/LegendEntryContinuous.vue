<script lang="ts">
export type LegendEntryContinuousProps = {
  type: 'continuous';
  title: string;
  subtitle: string;
  // TODO
};
</script>

<script setup lang="ts">
const props = defineProps<LegendEntryContinuousProps>();
</script>

<template>
  <section class="legend-section" :key="props.title">
    <p class="legend-section-title body2">{{ props.title }}</p>
    <p class="legend-section-subtitle caption">{{ props.subtitle }}</p>
    <div class="legend-gradient skeleton overline" style="height: '20px'">
      TODO
    </div>
  </section>
</template>
