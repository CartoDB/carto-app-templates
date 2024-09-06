import { createWebHistory, createRouter } from 'vue-router';

import ProtectedRoute from './components/ProtectedRoute.vue';
import CellTowersView from './components/views/CellTowersView.vue';
import PopulationView from './components/views/PopulationView.vue';
import LoginView from './components/views/LoginView.vue';
import LogoutView from './components/views/LogoutView.vue';
import NotFoundView from './components/views/NotFoundView.vue';

export const RoutePath = {
  CELL_TOWERS: '/',
  POPULATION: '/usa-population',

  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

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
