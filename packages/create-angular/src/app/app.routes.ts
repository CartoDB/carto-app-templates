import { Routes } from '@angular/router';

import { AppLayoutComponent } from './components/AppLayout.component';
import { CellTowersViewComponent } from './components/views/CellTowersView.component';
import { LoginViewComponent } from './components/views/LoginView.component';
import { PopulationViewComponent } from './components/views/PopulationView.component';
import { LogoutViewComponent } from './components/views/LogoutView.component';
import { NotFoundViewComponent } from './components/views/NotFoundView.component';

/** Available paths (URLs) in the application. */
export const RoutePath = {
  CELL_TOWERS: '',
  POPULATION: 'usa-population',

  LOGIN: 'login',
  LOGOUT: 'logout',
  NOT_FOUND: '404',
};

/** Routes to be shown in the header navigation list. */
export const NAV_ROUTES: { text: string; path: string }[] = [
  {
    text: 'Cell towers',
    path: RoutePath.CELL_TOWERS,
  },
  {
    text: 'U.S. population',
    path: RoutePath.POPULATION,
  },
];

export const routes: Routes = [
  {
    path: RoutePath.CELL_TOWERS,
    component: AppLayoutComponent,
    children: [
      {
        path: RoutePath.CELL_TOWERS,
        component: CellTowersViewComponent,
      },
      {
        path: RoutePath.POPULATION,
        component: PopulationViewComponent,
      },
    ],
  },
  {
    path: RoutePath.LOGIN,
    component: LoginViewComponent,
  },
  {
    path: RoutePath.LOGOUT,
    component: LogoutViewComponent,
  },
  {
    path: RoutePath.NOT_FOUND,
    component: NotFoundViewComponent,
  },
];
