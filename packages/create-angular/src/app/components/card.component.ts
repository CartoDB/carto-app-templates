import { Component } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  imports: [],
  template: `
    @if (title) {
      <section class="card">
        <div class="card-content"><ng-content /></div>
      </section>
    } @else {
      <details class="card" [open]="open">
        <summary class="card-summary">
          <span class="body1 card-summary-title">{{ title }}</span>
        </summary>
        <div class="card-content"><ng-content /></div>
      </details>
    }
  `,
})
export class CardComponent {
  public title?: string;
  public className = '';
  public open = true;
}
