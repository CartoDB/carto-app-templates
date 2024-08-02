<script lang="ts">
import { Color } from '@deck.gl/core';

export type LegendEntryCategoricalProps = {
  type: 'categorical';
  title: string;
  subtitle: string;
  values: string[];
  getSwatchColor: (value: string) => Color;
};
</script>

<script setup lang="ts">
const props = defineProps<LegendEntryCategoricalProps>();

function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}
</script>

<template>
  <section class="legend-section" :key="props.title">
    <p class="legend-section-title body2">{{ props.title }}</p>
    <p class="legend-section-subtitle caption">{{ props.subtitle }}</p>
    <ul class="legend-list">
      <li v-for="value in props.values" class="legend-list-item" key="value">
        <span
          class="legend-list-item-swatch"
          :style="{
            backgroundColor: toHexString(props.getSwatchColor(value)),
          }"
        />
        <span class="legend-list-item-title overline">
          {{ value }}
        </span>
      </li>
    </ul>
  </section>
</template>
