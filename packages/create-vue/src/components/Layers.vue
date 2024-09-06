<script setup lang="ts">
/**
 * Layer list and visibility controller.
 */
import Card from './Card.vue';
import { Layer } from '@deck.gl/core';

const props = withDefaults(
  defineProps<{
    /** Whether the layer list is open (default) or closed. */
    open?: boolean;
    /** List of deck.gl layers. */
    layers: Layer[];
    /** Layer visibility state. Object keys are layer names, values are boolean visibility. */
    layerVisibility: Record<string, boolean>;
    /** Callback to be invoked by the Layers component if a layer's visibility is toggled. */
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
