import { SpatialFilter } from '@carto/api-client';
import { Color, MapViewState, WebMercatorViewport } from '@deck.gl/core';

export type WidgetStatus = 'loading' | 'complete' | 'error';

export const numberFormatter = new Intl.NumberFormat('US', {
  maximumSignificantDigits: 3,
});

/**
 * Converts an array of RGB values (0–255) to a hexadecimal
 * string suitable for use in CSS.
 */
export function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);

  let a = Math.round(color[3] || 255)
  if (a > 0 && a <= 1) {
    a = Math.round(a * 255)
  }

  const alpha = a.toString(16).padStart(2, '0');
  return '#' + ('000000' + hex.toString(16)).slice(-6) + alpha;
}

/**
 * Creates a {@link SpatialFilter} for use in Widget API queries,
 * given {@link MapViewState} from deck.gl.
 */
export function createSpatialFilter(viewState: MapViewState): SpatialFilter {
  const viewport = new WebMercatorViewport(viewState);
  return {
    type: 'Polygon',
    coordinates: [
      [
        viewport.unproject([0, 0]),
        viewport.unproject([viewport.width, 0]),
        viewport.unproject([viewport.width, viewport.height]),
        viewport.unproject([0, viewport.height]),
        viewport.unproject([0, 0]),
      ],
    ],
  };
}
