import { Layer } from '@deck.gl/core';
import { Card } from './Card';

interface LayersProps {
  open?: boolean;
  layers: Layer[];
  layerVisibility: Record<string, boolean>;
  onLayerVisibilityChange: (layerVisibility: Record<string, boolean>) => void;
}

export function Layers({
  open = true,
  layers,
  layerVisibility,
  onLayerVisibilityChange,
}: LayersProps) {
  return (
    <aside className="layers">
      <Card title={'Layers'} open={open}>
        {layers.map((layer) => (
          <label className="body2" key={layer.id}>
            <input
              type="checkbox"
              checked={layer.props.visible}
              onChange={({ target }) => {
                onLayerVisibilityChange({
                  ...layerVisibility,
                  [layer.id]: target.checked,
                });
              }}
            />
            {layer.id}
          </label>
        ))}
      </Card>
    </aside>
  );
}
