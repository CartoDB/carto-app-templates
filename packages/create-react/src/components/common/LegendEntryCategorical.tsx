import { Color } from '@deck.gl/core';

export type LegendEntryCategoricalProps = {
  type: 'categorical';
  title: string;
  subtitle: string;
  values: string[];
  getSwatchColor: (value: string) => Color;
};

export function LegendEntryCategorical(props: LegendEntryCategoricalProps) {
  return (
    <section className="legend-section" key={props.title}>
      <p className="legend-section-title body2">{props.title}</p>
      <p className="legend-section-subtitle caption">{props.subtitle}</p>
      <ul className="legend-list">
        {props.values.map((value) => (
          <li className="legend-list-item" key={value}>
            <span
              className="legend-list-item-swatch"
              style={{
                backgroundColor: toHexString(props.getSwatchColor(value)),
              }}
            />
            <span className="legend-list-item-title overline">{value}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}
