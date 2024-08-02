<script setup lang="ts">
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';
import { Map } from 'maplibre-gl';
import { Deck, MapViewState } from '@deck.gl/core';
import { colorContinuous, H3TileLayer } from '@deck.gl/carto';
import { h3TableSource } from '@carto/api-client';
import Layers from '../common/Layers.vue';
import Legend from '../common/Legend.vue';
import Card from '../common/Card.vue';

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.0902,
  longitude: -95.7129,
  zoom: 3.5,
};

/****************************************************************************
 * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
 */

const data = computed(() =>
  h3TableSource({
    accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
    connectionName: 'carto_dw',
    tableName:
      'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
    spatialDataColumn: 'h3',
    aggregationExp: 'SUM(population) as population_sum',
  }),
);

/****************************************************************************
 * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
 */

const layerVisibility = ref<Record<string, boolean>>({
  'U.S. population': true,
});

const onLayerVisibilityChange = (visibility: Record<string, boolean>) => {
  layerVisibility.value = visibility;
};

const layers = computed(() => [
  new H3TileLayer({
    id: 'U.S. population',
    visible: layerVisibility.value['U.S. population'],
    data: data.value,
    getFillColor: colorContinuous({
      attr: 'population_sum',
      domain: [0, 100000], // TODO: Verify min/max.
      colors: 'PinkYl',
    }),
  }),
]);

/****************************************************************************
 * DeckGL
 */

const map = shallowRef<Map | null>(null);
const deck = shallowRef<Deck | null>(null);
const viewState = ref<MapViewState>(INITIAL_VIEW_STATE);
const attributionHTML = ref<string>('');

watchEffect(() => {
  const { longitude, latitude, ...rest } = viewState.value;
  map.value?.jumpTo({ center: [longitude, latitude], ...rest });
});

watchEffect(() => {
  deck.value?.setProps({ layers: layers.value });
});

watchEffect(() => {
  data.value?.then(({ attribution }) => (attributionHTML.value = attribution));
});

onMounted(() => {
  map.value = new Map({
    container: 'maplibre-container',
    style: MAP_STYLE,
    interactive: false,
  });

  deck.value = new Deck({
    canvas: 'deck-canvas',
    initialViewState: INITIAL_VIEW_STATE,
    controller: true,
    layers: [],
    onViewStateChange: ({ viewState: _viewState }) => {
      viewState.value = _viewState;
    },
  });
});

onUnmounted(() => {
  deck.value?.finalize();
  map.value?.remove();
});
</script>
<template>
  <aside class="sidebar">
    <Card>
      <p class="overline">✨👀 You're viewing</p>
      <h1 class="title">U.S. population</h1>
      <p class="body1">
        Chupa chups chocolate cupcake cake soufflé. Wafer carrot cake danish
        gummi bears jelly. Sugar plum wafer cake chocolate bar caramels sesame
        snaps fruitcake tiramisu.
      </p>
      <p class="body1">
        Chocolate cake pastry pie apple pie oat cake dessert macaroon. Pastry
        sugar plum pie carrot cake biscuit. Bear claw sugar plum topping cake
        danish cotton candy pudding.
      </p>
    </Card>
    <span class="flex-space" />
  </aside>
  <main class="map">
    <div
      id="maplibre-container"
      style="position: absolute; width: 100%; height: 100%"
    ></div>
    <canvas
      id="deck-canvas"
      style="position: absolute; width: 100%; height: 100%"
    ></canvas>
    <Layers :layers :layerVisibility :onLayerVisibilityChange />
    <Legend
      :entries="[
        {
          type: 'continuous',
          title: 'U.S. population',
          subtitle: 'Sum of population by H3 cell',
        },
      ]"
    />
    <aside class="map-footer" v-html="attributionHTML"></aside>
  </main>
</template>
