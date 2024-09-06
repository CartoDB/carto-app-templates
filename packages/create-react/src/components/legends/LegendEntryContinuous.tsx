import { Color } from '@deck.gl/core';
import { toHexString } from '../../utils';

export type LegendEntryContinuousProps = {
  title: string;
  subtitle: string;
  domain: [number, number];
  getSwatchColor: (value: number) => Color;
};

/**
 * Continuous legend entry, representing a continuous domain [min, max]
 * as a color gradient, with labeled min and max values.
 */
export function LegendEntryContinuous(props: LegendEntryContinuousProps) {
  const colorLo = toHexString(props.getSwatchColor(props.domain[0]));
  const colorHi = toHexString(props.getSwatchColor(props.domain[1]));

  return (
    <section className="legend-section" key={props.title}>
      <p className="legend-section-title body2">{props.title}</p>
      <p className="legend-section-subtitle caption">{props.subtitle}</p>
      <div
        className="legend-gradient overline"
        style={{
          background: `linear-gradient(to right, ${colorLo}, ${colorHi})`,
        }}
      >
        <span className="legend-gradient-label -min">{props.domain[0]}</span>
        <span className="legend-gradient-label -max">{props.domain[1]}</span>
      </div>
    </section>
  );
}
