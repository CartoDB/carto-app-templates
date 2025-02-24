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
import { FormulaWidgetComponent } from '../widgets/FormulaWidget.component';
import { LayersComponent } from '../Layers.component';
import { LegendEntryCategoricalComponent } from '../legends/LegendEntryCategorical.component';
import { context } from '../../../context';
import { AccessTokenService } from '../../services/AccessToken.service';
import { Map } from 'maplibre-gl';
import { BASEMAP, RasterTileLayer } from '@deck.gl/carto';
import {
  createViewportSpatialFilter,
  RasterMetadata,
  rasterSource,
  vectorTilesetSource,
} from '@carto/api-client';
import { debouncedSignal } from '../../../utils';
import { TreeWidgetComponent } from '../widgets/TreeWidget.component';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_raster.classification_us_compressed';

const LAYER_ID = 'U.S. cropland';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 42.728,
  longitude: -78.731,
  zoom: 6,
  minZoom: 5.5,
};

function clamp(n: number, min: number, max: number) {
  return Math.min(Math.max(n, min), max);
}

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

@Component({
  selector: 'landuse-view',
  standalone: true,
  imports: [
    CardComponent,
    CardCollapsibleComponent,
    FormulaWidgetComponent,
    TreeWidgetComponent,
    LayersComponent,
    LegendEntryCategoricalComponent,
  ],
  host: { class: 'container' },
  template: `
    <aside class="sidebar">
      <app-card>
        <p class="overline">✨👀 You're viewing</p>
        <h1 class="title">U.S. Cropland</h1>
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
        <app-card-collapsible title="Total cells">
          <formula-widget
            [data]="data()"
            [viewState]="viewStateDebounced()"
            column="*"
            operation="count"
          ></formula-widget>
        </app-card-collapsible>
        <app-card-collapsible title="Cropland categories">
          <tree-widget
            [data]="data()"
            [viewState]="viewStateDebounced()"
            column="band_1"
            [colors]="treeColors()"
          ></tree-widget>
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
      @if (attributionHTML()) {
        <aside class="map-footer" [innerHTML]="attributionHTML()"></aside>
      }
    </main>
  `,
})
export class LanduseViewComponent {
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

    return rasterSource({
      accessToken,
      apiBaseUrl: this.context.apiBaseUrl,
      connectionName: CONNECTION_NAME,
      tableName: TILESET_NAME,
    });
  });

  roundedZoom = computed(() => Math.round(this.viewStateDebounced().zoom));

  tilesLoaded = signal(false);

  rasterMetadata = signal<RasterMetadata | null>(null);

  treeColors = computed(() => {
    const rasterMetadata = this.rasterMetadata();
    return Array.from({ length: 255 }, (_, i) => {
      const rgb = getFillColorLayer(i, rasterMetadata);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
    });
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
    new RasterTileLayer({
      id: LAYER_ID,
      pickable: true,
      visible: this.layerVisibility()[LAYER_ID],
      data: this.data(),
      getFillColor: (d) => {
        const value = d.properties.band_1;
        return getFillColorLayer(value, this.rasterMetadata());
      },
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

  private rasterMetadataEffect = effect(() => {
    const data = this.data();
    if (data) {
      data.then((res) => {
        if (res.raster_metadata) {
          this.rasterMetadata.set(res.raster_metadata);
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
