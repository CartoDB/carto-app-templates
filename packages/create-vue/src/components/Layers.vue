<script setup lang="ts">
import Card from './Card.vue';
import { Layer } from '@deck.gl/core';

const props = withDefaults(
  defineProps<{
    open?: boolean;
    layers: Layer[];
    layerVisibility: Record<string, boolean>;
    onLayerVisibilityChange: (visibility: Record<string, boolean>) => void;
  }>(),
  { open: true },
);

function setVisibility(id: string, visible: boolean) {
  props.onLayerVisibilityChange({ ...props.layerVisibility, [id]: visible });
}
</script>

<template>
  <aside class="layers">
    <Card title="Layers" :open="props.open">
      <label v-for="layer in layers" class="body2" :key="layer.id">
        <input
          type="checkbox"
          :checked="layer.props.visible"
          @input="
            ({ target }) =>
              setVisibility(layer.id, (target as HTMLInputElement).checked)
          "
        />{{ layer.id }}
      </label>
    </Card>
  </aside>
</template>
