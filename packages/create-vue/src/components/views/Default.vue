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
import { AccessorFunction, Deck, MapViewState, Color } from '@deck.gl/core';
import { colorCategories, VectorTileLayer } from '@deck.gl/carto';
import { vectorQuerySource } from '@carto/api-client';
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

// TODO: Fetch categories from Widgets API?
const RADIO_DOMAIN = ['LTE', 'UMTS', 'CDMA', 'GSM', 'NR'];
const RADIO_COLORS: AccessorFunction<unknown, Color> = colorCategories({
  attr: 'radio',
  domain: RADIO_DOMAIN,
  colors: 'Bold',
});

/****************************************************************************
 * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
 */

const data = computed(() =>
  vectorQuerySource({
    accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
    connectionName: 'carto_dw',
    sqlQuery:
      'SELECT * FROM `carto-demo-data.demo_tables.cell_towers_worldwide`',
  }),
);

/****************************************************************************
 * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
 */

const layerVisibility = ref<Record<string, boolean>>({
  'Cell towers': true,
});

const onLayerVisibilityChange = (visibility: Record<string, boolean>) => {
  layerVisibility.value = visibility;
};

const layers = computed(() => [
  new VectorTileLayer({
    id: 'Cell towers',
    visible: layerVisibility.value['Cell towers'],
    data: data.value,
    pointRadiusMinPixels: 4,
    getFillColor: RADIO_COLORS,
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
      <h1 class="title">Cell towers</h1>
      <p class="body1">
        Cheesecake caramels sesame snaps gummi bears oat cake chupa chups. Chupa
        chups sugar plum tootsie roll powder candy canes. Biscuit cake gummies
        cheesecake cupcake biscuit bear claw icing. Jelly topping caramels gummi
        bears carrot cake pudding.
      </p>
      <p class="body1">
        Bear claw marshmallow gingerbread muffin sweet roll bear claw ice cream
        cake macaroon. Lollipop brownie ice cream pudding sweet gummi bears
        jelly jelly-o tart.
      </p>
    </Card>
    <span class="flex-space" />
    <Card title="Tower count">
      <div class="skeleton" style="height: 8em" />
    </Card>
    <Card title="Towers by radio">
      <div class="skeleton" style="height: 6em" />
    </Card>
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
        // TODO: Cleaner way to generate a legend?
        {
          type: 'categorical',
          title: 'Cell towers',
          subtitle: 'By Radio',
          values: RADIO_DOMAIN,
          getSwatchColor: (value: string) =>
            RADIO_COLORS({ properties: { radio: value } }, null!),
        },
      ]"
    />
    <aside class="map-footer" v-html="attributionHTML"></aside>
  </main>
</template>
