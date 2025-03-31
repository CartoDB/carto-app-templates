<script setup lang="ts">
/**
 * Example application page, showing U.S. population.
 */

import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  shallowRef,
  watchEffect,
} from 'vue';
import { Map } from 'maplibre-gl';
import { Deck, MapViewState, AccessorFunction, Color } from '@deck.gl/core';
import { colorContinuous, H3TileLayer } from '@deck.gl/carto';
import { h3TableSource } from '@carto/api-client';
import Layers from '../Layers.vue';
import Card from '../Card.vue';
import LegendEntryContinuous from '../legends/LegendEntryContinuous.vue';
import { context } from '../../context';

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 31.8028,
  longitude: -103.0078,
  zoom: 2,
};

// TODO: Fetch domain/range from Widgets API?
const POP_DOMAIN: [number, number] = [0, 100000];
const POP_COLORS: AccessorFunction<unknown, Color> = colorContinuous({
  attr: 'population_sum',
  domain: POP_DOMAIN,
  colors: 'PinkYl',
});

/****************************************************************************
 * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
 */

const data = computed(() =>
  h3TableSource({
    accessToken: context.accessToken,
    apiBaseUrl: context.apiBaseUrl,
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

// Layer visibility represented as name/visibility pairs, managed by the Layers component.
const layerVisibility = ref<Record<string, boolean>>({
  'U.S. population': true,
});

// Update layers when data or visualization parameters change.
const layers = computed(() => [
  new H3TileLayer({
    id: 'U.S. population',
    visible: layerVisibility.value['U.S. population'],
    data: data.value,
    getFillColor: POP_COLORS,
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
    <Layers
      :layers
      :layer-visibility="layerVisibility"
      :on-layer-visibility-change="
        (nextLayerVisibility) => (layerVisibility = nextLayerVisibility)
      "
    />
    <Card title="Legend" class="legend">
      <LegendEntryContinuous
        title="U.S. population"
        subtitle="Sum of population by H3 cell"
        :domain="POP_DOMAIN"
        :get-swatch-color="
          (value) =>
            POP_COLORS({ properties: { population_sum: value } }, null!)
        "
      />
    </Card>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <aside class="map-footer" v-html="attributionHTML"></aside>
  </main>
</template>
