import { Component, ContentChild } from '@angular/core';
import { Map } from 'maplibre-gl';
import { AccessorFunction, Deck, MapViewState, Color } from '@deck.gl/core';
import { colorCategories, VectorTileLayer } from '@deck.gl/carto';
import { vectorQuerySource, Filter } from '@carto/api-client';
import { CardComponent } from '../card.component';
import { LayersComponent } from '../layers.component';
import { CardCollapsibleComponent } from '../card-collapsible.component';

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

/**
 * Example application page, showing world-wide cell towers and a few widgets.
 */
@Component({
  selector: 'app-cell-towers-view',
  standalone: true,
  imports: [CardComponent, CardCollapsibleComponent, LayersComponent],
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
      <app-card-collapsible title="Tower count">widget</app-card-collapsible>
      <app-card-collapsible title="Towers by radio"
        >widget</app-card-collapsible
      >
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
      <app-layers></app-layers>
      <app-card-collapsible title="Legend" class="legend"
        >todo: legend</app-card-collapsible
      >
      <aside class="map-footer">footer aside TODO</aside>
    </main>
  `,
})
export class CellTowersViewComponent {
  @ContentChild('maplibre-container', { static: true })
  maplibreContainer?: HTMLDivElement;
  @ContentChild('deck-canvas', { static: true }) deckCanvas?: HTMLCanvasElement;

  private map: Map = null!;
  private deck: Deck = null!;

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
      // onViewStateChange: ({ viewState: _viewState }) => {
      //   viewState.value = _viewState;
      // },
    });
  }
}
