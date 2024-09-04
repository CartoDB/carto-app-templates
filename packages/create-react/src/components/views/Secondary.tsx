import { useContext, useEffect, useMemo, useState } from 'react';

import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { AccessorFunction, Color, MapView, MapViewState } from '@deck.gl/core';
import { colorContinuous, H3TileLayer } from '@deck.gl/carto';
import { h3TableSource } from '@carto/api-client';
import { Legend } from '../common/Legend';
import { Layers } from '../common/Layers';
import { Card } from '../common/Card';
import { AppContext } from '../../context';

const MAP_VIEW = new MapView({ repeat: true });
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 31.8028,
  longitude: -103.0078,
  zoom: 2,
};

// TODO: Fetch domain/range from Widgets API?
const POP_DOMAIN: [number, number] = [0, 100000];
const POP_COLORS: AccessorFunction<unknown, Color> = colorContinuous({
  attr: 'population_sum',
  domain: POP_DOMAIN,
  colors: 'PinkYl',
});

export default function Default() {
  const { accessToken, apiBaseUrl } = useContext(AppContext);
  const [attributionHTML, setAttributionHTML] = useState('');
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(() => {
    return h3TableSource({
      accessToken,
      apiBaseUrl,
      connectionName: 'carto_dw',
      tableName:
        'carto-demo-data.demo_tables.derived_spatialfeatures_usa_h3res8_v1_yearly_v2',
      spatialDataColumn: 'h3',
      aggregationExp: 'SUM(population) as population_sum',
    });
  }, [accessToken, apiBaseUrl]);

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
      new H3TileLayer({
        id: 'U.S. population',
        visible: layerVisibility['U.S. population'],
        data,
        getFillColor: POP_COLORS,
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
        <Legend
          entries={[
            // TODO: Cleaner way to generate a legend?
            {
              type: 'continuous',
              title: 'U.S. population',
              subtitle: 'Sum of population by H3 cell',
              domain: POP_DOMAIN,
              getSwatchColor: (value) =>
                POP_COLORS({ properties: { population_sum: value } }, null!),
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
