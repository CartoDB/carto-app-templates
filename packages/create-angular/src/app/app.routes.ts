import { Routes } from '@angular/router';

import { AppLayoutComponent } from './components/AppLayout.component';
import { CellTowersViewComponent } from './components/views/CellTowersView.component';
import { RiversViewComponent } from './components/views/RiversView.component';
import { LoginViewComponent } from './components/views/LoginView.component';
import { PopulationViewComponent } from './components/views/PopulationView.component';
import { LogoutViewComponent } from './components/views/LogoutView.component';
import { NotFoundViewComponent } from './components/views/NotFoundView.component';
import { environment } from '../environments/environment';
import { AuthGuard } from './guards/Auth.guard';
import { context } from '../context';
/** Available paths (URLs) in the application. */
export const RoutePath = {
  CELL_TOWERS: '',
  POPULATION: 'usa-population',
  RIVERS: 'rivers',

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
  {
    text: 'U.S. rivers',
    path: RoutePath.RIVERS,
  },
];

export const routes: Routes = [
  {
    title: environment.APP_TITLE,
    path: RoutePath.CELL_TOWERS,
    component: AppLayoutComponent,
    canActivate: context.oauth.enabled ? [AuthGuard] : [],
    children: [
      {
        path: RoutePath.CELL_TOWERS,
        component: CellTowersViewComponent,
      },
      {
        path: RoutePath.POPULATION,
        component: PopulationViewComponent,
      },
      {
        path: RoutePath.RIVERS,
        component: RiversViewComponent,
      },
    ],
  },
  {
    title: environment.APP_TITLE + ' | Log in',
    path: RoutePath.LOGIN,
    component: LoginViewComponent,
  },
  {
    title: environment.APP_TITLE + ' | Log out',
    path: RoutePath.LOGOUT,
    component: LogoutViewComponent,
  },
  {
    title: environment.APP_TITLE + ' | Not found',
    path: RoutePath.NOT_FOUND,
    component: NotFoundViewComponent,
  },
];
