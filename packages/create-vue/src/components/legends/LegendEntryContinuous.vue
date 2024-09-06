<script lang="ts">
/**
 * Continuous legend entry, representing a continuous domain [min, max]
 * as a color gradient, with labeled min and max values.
 */

import type { Color } from '@deck.gl/core';

export type LegendEntryContinuousProps = {
  title: string;
  subtitle: string;
  domain: [number, number];
  getSwatchColor: (value: number) => Color;
};
</script>

<script setup lang="ts">
import { computed } from 'vue';

import { toHexString } from '../../utils';
const props = defineProps<LegendEntryContinuousProps>();

const colorLo = computed(() =>
  toHexString(props.getSwatchColor(props.domain[0])),
);
const colorHi = computed(() =>
  toHexString(props.getSwatchColor(props.domain[1])),
);
</script>

<template>
  <section class="legend-section" :key="props.title">
    <p class="legend-section-title body2">{{ props.title }}</p>
    <p class="legend-section-subtitle caption">{{ props.subtitle }}</p>
    <div
      class="legend-gradient overline"
      :style="{
        background: `linear-gradient(to right, ${colorLo}, ${colorHi})`,
      }"
    >
      <span class="legend-gradient-label -min">{{ props.domain[0] }}</span>
      <span class="legend-gradient-label -max">{{ props.domain[1] }}</span>
    </div>
  </section>
</template>
