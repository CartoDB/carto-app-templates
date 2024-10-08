import { useContext, useEffect, useMemo, useState } from 'react';

import { Map } from 'react-map-gl/maplibre';
import DeckGL from '@deck.gl/react';
import { AccessorFunction, Color, MapView, MapViewState } from '@deck.gl/core';
import { colorCategories, VectorTileLayer } from '@deck.gl/carto';
import { Filter, vectorQuerySource } from '@carto/api-client';
import { Card } from '../Card';
import { Layers } from '../Layers';
import { FormulaWidget } from '../widgets/FormulaWidget';
import { CategoryWidget } from '../widgets/CategoryWidget';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import { AppContext } from '../../context';
import { LegendEntryCategorical } from '../legends/LegendEntryCategorical';

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

/**
 * Example application page, showing world-wide cell towers and a few widgets.
 */
export default function CellTowersView() {
  // With authentication enabled, access token may change.
  const { accessToken, apiBaseUrl } = useContext(AppContext);
  const [filters, setFilters] = useState({} as Record<string, Filter>);
  const [attributionHTML, setAttributionHTML] = useState('');
  // Debounce view state to avoid excessive re-renders during pan and zoom.
  const [viewState, setViewState] = useDebouncedState(INITIAL_VIEW_STATE, 200);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(() => {
    return vectorQuerySource({
      accessToken,
      apiBaseUrl,
      connectionName: 'carto_dw',
      sqlQuery:
        'SELECT * FROM `carto-demo-data.demo_tables.cell_towers_worldwide`',
      filters,
    });
  }, [accessToken, apiBaseUrl, filters]);

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({
    'Cell towers': true,
  });

  // Update layers when data or visualization parameters change.
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

  /****************************************************************************
   * Attribution
   */

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
          <FormulaWidget
            data={data}
            column={''}
            operation={'count'}
            viewState={viewState}
          />
        </Card>
        <Card title="Towers by radio">
          <CategoryWidget
            data={data}
            column={'radio'}
            operation={'count'}
            viewState={viewState}
            filters={filters}
            onFiltersChange={setFilters}
          />
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
        <Card title="Legend" className="legend">
          <LegendEntryCategorical
            title="Cell towers"
            subtitle="By Radio"
            values={RADIO_DOMAIN}
            getSwatchColor={(value: string) =>
              RADIO_COLORS({ properties: { radio: value } }, null!)
            }
          />
        </Card>
        <aside
          className="map-footer"
          dangerouslySetInnerHTML={{ __html: attributionHTML }}
        ></aside>
      </main>
    </>
  );
}
