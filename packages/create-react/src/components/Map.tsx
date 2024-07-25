import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../context";

import {Map as Basemap} from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { MapView } from "@deck.gl/core";
import { VectorTileLayer } from '@deck.gl/carto';
import { vectorTableSource } from '@carto/api-client';

const MAP_VIEW = new MapView({repeat: true});
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

export function Map() {
  const context = useContext(AppContext)
  const [attributionHTML, setAttributionHTML] = useState('');
  // const [viewState, setViewState] = useState({...context.viewState});

  // Update sources.
  const data = useMemo(() => {
    return vectorTableSource({
      accessToken: import.meta.env.VITE_CARTO_ACCESS_TOKEN,
      connectionName: 'carto_dw',
      tableName: 'carto-demo-data.demo_tables.retail_stores',
    });
  }, []);

  // Update layers.
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
    data?.then(({attribution}) => setAttributionHTML(attribution));
  }, [data]);

  return <DeckGL
    layers={layers}
    views={MAP_VIEW}
    initialViewState={context.viewState}
    controller={{dragRotate: false}}
    // onViewStateChange={({viewState}) => setViewState(viewState)}
  >
    <Basemap reuseMaps mapStyle={MAP_STYLE} />
    <footer
      className="map-footer"
      dangerouslySetInnerHTML={{__html: attributionHTML}}
    ></footer>
  </DeckGL>
}
