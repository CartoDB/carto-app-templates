import { Color } from '@deck.gl/core';
import { Card } from './Card';

export interface LegendProps {
  open?: boolean;
  entries: {
    title: string;
    subtitle: string;
    values: string[];
    getSwatchColor: (value: string) => Color;
  }[];
}

function toHexString(color: Color): string {
  const hex =
    Math.round(color[0]) * 65536 +
    Math.round(color[1]) * 256 +
    Math.round(color[2]);
  return '#' + ('000000' + hex.toString(16)).slice(-6);
}

export function Legend({ open, entries }: LegendProps) {
  return (
    <aside className="legend">
      <Card title={'Legend'} open={open}>
        {entries.map(({ title, subtitle, values, getSwatchColor }) => (
          <section className="legend-section" key={title}>
            <p className="legend-section-title body2">{title}</p>
            <p className="legend-section-subtitle caption">{subtitle}</p>
            <ul className="legend-list">
              {values.map((value) => (
                <li className="legend-list-item" key={value}>
                  <span
                    className="legend-list-item-swatch"
                    style={{
                      backgroundColor: toHexString(getSwatchColor(value)),
                    }}
                  />
                  <span className="legend-list-item-title overline">
                    {value}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </Card>
    </aside>
  );
}
