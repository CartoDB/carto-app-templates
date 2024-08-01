<script setup lang="ts">
import Card from './Card.vue';
import { Color } from '@deck.gl/core';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    entries: {
      title: string;
      subtitle: string;
      values: string[];
      getSwatchColor: (value: string) => Color;
    }[];
  }>(),
  { open: true },
);

function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}
</script>
<template>
  <aside class="legend">
    <Card title="Legend" :open="props.open">
      <section v-for="entry in entries" class="legend-section" key="{title}">
        <p class="legend-section-title body2">{{ entry.title }}</p>
        <p class="legend-section-subtitle caption">{{ entry.subtitle }}</p>
        <ul class="legend-list">
          <li
            v-for="value in entry.values"
            class="legend-list-item"
            key="value"
          >
            <span
              class="legend-list-item-swatch"
              :style="{
                backgroundColor: toHexString(entry.getSwatchColor(value)),
              }"
            />
            <span class="legend-list-item-title overline">
              {{ value }}
            </span>
          </li>
        </ul>
      </section>
    </Card>
  </aside>
</template>
