<script lang="ts">
/**
 * Categorical legend entry, representing each category with a solid color.
 */

import { Color } from '@deck.gl/core';
import { toHexString } from '../../utils';

export type LegendEntryCategoricalProps = {
  title: string;
  subtitle: string;
  values: string[];
  getSwatchColor: (value: string) => Color;
};
</script>

<script setup lang="ts">
const props = defineProps<LegendEntryCategoricalProps>();
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
