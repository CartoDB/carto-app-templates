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
import { Deck, MapViewState, Color, WebMercatorViewport } from '@deck.gl/core';
import { BASEMAP, VectorTileLayer } from '@deck.gl/carto';
import {
  createViewportSpatialFilter,
  vectorTilesetSource,
} from '@carto/api-client';
import Layers from '../Layers.vue';
import Card from '../Card.vue';
import { context } from '../../context';
import FormulaWidget from '../widgets/FormulaWidget.vue';
import HistogramWidget from '../widgets/HistogramWidget.vue';
import { refDebounced } from '@vueuse/core';
import LegendEntryCategorical from '../legends/LegendEntryCategorical.vue';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_opensource_demo.national_water_model_tileset_final_test_4';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.0902,
  longitude: -95.7129,
  zoom: 3.5,
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

function streamOrderToColor(n: number) {
  const [r, g, b] = hexToRgb('#d5d5d7');
  const alphaPart = Math.min(n / 10, 1);
  const alpha = 120 + 128 * alphaPart;
  return [r, g, b, alpha];
}

/****************************************************************************
 * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
 */

const data = computed(() =>
  vectorTilesetSource({
    accessToken: context.accessToken,
    apiBaseUrl: context.apiBaseUrl,
    connectionName: CONNECTION_NAME,
    tableName: TILESET_NAME,
  }),
);

/****************************************************************************
 * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
 */

const LAYER_ID = 'U.S. rivers';

// Layer visibility represented as name/visibility pairs, managed by the Layers component.
const layerVisibility = ref<Record<string, boolean>>({
  [LAYER_ID]: true,
});

// Update layers when data or visualization parameters change.
const layers = computed(() => [
  new VectorTileLayer({
    id: LAYER_ID,
    visible: layerVisibility.value[LAYER_ID],
    data: data.value,
    getLineColor: (d) => {
      return streamOrderToColor(d.properties.streamOrder) as Color;
    },
    getLineWidth: (d) => {
      const n = d.properties.streamOrder;
      return n * 0.5;
    },
    lineWidthUnits: 'pixels',
    lineWidthMinPixels: 1,
    onViewportLoad(tiles) {
      data.value?.then((res) => {
        tilesLoaded.value = true;
        res.widgetSource.loadTiles(tiles);
        viewState.value = { ...viewState.value };
      });
    },
  }),
]);

/****************************************************************************
 * DeckGL
 */

const map = shallowRef<Map | null>(null);
const deck = shallowRef<Deck | null>(null);
const viewState = ref<MapViewState>(INITIAL_VIEW_STATE);
const viewStateDebounced = refDebounced(viewState, 200);
const attributionHTML = ref<string>('');

const minzoom = ref<number>(0);
const maxzoom = ref<number>(20);
const fractionsDropped = ref<number[]>([]);
const tilesLoaded = ref<boolean>(false);

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

const droppingPercent = computed(() => {
  if (!fractionsDropped.value.length) {
    return 0;
  }
  const roundedZoom = Math.round(viewState.value.zoom);
  const clampedZoom = clamp(roundedZoom, minzoom.value, maxzoom.value);
  const percent = fractionsDropped.value[clampedZoom];
  return percent;
});

// Update the map view when the viewstate ref changes.
watchEffect(() => {
  const { longitude, latitude, ...rest } = viewState.value;
  map.value?.jumpTo({ center: [longitude, latitude], ...rest });
});

// Update the deck layers when the layers ref change.
watchEffect(() => {
  deck.value?.setProps({ layers: layers.value });
});

// Update the attribution HTML and zoom data when the data ref changes.
watchEffect(() => {
  data.value?.then((res) => {
    attributionHTML.value = res.attribution;
    minzoom.value = res.minzoom;
    maxzoom.value = res.maxzoom;
    if (res.fraction_dropped_per_zoom) {
      fractionsDropped.value = res.fraction_dropped_per_zoom;
    }
  });
});

watchEffect(() => {
  if (tilesLoaded.value && viewStateDebounced.value) {
    data.value?.then((res) => {
      const bbox = new WebMercatorViewport(
        viewStateDebounced.value,
      ).getBounds();
      const spatialFilter = createViewportSpatialFilter(bbox);
      if (spatialFilter) {
        res.widgetSource.extractTileFeatures({ spatialFilter });
      }
    });
  }
});

// Initialize the map and deck.
onMounted(() => {
  map.value = new Map({
    container: 'maplibre-container',
    style: BASEMAP.DARK_MATTER,
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

// Cleanup the map and deck when the component unmounts.
onUnmounted(() => {
  deck.value?.finalize();
  map.value?.remove();
});

const TICKS = Array.from({ length: 10 }, (_, i) => i + 1);
</script>
<template>
  <aside class="sidebar">
    <Card>
      <p class="overline">✨👀 You're viewing</p>
      <h1 class="title">U.S. Rivers</h1>
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
    <div v-if="tilesLoaded">
      <section
        v-if="droppingPercent > 0 && droppingPercent <= 0.05"
        style="padding: 4px 8px"
        class="caption"
      >
        <strong>Warning:</strong> There may be some data ({{
          (droppingPercent * 100).toFixed(2)
        }}%) missing at this zoom level ({{ Math.round(viewState.zoom) }})
        because of the tileset dropping features.
      </section>
      <section
        v-if="droppingPercent > 0.05"
        style="padding: 4px 8px"
        class="caption"
      >
        <strong>Warning:</strong> There is an important amount of data ({{
          (droppingPercent * 100).toFixed(2)
        }}%) missing at this zoom level ({{ Math.round(viewState.zoom) }})
        because of the tileset dropping features.
      </section>
      <Card title="Stream count">
        <FormulaWidget
          column="*"
          operation="count"
          :data="data"
          :view-state="viewStateDebounced as MapViewState"
        />
      </Card>
      <Card title="Stream by stream order">
        <HistogramWidget
          column="streamOrder"
          :data="data"
          :view-state="viewStateDebounced as MapViewState"
          :ticks="TICKS"
        />
      </Card>
    </div>
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
      <LegendEntryCategorical
        title="U.S. Rivers"
        subtitle="By stream order"
        :values="Array.from({ length: 10 }, (_, i) => (i + 1).toString())"
        :get-swatch-color="
          (value) => streamOrderToColor(Number(value)) as Color
        "
      />
    </Card>
    <!-- eslint-disable-next-line vue/no-v-html -->
    <aside class="map-footer" v-html="attributionHTML"></aside>
  </main>
</template>
