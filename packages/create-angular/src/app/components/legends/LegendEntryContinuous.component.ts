import { Component, computed, input } from '@angular/core';
import { Color } from '@deck.gl/core';
import { toHexString } from '../../../utils';

/**
 * Continuous legend entry, representing a continuous domain [min, max]
 * as a color gradient, with labeled min and max values.
 */
@Component({
  selector: 'legend-entry-continuous',
  standalone: true,
  template: `
    <section class="legend-section">
      <p class="legend-section-title body2">{{ title() }}</p>
      <p class="legend-section-subtitle caption">{{ subtitle() }}</p>
      <div
        class="legend-gradient overline"
        [style]="{ background: getBackground() }"
      >
        <span class="legend-gradient-label -min">{{ domain()[0] }}</span>
        <span class="legend-gradient-label -max">{{ domain()[1] }}</span>
      </div>
    </section>
  `,
})
export class LegendEntryContinuousComponent {
  title = input.required<string>();
  subtitle = input.required<string>();
  domain = input.required<[number, number]>();
  getSwatchColor = input.required<(value: number) => Color>();

  colorLo = computed(() =>
    toHexString(this.getSwatchColor()(this.domain()[0])),
  );
  colorHi = computed(() =>
    toHexString(this.getSwatchColor()(this.domain()[1])),
  );

  getBackground() {
    // TODO: Support multi-stop gradient, not just two-tone.
    return `linear-gradient(to right, ${this.colorLo()}, ${this.colorHi()})`;
  }
}
