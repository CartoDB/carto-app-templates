import {
  Component,
  ContentChild,
  computed,
  effect,
  signal,
} from '@angular/core';
import { Map } from 'maplibre-gl';
import {
  AccessorFunction,
  Deck,
  MapViewState,
  Color,
  Layer,
} from '@deck.gl/core';
import { colorCategories, VectorTileLayer } from '@deck.gl/carto';
import { vectorQuerySource, Filter } from '@carto/api-client';
import { CardCollapsibleComponent } from '../CardCollapsible.component';
import { AppContextService } from '../../services/app-context.service';
import { debouncedSignal } from '../../../utils';
import { CardComponent } from '../Card.component';
import { LayersComponent } from '../Layers.component';
import { LegendEntryCategoricalComponent } from '../legends/LegendEntryCategorical.component';
import { FormulaWidgetComponent } from '../widgets/FormulaWidget.component';
import { CategoryWidgetComponent } from '../widgets/CategoryWidget.component';

const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 37.0902,
  longitude: -95.7129,
  zoom: 3.5,
};

/**
 * Example application page, showing world-wide cell towers and a few widgets.
 */
@Component({
  selector: 'cell-towers-view',
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
        <h1 class="title">Cell towers</h1>
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
      <app-card-collapsible title="Tower count">
        <formula-widget
          [data]="data()"
          [viewState]="viewStateDebounced()"
        ></formula-widget>
      </app-card-collapsible>
      <app-card-collapsible title="Towers by radio">
        <category-widget
          [data]="data()"
          column="radio"
          operation="count"
          [viewState]="viewStateDebounced()"
          [filters]="filters()"
          (onFiltersChange)="filters.set($event)"
        ></category-widget>
      </app-card-collapsible>
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
          title="Cell towers"
          subtitle="By Radio"
          [values]="radioDomain"
          [getSwatchColor]="getRadioSwatchColor"
        ></legend-entry-categorical>
      </app-card-collapsible>
      @if (attributionHTML()) {
        <aside class="map-footer" [innerHTML]="attributionHTML()"></aside>
      }
    </main>
  `,
})
export class CellTowersViewComponent {
  @ContentChild('maplibre-container', { static: true })
  maplibreContainer?: HTMLDivElement;
  @ContentChild('deck-canvas', { static: true }) deckCanvas?: HTMLCanvasElement;

  private context: AppContextService;

  constructor(context: AppContextService) {
    this.context = context;
  }

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

  filters = signal<Record<string, Filter>>({});

  data = computed(() =>
    vectorQuerySource({
      accessToken: this.context.accessToken,
      apiBaseUrl: this.context.apiBaseUrl,
      connectionName: 'carto_dw',
      sqlQuery:
        'SELECT * FROM `carto-demo-data.demo_tables.cell_towers_worldwide`',
      filters: this.filters(),
    }),
  );

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  layerVisibility = signal<Record<string, boolean>>({
    'Cell towers': true,
  });

  // Update layers when data or visualization parameters change.
  layers = computed(() => [
    new VectorTileLayer({
      id: 'Cell towers',
      visible: this.layerVisibility()['Cell towers'],
      data: this.data(),
      pointRadiusMinPixels: 4,
      getFillColor: this.radioColors,
    }),
  ]);

  /****************************************************************************
   * Legends
   */

  // TODO: Fetch categories from Widgets API?
  radioDomain = ['LTE', 'UMTS', 'CDMA', 'GSM', 'NR'];
  radioColors: AccessorFunction<unknown, Color> = colorCategories({
    attr: 'radio',
    domain: this.radioDomain,
    colors: 'Bold',
  });
  getRadioSwatchColor = (value: string) =>
    this.radioColors({ properties: { radio: value } }, null!);

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
