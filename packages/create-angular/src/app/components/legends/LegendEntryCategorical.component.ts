import { Component, Input } from '@angular/core';
import { Color } from '@deck.gl/core';
import { toHexString } from '../../../utils';

@Component({
  selector: 'legend-entry-categorical',
  standalone: true,
  template: `
    <section class="legend-section">
      <p class="legend-section-title body2">{{ title }}</p>
      <p class="legend-section-subtitle caption">{{ subtitle }}</p>
      <ul class="legend-list">
        @for (value of values; track value) {
          <li class="legend-list-item">
            <span
              class="legend-list-item-swatch"
              [style]="{ backgroundColor: getBackgroundColor(value) }"
            ></span>
            <span class="legend-list-item-title overline">
              {{ value }}
            </span>
          </li>
        }
      </ul>
    </section>
  `,
})
export class LegendEntryCategoricalComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  @Input({ required: true }) values: string[] = [];
  @Input({ required: true }) getSwatchColor: (value: string) => Color = null!;

  getBackgroundColor(value: string): string {
    return toHexString(this.getSwatchColor(value));
  }
}
