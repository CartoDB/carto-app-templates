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
  SECONDARY: 'secondary',

  LOGIN: 'login',
  LOGOUT: 'logout',
  NOT_FOUND: '404',
};

export const NAV_ROUTES: { text: string; path: string }[] = [
  { text: 'Default', path: RoutePath.DEFAULT },
  { text: 'Secondary', path: RoutePath.SECONDARY },
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
      { path: RoutePath.SECONDARY, element: <Secondary /> },
    ],
  },
  { path: RoutePath.LOGIN, element: <Login /> },
  { path: '*', element: <NotFound /> },
];

export const router = createBrowserRouter(routes);
