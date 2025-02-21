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
  RasterMetadata,
  rasterSource,
} from '@carto/api-client';
import { BASEMAP, RasterTileLayer } from '@deck.gl/carto';
import { Card } from '../Card';
import { FormulaWidget } from '../widgets/FormulaWidget';
import DeckGL from '@deck.gl/react';
import { Map } from 'react-map-gl/maplibre';
import { Layers } from '../Layers';
import TreeWidget from '../widgets/TreeWidget';

const CONNECTION_NAME = 'amanzanares-pm-bq';
const TILESET_NAME =
  'cartodb-on-gcp-pm-team.amanzanares_raster.classification_us_compressed';
const MAP_VIEW = new MapView({ repeat: true });

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 42.728,
  longitude: -78.731,
  zoom: 6,
  minZoom: 5.5,
};

const getFillColorLayer = (
  bandColor: number,
  rasterMetadata: RasterMetadata | null,
) => {
  if (rasterMetadata) {
    const meta = rasterMetadata.bands[0];
    if (meta.colorinterp === 'palette') {
      const category = meta.colortable?.[bandColor];
      if (category) {
        const [r, g, b] = category;
        if (r === 0 && g === 0 && b === 0) {
          return [0, 0, 0, 0] as Color;
        }

        return category as Color;
      }
    }
  }
  return [0, 0, 0, 0] as Color;
};

/**
 * Example application page, showing U.S. Cropland data.
 */
export default function LandUseView() {
  // With authentication enabled, access token may change.
  const { accessToken, apiBaseUrl } = useContext(AppContext);
  const [attributionHTML, setAttributionHTML] = useState('');

  // data to calculate feature dropping for each zoom level
  const [fractionsDropped, setFractionsDropped] = useState<number[]>([]);
  const [minZoom, setMinZoom] = useState(0);
  const [maxZoom, setMaxZoom] = useState(20);
  const [tilesLoaded, setTilesLoaded] = useState(false);
  const [rasterMetadata, setRasterMetadata] = useState<RasterMetadata | null>(
    null,
  );

  // Debounce view state to avoid excessive re-renders during pan and zoom.
  const [viewState, setViewState] = useDebouncedState(INITIAL_VIEW_STATE, 200);

  /****************************************************************************
   * Sources (https://deck.gl/docs/api-reference/carto/data-sources)
   */

  const data = useMemo(
    () =>
      rasterSource({
        accessToken,
        apiBaseUrl,
        connectionName: CONNECTION_NAME,
        tableName: TILESET_NAME,
      }),
    [accessToken, apiBaseUrl],
  );

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  const LAYER_ID = 'U.S. Cropland';

  // Layer visibility represented as name/visibility pairs, managed by the Layers component.
  const [layerVisibility, setLayerVisibility] = useState<
    Record<string, boolean>
  >({
    [LAYER_ID]: true,
  });

  // Update layers when data or visualization parameters change.
  const layers = useMemo(() => {
    return [
      new RasterTileLayer({
        id: LAYER_ID,
        pickable: true,
        visible: layerVisibility[LAYER_ID],
        data,
        getFillColor: (d) => {
          const value = d.properties.band_1;
          return getFillColorLayer(value, rasterMetadata);
        },
        onViewportLoad(tiles) {
          data?.then((res) => {
            setTilesLoaded(true);
            res.widgetSource.loadTiles(tiles);
            setViewState({ ...viewState });
          });
        },
      }),
    ];
  }, [data, viewState, setViewState, layerVisibility, rasterMetadata]);

  /****************************************************************************
   * Attribution
   */

  useEffect(() => {
    data?.then((res) => {
      const {
        fraction_dropped_per_zoom,
        minzoom,
        maxzoom,
        attribution,
        raster_metadata,
      } = res;
      setFractionsDropped(fraction_dropped_per_zoom ?? []);
      setMinZoom(minzoom ?? 0);
      setMaxZoom(maxzoom ?? 20);
      setAttributionHTML(attribution);
      if (raster_metadata) {
        setRasterMetadata(raster_metadata);
      }
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

  const treeMapColors = useMemo(() => {
    return Array.from({ length: 255 }, (_, i) => {
      const rgb = getFillColorLayer(i, rasterMetadata);
      return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${rgb[3]})`;
    });
  }, [rasterMetadata]);

  return (
    <>
      <aside className="sidebar">
        <Card>
          <p className="overline">✨👀 You're viewing</p>
          <h1 className="title">U.S. Cropland data</h1>
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
            <Card title="Total cells">
              <FormulaWidget
                data={data}
                column={'*'}
                operation={'count'}
                viewState={viewState}
              />
            </Card>
            <Card title="Cropland categories">
              <TreeWidget
                data={data}
                column="band_1"
                operation="count"
                viewState={viewState}
                colors={treeMapColors}
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
        {/* <Card title="Legend" className="legend">
          <LegendEntryCategorical
            title="U.S. Rivers"
            subtitle="By stream order"
            values={Array.from({ length: 10 }, (_, i) => (i + 1).toString())}
            getSwatchColor={(value) =>
              streamOrderToColor(Number(value), colors) as Color
            }
          />
        </Card> */}
        <aside
          className="map-footer"
          dangerouslySetInnerHTML={{ __html: attributionHTML }}
        ></aside>
      </main>
    </>
  );
}
