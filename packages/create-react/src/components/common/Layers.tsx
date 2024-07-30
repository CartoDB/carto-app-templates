import { Card } from './Card';

interface LayersProps {
  open?: boolean;
}

export function Layers({ open }: LayersProps) {
  return (
    <aside className="layers">
      <Card title={'Layers'} open={open}>
        <div className="skeleton" style={{ height: '4em' }} />
      </Card>
    </aside>
  );
}
