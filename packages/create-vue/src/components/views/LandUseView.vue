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
import { Deck, MapViewState, Color } from '@deck.gl/core';
import { BASEMAP, RasterTileLayer } from '@deck.gl/carto';
import {
  rasterSource,
  RasterMetadata,
Filters,
getDataFilterExtensionProps,
} from '@carto/api-client';
import Layers from '../Layers.vue';
import Card from '../Card.vue';
import { context } from '../../context';
import FormulaWidget from '../widgets/FormulaWidget.vue';
import TreeWidget from '../widgets/TreeWidget.vue';
import { refDebounced } from '@vueuse/core';
import { DataFilterExtension } from '@deck.gl/extensions';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_raster.classification_us_compressed';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 42.728,
  longitude: -78.731,
  zoom: 6,
  minZoom: 5.5,
};

const getFillColorLayer = (
  bandColor: number,
  rasterMetadata: RasterMetadata | null,
) => {
  if (rasterMetadata) {
    const meta = rasterMetadata.bands[0];
    if (meta.colorinterp === 'palette') {
      const category = meta.colortable?.[bandColor];
      if (category) {
        const [r, g, b] = category;
        if (r === 0 && g === 0 && b === 0) {
          return [0, 0, 0, 0] as Color;
        }

        return category as Color;
      }
    }
  }
  return [0, 0, 0, 0] as Color;
};

const rasterMetadata = ref<RasterMetadata | null>(null);

/****************************************************************************
 * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
 */

const data = computed(() =>
  rasterSource({
    accessToken: context.accessToken,
    apiBaseUrl: context.apiBaseUrl,
    connectionName: CONNECTION_NAME,
    tableName: TILESET_NAME,
  }),
);

/****************************************************************************
 * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
 */

const LAYER_ID = 'U.S. cropland';

// Layer visibility represented as name/visibility pairs, managed by the Layers component.
const layerVisibility = ref<Record<string, boolean>>({
  [LAYER_ID]: true,
});

// Update layers when data or visualization parameters change.
const layers = computed(() => [
  new RasterTileLayer({
    id: LAYER_ID,
    pickable: true,
    visible: layerVisibility.value[LAYER_ID],
    data: data.value,
    getFillColor: (d) => {
      const value = d.properties.band_1;
      return getFillColorLayer(value, rasterMetadata.value);
    },
    onViewportLoad(tiles) {
      data.value?.then((res) => {
        tilesLoaded.value = true;
        res.widgetSource.loadTiles(tiles);
        viewState.value = { ...viewState.value };
      });
    },
    extensions: [new DataFilterExtension({ filterSize: 4 })],
    ...getDataFilterExtensionProps(filters.value),
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
const filters = ref<Filters>({});

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
  const roundedZoom = Math.round(viewStateDebounced.value.zoom);
  const clampedZoom = clamp(roundedZoom, minzoom.value, maxzoom.value);
  const percent = fractionsDropped.value[clampedZoom];
  return percent;
});

const treeColors = computed(() => {
  const raster = rasterMetadata.value;
  if (!raster) {
    return [];
  }

  const colors = Array.from({ length: 255 }, (_, i) => {
    const rgb = getFillColorLayer(i, raster);
    return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
  });

  return colors;
});

function onFiltersChange(newFilters: Filters) {
  filters.value = newFilters;
}

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
    if (res.raster_metadata) {
      rasterMetadata.value = res.raster_metadata;
    }
  });
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
</script>
<template>
  <aside class="sidebar">
    <Card>
      <p class="overline">✨👀 You're viewing</p>
      <h1 class="title">U.S. Cropland</h1>
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
      <Card title="Total cells">
        <FormulaWidget
          column="*"
          operation="count"
          :data="data"
          :view-state="viewStateDebounced as MapViewState"
          :filters="filters"
        />
      </Card>
      <Card title="Cropland categories">
        <TreeWidget
          :data="data"
          column="band_1"
          :view-state="viewStateDebounced as MapViewState"
          :colors="treeColors"
          :filters="filters"
          @filters-change="onFiltersChange"
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
    <!-- eslint-disable-next-line vue/no-v-html -->
    <aside class="map-footer" v-html="attributionHTML"></aside>
  </main>
</template>
