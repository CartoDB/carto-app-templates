import { Component, Input } from '@angular/core';
import { Color } from '@deck.gl/core';
import { toHexString } from '../../../utils';

@Component({
  selector: 'legend-entry-continuous',
  standalone: true,
  template: `
    <section class="legend-section">
      <p class="legend-section-title body2">{{ title }}</p>
      <p class="legend-section-subtitle caption">{{ subtitle }}</p>
      TODO:gradient
    </section>
  `,
})
export class LegendEntryContinuousComponent {
  @Input({ required: true }) title = '';
  @Input({ required: true }) subtitle = '';
  // @Input({ required: true }) values: string[] = [];
  // @Input({ required: true }) getSwatchColor: (value: string) => Color = null!;

  // getBackgroundColor(value: string): string {
  //   return toHexString(this.getSwatchColor(value));
  // }
}
