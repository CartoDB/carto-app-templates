<script setup lang="ts">
import Card from './Card.vue';
import LegendEntryCategorical, {
  LegendEntryCategoricalProps,
} from './LegendEntryCategorical.vue';
import LegendEntryContinuous, {
  LegendEntryContinuousProps,
} from './LegendEntryContinuous.vue';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    entries: (LegendEntryCategoricalProps | LegendEntryContinuousProps)[];
  }>(),
  { open: true },
);
</script>
<template>
  <aside class="legend">
    <Card title="Legend" :open="props.open">
      <section
        v-for="entry in entries"
        class="legend-section"
        :key="entry.title"
      >
        <LegendEntryCategorical
          v-if="entry.type === 'categorical'"
          v-bind="entry"
        />
        <LegendEntryContinuous
          v-if="entry.type === 'continuous'"
          v-bind="entry"
        />
      </section>
    </Card>
  </aside>
</template>
