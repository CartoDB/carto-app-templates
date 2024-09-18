import { Component } from '@angular/core';

/**
 * Card UI. Simple container.
 */
@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <section class="card">
      <div class="card-content"><ng-content /></div>
    </section>
  `,
})
export class CardComponent {}
