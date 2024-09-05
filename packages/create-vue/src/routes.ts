import { createWebHistory, createRouter } from 'vue-router';
import ProtectedRoute from './components/common/ProtectedRoute.vue';

const DefaultView = () => import('./components/views/Default.vue');
const SecondaryView = () => import('./components/views/Secondary.vue');
const LoginView = () => import('./components/views/Login.vue');
const LogoutView = () => import('./components/views/Logout.vue');
const NotFoundView = () => import('./components/views/NotFound.vue');

export const RoutePath = {
  DEFAULT: '/',
  US_POPULATION: '/usa-population',

  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

export const NAV_ROUTES: { text: string; path: string }[] = [
  {
    text: 'Cell towers',
    path: RoutePath.DEFAULT,
  },
  {
    text: 'U.S. population',
    path: RoutePath.US_POPULATION,
  },
];

export const routes = [
  {
    path: RoutePath.DEFAULT,
    component: ProtectedRoute,
    children: [
      {
        path: RoutePath.DEFAULT,
        component: DefaultView,
      },
      {
        path: RoutePath.US_POPULATION,
        component: SecondaryView,
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
