import { useEffect, useMemo, useState } from 'react';

import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { AccessorFunction, Color, MapView, MapViewState } from '@deck.gl/core';
import { colorCategories, VectorTileLayer } from '@deck.gl/carto';
import { vectorQuerySource } from '@carto/api-client';
import { Legend } from '../common/Legend';
import { Card } from '../common/Card';
import { Layers } from '../common/Layers';

const MAP_VIEW = new MapView({ repeat: true });
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

export default function Default() {
  const [attributionHTML, setAttributionHTML] = useState('');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(() => {
    return vectorQuerySource({
      accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
      connectionName: 'carto_dw',
      sqlQuery:
        'SELECT * FROM `carto-demo-data.demo_tables.cell_towers_worldwide`',
    });
  }, []);

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({
    'Cell towers': true,
  });

  const layers = useMemo(() => {
    return [
      new VectorTileLayer({
        id: 'Cell towers',
        visible: layerVisibility['Cell towers'],
        data,
        pointRadiusMinPixels: 4,
        getFillColor: RADIO_COLORS,
      }),
    ];
  }, [data, layerVisibility]);

  useEffect(() => {
    data?.then(({ attribution }) => setAttributionHTML(attribution));
  }, [data]);

  return (
    <>
      <aside className="sidebar">
        <Card>
          <p className="overline">✨👀 You're viewing</p>
          <h1 className="title">Cell towers</h1>
          <p className="body1">
            Cheesecake caramels sesame snaps gummi bears oat cake chupa chups.
            Chupa chups sugar plum tootsie roll powder candy canes. Biscuit cake
            gummies cheesecake cupcake biscuit bear claw icing. Jelly topping
            caramels gummi bears carrot cake pudding.
          </p>
          <p className="body1">
            Bear claw marshmallow gingerbread muffin sweet roll bear claw ice
            cream cake macaroon. Lollipop brownie ice cream pudding sweet gummi
            bears jelly jelly-o tart.
          </p>
        </Card>
        <span className="flex-space" />
        <Card title="Tower count">
          <div className="skeleton" style={{ height: '8em' }} />
        </Card>
        <Card title="Towers by radio">
          <div className="skeleton" style={{ height: '6em' }} />
        </Card>
      </aside>
      <main className="map">
        <DeckGL
          layers={layers}
          views={MAP_VIEW}
          initialViewState={viewState}
          controller={{ dragRotate: false }}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
        >
          <Map mapStyle={MAP_STYLE} />
        </DeckGL>
        <Layers
          layers={layers}
          layerVisibility={layerVisibility}
          onLayerVisibilityChange={setLayerVisibility}
        />
        <Legend
          entries={[
            // TODO: Cleaner way to generate a legend?
            {
              title: 'Cell towers',
              subtitle: 'By Radio',
              values: RADIO_DOMAIN,
              getSwatchColor: (value: string) =>
                RADIO_COLORS({ properties: { radio: value } }, null!),
            },
          ]}
        />
        <aside
          className="map-footer"
          dangerouslySetInnerHTML={{ __html: attributionHTML }}
        ></aside>
      </main>
    </>
  );
}