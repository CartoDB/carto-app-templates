import { Color } from '@deck.gl/core';

/**
 * Converts an array of RGB values (0–255) to a hexadecimal
 * string suitable for use in CSS.
 */
export function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}
