import { createBrowserRouter, RouteObject } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import CellTowersView from './components/views/CellTowersView';
import PopulationView from './components/views/PopulationView';
import NotFoundView from './components/views/NotFoundView';
import LoginView from './components/views/LoginView';
import LogoutView from './components/views/LogoutView';

export const RoutePath = {
  CELL_TOWERS: '/',
  POPULATION: '/usa-population',

  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

export const NAV_ROUTES: { text: string; path: string }[] = [
  { text: 'Cell towers', path: RoutePath.CELL_TOWERS },
  { text: 'U.S. population', path: RoutePath.POPULATION },
];

export const routes: RouteObject[] = [
  {
    path: RoutePath.CELL_TOWERS,
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { path: RoutePath.CELL_TOWERS, element: <CellTowersView /> },
      { path: RoutePath.POPULATION, element: <PopulationView /> },
    ],
  },
  { path: RoutePath.LOGIN, element: <LoginView /> },
  { path: RoutePath.LOGOUT, element: <LogoutView /> },
  { path: '*', element: <NotFoundView /> },
];

export const router = createBrowserRouter(routes);
