import { Component } from '@angular/core';
import { CardComponent } from '../card.component';

@Component({
  selector: 'app-cell-towers-view',
  standalone: true,
  imports: [CardComponent],
  template: `
    <aside class="sidebar">
      <app-card>
        <p class="overline">✨👀 You're viewing</p>
        <h1 class="title">Cell towers</h1>
        <p class="body1">
          Cheesecake caramels sesame snaps gummi bears oat cake chupa chups.
          Chupa chups sugar plum tootsie roll powder candy canes. Biscuit cake
          gummies cheesecake cupcake biscuit bear claw icing. Jelly topping
          caramels gummi bears carrot cake pudding.
        </p>
        <p class="body1">
          Bear claw marshmallow gingerbread muffin sweet roll bear claw ice
          cream cake macaroon. Lollipop brownie ice cream pudding sweet gummi
          bears jelly jelly-o tart.
        </p>
      </app-card>
      <span class="flex-space"></span>
      <app-card title="Tower count"> widget </app-card>
      <app-card title="Towers by radio"> widget </app-card>
    </aside>
    <main class="map">
      map layers
      <app-card title="Legend" class="legend"> legend </app-card>
      <aside class="map-footer">footer aside TODO</aside>
    </main>
  `,
})
export class CellTowersViewComponent {}
