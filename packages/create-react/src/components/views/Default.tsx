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
        <div className="skeleton" style={{ height: '8em' }} />
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
