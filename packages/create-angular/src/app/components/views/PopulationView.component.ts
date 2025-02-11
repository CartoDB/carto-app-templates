import {
  Component,
  ContentChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { Map } from 'maplibre-gl';
import { AccessorFunction, Deck, MapViewState, Color } from '@deck.gl/core';
import { colorContinuous, H3TileLayer } from '@deck.gl/carto';
import { h3TableSource } from '@carto/api-client';
import { CardCollapsibleComponent } from '../CardCollapsible.component';
import { debouncedSignal } from '../../../utils';
import { CardComponent } from '../Card.component';
import { LayersComponent } from '../Layers.component';
import { LegendEntryContinuousComponent } from '../legends/LegendEntryContinuous.component';
import { AccessTokenService } from '../../services/AccessToken.service';
import { context } from '../../../context';

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 31.8028,
  longitude: -103.0078,
  zoom: 2,
};

/**
 * Example application page, showing world-wide cell towers and a few widgets.
 */
@Component({
  selector: 'population-view',
  standalone: true,
  imports: [
    CardComponent,
    CardCollapsibleComponent,
    LayersComponent,
    LegendEntryContinuousComponent,
  ],
  host: { class: 'container' },
  template: `
    <aside class="sidebar">
      <app-card>
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
      </app-card>
      <span class="flex-space"></span>
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
        <legend-entry-continuous
          title="U.S. population"
          subtitle="Sum of population by H3 cell"
          [domain]="popDomain"
          [getSwatchColor]="getPopSwatchColor"
        ></legend-entry-continuous>
      </app-card-collapsible>
      @if (attributionHTML()) {
        <aside class="map-footer" [innerHTML]="attributionHTML()"></aside>
      }
    </main>
  `,
})
export class PopulationViewComponent {
  @ContentChild('maplibre-container', { static: true })
  maplibreContainer?: HTMLDivElement;
  @ContentChild('deck-canvas', { static: true }) deckCanvas?: HTMLCanvasElement;

  private context = context;

  constructor(private accessTokenService: AccessTokenService) {}

  ngOnInit() {
    this.map = new Map({
      container: 'maplibre-container',
      style: MAP_STYLE,
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

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  data = computed(() => {
    const accessToken = this.accessTokenService.accessToken();
    if (!accessToken) {
      // TODO: Prevent accessToken from being 'undefined' initially, after logging in
      // to an app with OAuth enabled.
      return new Promise(() => {}) as ReturnType<typeof h3TableSource>;
    }

    return h3TableSource({
      accessToken,
      apiBaseUrl: this.context.apiBaseUrl,
      connectionName: 'carto_dw',
      tableName:
        'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
      spatialDataColumn: 'h3',
      aggregationExp: 'SUM(population) as population_sum',
    });
  });

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  layerVisibility = signal<Record<string, boolean>>({
    'U.S. population': true,
  });

  // Update layers when data or visualization parameters change.
  layers = computed(() => [
    new H3TileLayer({
      id: 'U.S. population',
      visible: this.layerVisibility()['U.S. population'],
      data: this.data(),
      getFillColor: this.popColors,
    }),
  ]);

  /****************************************************************************
   * Legends
   */

  // TODO: Fetch domain/range from Widgets API?
  popDomain: [number, number] = [0, 100000];
  popColors: AccessorFunction<unknown, Color> = colorContinuous({
    attr: 'population_sum',
    domain: this.popDomain,
    colors: 'PinkYl',
  });
  getPopSwatchColor = (value: number) =>
    this.popColors({ properties: { population_sum: value } }, null!);

  /****************************************************************************
   * Effects (https://angular.dev/guide/signals#effects)
   */

  private viewStateEffect = effect(() => {
    const { longitude, latitude, ...rest } = this.viewState();
    this.map.jumpTo({ center: [longitude, latitude], ...rest });
  });

  private layersEffect = effect(() => {
    this.deck.setProps({ layers: this.layers() });
  });

  private attributionEffect = effect(() => {
    this.data().then(({ attribution }: { attribution: string }) =>
      this.attributionHTML.set(attribution),
    );
  });
}
