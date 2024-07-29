import { useEffect, useMemo, useState } from 'react';

import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { MapView, MapViewState } from '@deck.gl/core';
import { VectorTileLayer } from '@deck.gl/carto';
import { vectorTableSource } from '@carto/api-client';

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

  const layers = useMemo(() => {
    return [
      new VectorTileLayer({
        id: 'retail_stores',
        data,
        pointRadiusMinPixels: 4,
        getFillColor: [200, 0, 80],
      }),
    ];
  }, [data]);

  useEffect(() => {
    data?.then(({ attribution }) => setAttributionHTML(attribution));
  }, [data]);

  return (
    <>
      <aside className="sidebar">
        <h1 className="title">U.S. population</h1>
        <p className="body1">
          Chupa chups chocolate cupcake cake soufflé. Wafer carrot cake danish
          gummi bears jelly. Sugar plum wafer cake chocolate bar caramels sesame
          snaps fruitcake tiramisu.
        </p>
        <div className="skeleton" style={{ height: '8em' }} />
        <p className="body1">
          Chocolate cake pastry pie apple pie oat cake dessert macaroon. Pastry
          sugar plum pie carrot cake biscuit. Bear claw sugar plum topping cake
          danish cotton candy pudding.
        </p>
        <div className="skeleton" style={{ height: '4em' }} />
        <div className="skeleton" style={{ height: '6em' }} />
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
          <footer
            className="map-footer"
            dangerouslySetInnerHTML={{ __html: attributionHTML }}
          ></footer>
        </DeckGL>
      </main>
    </>
  );
}
