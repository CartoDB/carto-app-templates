import { createWebHistory, createRouter } from 'vue-router';

import ProtectedRoute from './components/ProtectedRoute.vue';
import CellTowersView from './components/views/CellTowersView.vue';
import PopulationView from './components/views/PopulationView.vue';
import RiversView from './components/views/RiversView.vue';

import LoginView from './components/views/LoginView.vue';
import LogoutView from './components/views/LogoutView.vue';
import NotFoundView from './components/views/NotFoundView.vue';
import LandUseView from './components/views/LandUseView.vue';

/** Available paths (URLs) in the application. */
export const RoutePath = {
  CELL_TOWERS: '/',
  POPULATION: '/usa-population',
  RIVERS: '/usa-rivers',
  LANDUSE: '/usa-landuse',
  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
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
  {
    text: 'U.S. cropland',
    path: RoutePath.LANDUSE,
  },
];

/** Routes (pages) mapped to their corresponding Vue components. */
export const routes = [
  {
    path: RoutePath.CELL_TOWERS,
    component: ProtectedRoute,
    children: [
      {
        path: RoutePath.CELL_TOWERS,
        component: CellTowersView,
      },
      {
        path: RoutePath.POPULATION,
        component: PopulationView,
      },
      {
        path: RoutePath.RIVERS,
        component: RiversView,
      },
      {
        path: RoutePath.LANDUSE,
        component: LandUseView,
      },
    ],
  },
  {
    path: RoutePath.LOGIN,
    component: LoginView,
  },
  {
    path: RoutePath.LOGOUT,
    component: LogoutView,
  },
  {
    path: RoutePath.NOT_FOUND,
    component: NotFoundView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
