import { Card } from './Card';
import {
  LegendEntryCategorical,
  LegendEntryCategoricalProps,
} from './LegendEntryCategorical';
import {
  LegendEntryContinuous,
  LegendEntryContinuousProps,
} from './LegendEntryContinuous';

export interface LegendProps {
  open?: boolean;
  entries: (LegendEntryCategoricalProps | LegendEntryContinuousProps)[];
}

export function Legend({ open, entries }: LegendProps) {
  return (
    <aside className="legend">
      <Card title={'Legend'} open={open}>
        {entries.map((entry) =>
          entry.type === 'categorical' ? (
            <LegendEntryCategorical key={entry.title} {...entry} />
          ) : (
            <LegendEntryContinuous key={entry.title} {...entry} />
          ),
        )}
      </Card>
    </aside>
  );
}
