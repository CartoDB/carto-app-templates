import { booleanAttribute, Component, Input } from '@angular/core';

@Component({
  selector: 'app-card-collapsible',
  standalone: true,
  template: `
    <details class="card" [open]="open">
      <summary class="card-summary">
        <span class="body1 card-summary-title">{{ title }}</span>
      </summary>
      <div class="card-content"><ng-content /></div>
    </details>
  `,
})
export class CardCollapsibleComponent {
  @Input({ required: true }) title = '';
  @Input({ transform: booleanAttribute }) open = true;
}
