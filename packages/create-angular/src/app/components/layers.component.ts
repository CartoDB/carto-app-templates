import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Layer } from '@deck.gl/core';
import { CardComponent } from './card.component';
import { CardCollapsibleComponent } from './card-collapsible.component';

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
        TODO:LayersComponent
        <!--<label v-for="layer in layers" class="body2" :key="layer.id">
        <input
          type="checkbox"
          :checked="layer.props.visible"
          @input="
            ({ target }) =>
              setVisibility(layer.id, (target as HTMLInputElement).checked)
          "
        />{{ layer.id }}
      </label>-->
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
}
