import { Layer } from '@deck.gl/core';
import { Card } from './Card';

interface LayersProps {
  /** Whether the layer list is open (default) or closed. */
  open?: boolean;
  /** List of deck.gl layers. */
  layers: Layer[];
  /** Layer visibility state. Object keys are layer names, values are boolean visibility. */
  layerVisibility: Record<string, boolean>;
  /** Callback to be invoked by the Layers component if a layer's visibility is toggled. */
  onLayerVisibilityChange: (layerVisibility: Record<string, boolean>) => void;
}

/**
 * Layer list and visibility controller.
 */
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
