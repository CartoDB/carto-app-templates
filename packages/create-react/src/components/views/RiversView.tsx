import {
  Color,
  MapView,
  MapViewState,
  WebMercatorViewport,
} from '@deck.gl/core';
import { useContext, useEffect, useMemo, useState } from 'react';
import { AppContext } from '../../context';
import { useDebouncedState } from '../../hooks/useDebouncedState';
import {
  createViewportSpatialFilter,
  vectorTilesetSource,
} from '@carto/api-client';
import { BASEMAP, VectorTileLayer } from '@deck.gl/carto';
import { Card } from '../Card';
import { FormulaWidget } from '../widgets/FormulaWidget';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { Layers } from '../Layers';
import { HistogramWidget } from '../widgets/HistogramWidget';
import { LegendEntryCategorical } from '../legends/LegendEntryCategorical';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_opensource_demo.national_water_model_tileset_final_test_4';
const MAP_VIEW = new MapView({ repeat: true });

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 30.5,
  longitude: -90.1,
  zoom: 6,
};

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

const colors = [
  '#08589e',
  '#2b8cbe',
  '#4eb3d3',
  '#7bccc4',
  '#a8ddb5',
  '#ccebc5',
  '#e0f3db',
  '#f7fcf0'
].map(hex => hexToRgb(hex));

function streamOrderToColor(n: number, colors: number[][]) {
  // const [r, g, b] = hexToRgb('#d5d5d7');
  // const alphaPart = Math.min(n / 10, 1);
  // const alpha = 120 + 128 * alphaPart;
  // return [r, g, b, alpha];
  const rgb = colors[Math.min(n - 1, 7)];
  const alpha = Math.min(50 + n * 20, 255); // Gradually increases opacity with stream order
  return new Uint8Array([...rgb, alpha]);
}

/**
 * MINIMUM STREAM ORDER
 * Our tileset was generated in a way that it drops water streams of low orders at low zoom levels.
 * Let's add logic in our app to handle this.
 */
function getMinStreamOrder(zoomLevel: number) {
  if (zoomLevel < 5.5) {
    return 4; // at zoom 5.5, this tileset only uses streams of order 4 and above
  } else if (zoomLevel < 6.5) {
    return 3; // at zoom 6.5, this tileset only uses streams of order 3 and above
  } else if (zoomLevel < 7.5) {
    return 2; // at zoom 7.5, this tileset only uses streams of order 2 and above
  } else {
    return 1; // at zoom 10, we show all streams
  }
}

const MAX_STREAM_ORDER = 10;

/**
 * Example application page, showing U.S. streams network.
 */
export default function IncomeView() {
  // With authentication enabled, access token may change.
  const { accessToken, apiBaseUrl } = useContext(AppContext);
  const [attributionHTML, setAttributionHTML] = useState('');

  // data to calculate feature dropping for each zoom level
  const [fractionsDropped, setFractionsDropped] = useState<number[]>([]);
  const [minZoom, setMinZoom] = useState(0);
  const [maxZoom, setMaxZoom] = useState(20);
  const [tilesLoaded, setTilesLoaded] = useState(false);

  // Debounce view state to avoid excessive re-renders during pan and zoom.
  const [viewState, setViewState] = useDebouncedState(INITIAL_VIEW_STATE, 200);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(
    () =>
      vectorTilesetSource({
        accessToken,
        apiBaseUrl,
        connectionName: CONNECTION_NAME,
        tableName: TILESET_NAME,
      }),
    [accessToken, apiBaseUrl],
  );

  const minStreamOrder = useMemo(() => getMinStreamOrder(viewState.zoom), [viewState.zoom]);

  const histogramTicks = useMemo(() => {
    const ticks = [];
    for (let i = minStreamOrder; i <= MAX_STREAM_ORDER; i++) {
      ticks.push(i);
    }
    return ticks;
  }, [minStreamOrder]);

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  const LAYER_ID = 'Income by block group';

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({
    [LAYER_ID]: true,
  });

  // Update layers when data or visualization parameters change.
  const layers = useMemo(() => {
    return [
      new VectorTileLayer({
        id: LAYER_ID,
        pickable: true,
        visible: layerVisibility[LAYER_ID],
        data,
        getLineColor: (d) => {
          return streamOrderToColor(d.properties.streamOrder, colors) as Color;
        },
        getLineWidth: (d) => {
          return Math.pow(d.properties.streamOrder, 2);
        },
        lineWidthScale: 20,
        lineWidthUnits: 'meters',
        lineWidthMinPixels: 1,
        onViewportLoad(tiles) {
          data?.then((res) => {
            setTilesLoaded(true);
            res.widgetSource.loadTiles(tiles);
            setViewState({ ...viewState });
          });
        },
      }),
    ];
  }, [data, viewState, setViewState, layerVisibility]);

  /****************************************************************************
   * Attribution
   */

  useEffect(() => {
    data?.then((res) => {
      const { fraction_dropped_per_zoom, minzoom, maxzoom, attribution } = res;
      setFractionsDropped(fraction_dropped_per_zoom ?? []);
      setMinZoom(minzoom ?? 0);
      setMaxZoom(maxzoom ?? 20);
      setAttributionHTML(attribution);
    });
  }, [data]);

  useEffect(() => {
    if (data && viewState && tilesLoaded) {
      data?.then((res) => {
        const bbox = new WebMercatorViewport(viewState).getBounds();
        const spatialFilter = createViewportSpatialFilter(bbox);
        if (spatialFilter) {
          res.widgetSource.extractTileFeatures({ spatialFilter });
        }
      });
    }
  }, [data, viewState, tilesLoaded]);

  function clamp(n: number, min: number, max: number) {
    return Math.min(Math.max(n, min), max);
  }

  const droppingPercent = useMemo(() => {
    if (!fractionsDropped.length) {
      return 0;
    }
    const roundedZoom = Math.round(viewState.zoom);
    const clampedZoom = clamp(roundedZoom, minZoom, maxZoom);
    const percent = fractionsDropped[clampedZoom];
    return percent;
  }, [minZoom, maxZoom, fractionsDropped, viewState.zoom]);

  return (
    <>
      <aside className="sidebar">
        <Card>
          <p className="overline">✨👀 You're viewing</p>
          <h1 className="title">U.S. Streams Network</h1>
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
        {tilesLoaded && (
          <>
            <section className='small' style={{ padding: '4px 8px' }}>
              At this zoom level, this tileset only shows streams of order {'> '}
              <code id="min-stream-order">{minStreamOrder}</code> and above.
            </section>
            {droppingPercent > 0 && droppingPercent <= 0.05 && (
              <section className="caption" style={{ padding: '4px 8px' }}>
                <strong>Warning:</strong> There may be some data (
                {(droppingPercent * 100).toFixed(2)}%) missing at this zoom
                level ({Math.round(viewState.zoom)}) because of the tileset
                dropping features.
              </section>
            )}
            {droppingPercent > 0.05 && (
              <section className="caption" style={{ padding: '4px 8px' }}>
                <strong>Warning:</strong> There is an important amount of data (
                {(droppingPercent * 100).toFixed(2)}%) missing at this zoom
                level ({Math.round(viewState.zoom)}) because of the tileset
                dropping features. Widget calculations will not be accurate.
              </section>
            )}
            <Card title="Stream count">
              <FormulaWidget
                data={data}
                column={'*'}
                operation={'count'}
                viewState={viewState}
              />
            </Card>
            <Card title="Stream count by stream order">
              <HistogramWidget
                data={data}
                column="streamOrder"
                ticks={histogramTicks}
                min={minStreamOrder}
                viewState={viewState}
                operation="count"
              />
            </Card>
          </>
        )}
      </aside>
      <main className="map">
        <DeckGL
          layers={layers}
          views={MAP_VIEW}
          initialViewState={viewState}
          controller={{ dragRotate: false }}
          onViewStateChange={({ viewState }) => setViewState(viewState)}
        >
          <Map mapStyle={BASEMAP.DARK_MATTER} />
        </DeckGL>
        <Layers
          layers={layers}
          layerVisibility={layerVisibility}
          onLayerVisibilityChange={setLayerVisibility}
        />
        <Card title="Legend" className="legend">
          <LegendEntryCategorical
            title="U.S. Rivers"
            subtitle="By stream order"
            values={Array.from({ length: 10 }, (_, i) => (i + 1).toString())}
            getSwatchColor={(value) =>
              streamOrderToColor(Number(value), colors) as Color
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
