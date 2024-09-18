import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Layer } from '@deck.gl/core';
import { CardCollapsibleComponent } from './CardCollapsible.component';

/**
 * Layer list and visibility controller.
 */
@Component({
  selector: 'app-layers',
  standalone: true,
  imports: [CardCollapsibleComponent],
  template: `
    <aside class="layers">
      <app-card-collapsible title="Layers" [open]="open">
        @for (layer of layers; track layer.id) {
          <label class="body2" :key="layer.id">
            <input
              type="checkbox"
              :checked="layer.props.visible"
              (input)="onLayerVisibilityChange(layer.id, $event)"
            />{{ layer.id }}
          </label>
        }
      </app-card-collapsible>
    </aside>
  `,
})
export class LayersComponent {
  /** Whether the layer list is open (default) or closed. */
  @Input() open = true;
  /** List of deck.gl layers. */
  @Input() layers: Layer[] = [];
  /** Layer visibility state. Object keys are layer names, values are boolean visibility. */
  @Input() layerVisibility: Record<string, boolean> = {};
  /** Callback to be invoked by the Layers component if a layer's visibility is toggled. */
  @Output() layerVisibilityChanged = new EventEmitter<
    Record<string, boolean>
  >();

  onLayerVisibilityChange(id: string, event: Event) {
    const visible = (event.target as HTMLInputElement).checked;
    this.layerVisibilityChanged.emit({
      ...this.layerVisibility,
      [id]: visible,
    });
  }
}
