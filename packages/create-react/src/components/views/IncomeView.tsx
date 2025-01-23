import { Color, MapView, MapViewState, WebMercatorViewport } from "@deck.gl/core";
import { useContext, useEffect, useMemo, useState } from "react";
import { AppContext } from "../../context";
import { useDebouncedState } from "../../hooks/useDebouncedState";
import { createViewportSpatialFilter, vectorTilesetSource } from "@carto/api-client";
import { VectorTileLayer } from "@deck.gl/carto";
import { Card } from "../Card";
import { FormulaWidget } from "../widgets/FormulaWidget";
import DeckGL from "@deck.gl/react";
import { Map } from 'react-map-gl/maplibre';
import { Layers } from "../Layers";
import { LegendEntryCategorical } from "../legends/LegendEntryCategorical";

const MAP_VIEW = new MapView({ repeat: true });
const MAP_STYLE =
  'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

const INITIAL_VIEW_STATE: MapViewState = {
  latitude: 31.8028,
  longitude: -103.0078,
  zoom: 2,
};

const histogramTicks = [15000, 20000, 23000, 26000, 30000, 34000, 40000, 50000];

const colors = [
  '#f7fcf0',
  '#e0f3db',
  '#ccebc5',
  '#a8ddb5',
  '#7bccc4',
  '#4eb3d3',
  '#2b8cbe',
  '#08589e',
].map((hex) => hexToRgb(hex));

function hexToRgb(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return [r, g, b];
}

/**
 * Example application page, showing U.S. income by block group.
 */
export default function IncomeView() {
  // With authentication enabled, access token may change.
  const { accessToken, apiBaseUrl } = useContext(AppContext);
  const [attributionHTML, setAttributionHTML] = useState('');
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
        connectionName: 'carto_dw',
        tableName: 'carto-demo-data.demo_tilesets.sociodemographics_usa_blockgroup',
      }),
    [accessToken, apiBaseUrl],
  );

  /****************************************************************************
   * Layers (https://deck.gl/docs/api-reference/carto/overview#carto-layers)
   */

  const LAYER_ID = 'Income by block group'

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
        getLineColor: [0, 0 ,0],
        lineWidthMinPixels: 0.3,
        getFillColor: d => {
          const n = d.properties.income_per_capita;
          const index = histogramTicks.slice().reverse().findIndex((tick) => n >= tick);
          const color = colors[index] || colors[colors.length - 1];
          return color as Color;
        },
        onViewportLoad(tiles) {
          data?.then((res) => {
            res.widgetSource.loadTiles(tiles)
            const bbox = new WebMercatorViewport(viewState).getBounds()
            const spatialFilter = createViewportSpatialFilter(bbox)
            if (spatialFilter) {
              res.widgetSource.extractTileFeatures({ spatialFilter })
            }
          })
        },
      }),
    ];
  }, [data, layerVisibility]);

  /****************************************************************************
   * Attribution
   */

  useEffect(() => {
    data?.then(({ attribution }) => setAttributionHTML(attribution));
  }, [data]);
  
  useEffect(() => {
    if (data && viewState) {
      data?.then((res) => {
        const bbox = new WebMercatorViewport(viewState).getBounds()
        const spatialFilter = createViewportSpatialFilter(bbox)
        if (spatialFilter) {
          res.widgetSource.extractTileFeatures({ spatialFilter })
        }
      })
    }
  }, [data, viewState])
  
  return (
    <>
      <aside className="sidebar">
        <Card>
          <p className="overline">✨👀 You're viewing</p>
          <h1 className="title">Income by block group</h1>
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
        <Card title="Block group count">
          <FormulaWidget
            data={data}
            column={''}
            operation={'count'}
            viewState={viewState}
          />
        </Card>
        <Card title="Block groups by income">
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
            title="Block group"
            subtitle="By income per capita"
            values={histogramTicks.map(String)}
            getSwatchColor={(value: string) =>
              colors[histogramTicks.indexOf(Number(value))] as Color
            }
          />
        </Card>
        <aside
          className="map-footer"
          dangerouslySetInnerHTML={{ __html: attributionHTML }}
        ></aside>
      </main>
    </>
  )
}
