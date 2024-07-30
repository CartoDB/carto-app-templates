import { Card } from './Card';

interface LegendProps {
  open?: boolean;
}

export function Legend({ open }: LegendProps) {
  return (
    <aside className="legend">
      <Card title={'Legend'} open={open}>
        <div className="skeleton" style={{ height: '7em' }} />
      </Card>
    </aside>
  );
}
