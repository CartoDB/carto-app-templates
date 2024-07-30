import { useEffect, useMemo, useState } from 'react';

import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { MapView, MapViewState } from '@deck.gl/core';
import { VectorTileLayer } from '@deck.gl/carto';
import { vectorTableSource } from '@carto/api-client';
import { Legend } from '../common/Legend';
import { Layers } from '../common/Layers';
import { Card } from '../common/Card';

const MAP_VIEW = new MapView({ repeat: true });
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 31.8028,
  longitude: -103.0078,
  zoom: 2,
};

export default function Default() {
  const [attributionHTML, setAttributionHTML] = useState('');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(() => {
    return vectorTableSource({
      accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
      connectionName: 'carto_dw',
      tableName: 'carto-demo-data.demo_tables.retail_stores',
    });
  }, []);

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({
    'U.S. population': true,
  });

  const layers = useMemo(() => {
    return [
      new VectorTileLayer({
        id: 'U.S. population',
        visible: layerVisibility['U.S. population'],
        data,
        pointRadiusMinPixels: 4,
        getFillColor: [200, 0, 80],
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
          <h1 className="title">U.S. population</h1>
          <p className="body1">
            Chupa chups chocolate cupcake cake soufflé. Wafer carrot cake danish
            gummi bears jelly. Sugar plum wafer cake chocolate bar caramels
            sesame snaps fruitcake tiramisu.
          </p>
          <p className="body1">
            Chocolate cake pastry pie apple pie oat cake dessert macaroon.
            Pastry sugar plum pie carrot cake biscuit. Bear claw sugar plum
            topping cake danish cotton candy pudding.
          </p>
        </Card>
        <span className="flex-space" />
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
        <Legend />
        <aside
          className="map-footer"
          dangerouslySetInnerHTML={{ __html: attributionHTML }}
        ></aside>
      </main>
    </>
  );
}
