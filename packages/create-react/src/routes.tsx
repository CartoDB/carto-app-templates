import { lazy } from 'react';
import ProtectedRoute from './components/common/ProtectedRoute';
import AppLayout from './components/common/AppLayout';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

const Default = lazy(() => import('./components/views/Default'));
const Secondary = lazy(() => import('./components/views/Secondary'));
const NotFound = lazy(() => import('./components/views/NotFound'));
const Login = lazy(() => import('./components/views/Login'));

// TODO: /logout ?
export const RoutePath: Record<string, string> = {
  DEFAULT: '/',
  US_POPULATION: '/usa-population',

  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

export const NAV_ROUTES: { text: string; path: string }[] = [
  { text: 'Cell towers', path: RoutePath.DEFAULT },
  { text: 'U.S. population', path: RoutePath.US_POPULATION },
];

export const routes: RouteObject[] = [
  {
    path: RoutePath.DEFAULT,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: RoutePath.DEFAULT, element: <Default /> },
      { path: RoutePath.US_POPULATION, element: <Secondary /> },
    ],
  },
  { path: RoutePath.LOGIN, element: <Login /> },
  { path: '*', element: <NotFound /> },
];

export const router = createBrowserRouter(routes);
