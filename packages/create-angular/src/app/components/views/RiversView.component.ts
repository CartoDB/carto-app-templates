import {
  Component,
  computed,
  ContentChild,
  effect,
  signal,
} from '@angular/core';
import { Color, Deck, MapViewState, WebMercatorViewport } from '@deck.gl/core';
import { CardComponent } from '../Card.component';
import { CardCollapsibleComponent } from '../CardCollapsible.component';
import { CategoryWidgetComponent } from '../widgets/CategoryWidget.component';
import { FormulaWidgetComponent } from '../widgets/FormulaWidget.component';
import { LayersComponent } from '../Layers.component';
import { LegendEntryCategoricalComponent } from '../legends/LegendEntryCategorical.component';
import { context } from '../../../context';
import { AccessTokenService } from '../../services/AccessToken.service';
import { Map } from 'maplibre-gl';
import { BASEMAP, VectorTileLayer } from '@deck.gl/carto';
import {
  createViewportSpatialFilter,
  vectorTilesetSource,
} from '@carto/api-client';
import { debouncedSignal } from '../../../utils';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_opensource_demo.national_water_model_tileset_final_test_4';

const LAYER_ID = 'U.S. rivers';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 30.5,
  longitude: -90.1,
  zoom: 6,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const colors = [
  '#08589e',
  '#2b8cbe',
  '#4eb3d3',
  '#7bccc4',
  '#a8ddb5',
  '#ccebc5',
  '#e0f3db',
  '#f7fcf0',
].map((hex) => hexToRgb(hex));

function streamOrderToColor(n: number, colors: number[][]) {
  const rgb = colors[Math.min(n - 1, 7)];
  const alpha = Math.min(50 + n * 20, 255); // Gradually increases opacity with stream order
  return new Uint8Array([...rgb, alpha]);
}

/**
 * MINIMUM STREAM ORDER
 * Our tileset was generated in a way that it drops water streams of low orders at low zoom levels.
 * Let's add logic in our app to handle this.
 */
function getMinStreamOrder(zoomLevel: number) {
  if (zoomLevel < 5.5) {
    return 4; // at zoom 5.5, this tileset only uses streams of order 4 and above
  } else if (zoomLevel < 6.5) {
    return 3; // at zoom 6.5, this tileset only uses streams of order 3 and above
  } else if (zoomLevel < 7.5) {
    return 2; // at zoom 7.5, this tileset only uses streams of order 2 and above
  } else {
    return 1; // at zoom 10, we show all streams
  }
}

const MAX_STREAM_ORDER = 10;

@Component({
  selector: 'rivers-view',
  standalone: true,
  imports: [
    CardComponent,
    CardCollapsibleComponent,
    CategoryWidgetComponent,
    FormulaWidgetComponent,
    LayersComponent,
    LegendEntryCategoricalComponent,
  ],
  host: { class: 'container' },
  template: `
    <aside class="sidebar">
      <app-card>
        <p class="overline">✨👀 You're viewing</p>
        <h1 class="title">U.S. Rivers</h1>
        <p class="body1">
          Cheesecake caramels sesame snaps gummi bears oat cake chupa chups.
          Chupa chups sugar plum tootsie roll powder candy canes. Biscuit cake
          gummies cheesecake cupcake biscuit bear claw icing. Jelly topping
          caramels gummi bears carrot cake pudding.
        </p>
        <p class="body1">
          Bear claw marshmallow gingerbread muffin sweet roll bear claw ice
          cream cake macaroon. Lollipop brownie ice cream pudding sweet gummi
          bears jelly jelly-o tart.
        </p>
      </app-card>
      <span class="flex-space"></span>
      @if (tilesLoaded()) {
        <section class="small" style="padding: 4px 8px">
          At this zoom level, this tileset only shows streams of order >
          <code id="min-stream-order">{{ minStreamOrder() }}</code> and above.
        </section>
        @if (droppingPercent() > 0 && droppingPercent() <= 0.05) {
          <section style="padding: 4px 8px" class="caption">
            <strong>Warning:</strong> There may be some data ({{
              (droppingPercent() * 100).toFixed(2)
            }}%) missing at this zoom level ({{ roundedZoom() }}) because of the
            tileset dropping features.
          </section>
        }
        @if (droppingPercent() > 0.05) {
          <section style="padding: 4px 8px" class="caption">
            <strong>Warning:</strong> There is an important amount of data ({{
              (droppingPercent() * 100).toFixed(2)
            }}%) missing at this zoom level ({{ roundedZoom() }}) because of the
            tileset dropping features.
          </section>
        }
        <app-card-collapsible title="Stream count">
          <formula-widget
            [data]="data()"
            [viewState]="viewStateDebounced()"
            column="*"
            operation="count"
          ></formula-widget>
        </app-card-collapsible>
      }
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
      <app-layers
        [layers]="layers()"
        [layerVisibility]="layerVisibility()"
        (layerVisibilityChanged)="layerVisibility.set($event)"
      ></app-layers>
      <app-card-collapsible title="Legend" class="legend">
        <legend-entry-categorical
          title="U.S. Rivers"
          subtitle="By stream order"
          [values]="legendValues()"
          [getSwatchColor]="getSwatchColor"
        ></legend-entry-categorical>
      </app-card-collapsible>
      @if (attributionHTML()) {
        <aside class="map-footer" [innerHTML]="attributionHTML()"></aside>
      }
    </main>
  `,
})
export class RiversViewComponent {
  @ContentChild('maplibre-container', { static: true })
  maplibreContainer?: HTMLDivElement;
  @ContentChild('deck-canvas', { static: true }) deckCanvas?: HTMLCanvasElement;

  private context = context;

  constructor(private accessTokenService: AccessTokenService) {}

  ngOnInit() {
    this.map = new Map({
      container: 'maplibre-container',
      style: BASEMAP.DARK_MATTER,
      interactive: false,
    });

    this.deck = new Deck({
      canvas: 'deck-canvas',
      initialViewState: INITIAL_VIEW_STATE,
      controller: true,
      layers: [],
      onViewStateChange: ({ viewState }) => {
        this.viewState.set(viewState);
      },
    });
  }

  /****************************************************************************
   * DeckGL
   */

  private map: Map = null!;
  private deck: Deck = null!;

  private viewState = signal(INITIAL_VIEW_STATE);
  // Debounce view state to avoid excessive re-renders during pan and zoom.
  viewStateDebounced = debouncedSignal(this.viewState, 200);

  attributionHTML = signal('');
  droppingPercent = signal(0);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  data = computed(() => {
    const accessToken = this.accessTokenService.accessToken();
    if (!accessToken) {
      // TODO: Prevent accessToken from being 'undefined' initially, after logging in
      // to an app with OAuth enabled.
      return new Promise(() => {}) as ReturnType<typeof vectorTilesetSource>;
    }

    return vectorTilesetSource({
      accessToken,
      apiBaseUrl: this.context.apiBaseUrl,
      connectionName: CONNECTION_NAME,
      tableName: TILESET_NAME,
    });
  });

  roundedZoom = computed(() => Math.round(this.viewStateDebounced().zoom));

  tilesLoaded = signal(false);

  minStreamOrder = computed(() => getMinStreamOrder(this.viewState().zoom));

  histogramTicks = computed(() => {
    const ticks = [];
    for (let i = 0; i <= MAX_STREAM_ORDER; i++) {
      ticks.push(i);
    }
    return ticks;
  });

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  layerVisibility = signal<Record<string, boolean>>({
    [LAYER_ID]: true,
  });

  // Update layers when data or visualization parameters change.
  layers = computed(() => [
    new VectorTileLayer({
      id: LAYER_ID,
      pickable: true,
      visible: this.layerVisibility()[LAYER_ID],
      data: this.data(),
      getLineColor: (d) => {
        return streamOrderToColor(d.properties.streamOrder, colors) as Color;
      },
      getLineWidth: (d) => {
        return Math.pow(d.properties.streamOrder, 2);
      },
      lineWidthScale: 20,
      lineWidthUnits: 'meters',
      lineWidthMinPixels: 1,
      onViewportLoad: (tiles) => {
        const data = this.data();
        if (data) {
          data.then((res) => {
            this.tilesLoaded.set(true);
            res.widgetSource.loadTiles(tiles);
            this.viewState.set({ ...this.viewState() });
          });
        }
      },
    }),
  ]);

  /****************************************************************************
   * Legends
   */

  legendValues = computed(() => {
    return Array.from({ length: 10 }, (_, i) => (i + 1).toString());
  });

  getSwatchColor = (value: string) => {
    return streamOrderToColor(Number(value), colors) as Color;
  };

  /****************************************************************************
   * Effects (https://angular.dev/guide/signals#effects)
   */

  // Update the map view when the viewstate ref changes.
  private viewStateEffect = effect(() => {
    const { longitude, latitude, ...rest } = this.viewState();
    this.map.jumpTo({ center: [longitude, latitude], ...rest });
  });

  // Update the deck layers when the layers ref change.
  private layersEffect = effect(() => {
    this.deck.setProps({ layers: this.layers() });
  });

  // Update the attribution HTML and zoom data when the data ref changes.
  private attributionEffect = effect(() => {
    this.data().then(({ attribution }: { attribution: string }) =>
      this.attributionHTML.set(attribution),
    );
  });

  private extractEffect = effect(() => {
    const data = this.data();
    if (this.tilesLoaded() && this.viewStateDebounced()) {
      data.then((res) => {
        const bbox = new WebMercatorViewport(
          this.viewStateDebounced(),
        ).getBounds();
        const spatialFilter = createViewportSpatialFilter(bbox);
        if (spatialFilter) {
          res.widgetSource.extractTileFeatures({ spatialFilter });
        }
      });
    }
  });

  private droppingPercentEffect = effect(() => {
    const data = this.data();
    const zoom = this.roundedZoom();
    if (this.tilesLoaded()) {
      data.then((res) => {
        const fractionsDropped = res.fraction_dropped_per_zoom;
        if (fractionsDropped) {
          const minzoom = res.minzoom;
          const maxzoom = res.maxzoom;

          const clampedZoom = clamp(zoom, minzoom, maxzoom);
          const percent = fractionsDropped[clampedZoom];

          this.droppingPercent.set(percent);
        }
      });
    }
  });
}
