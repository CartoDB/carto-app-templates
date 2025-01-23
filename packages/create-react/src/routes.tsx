import { createBrowserRouter, RouteObject } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import CellTowersView from './components/views/CellTowersView';
import PopulationView from './components/views/PopulationView';
import NotFoundView from './components/views/NotFoundView';
import LoginView from './components/views/LoginView';
import LogoutView from './components/views/LogoutView';
import IncomeView from './components/views/IncomeView';

/**
 * Available paths (URLs) in the application.
 */
export const RoutePath = {
  CELL_TOWERS: '/',
  POPULATION: '/usa-population',
  INCOME: '/income',
  LOGIN: '/login',
  LOGOUT: '/logout',
  NOT_FOUND: '/404',
};

/**
 * Routes to be shown in the header navigation list.
 */
export const NAV_ROUTES: { text: string; path: string }[] = [
  { text: 'Cell towers', path: RoutePath.CELL_TOWERS },
  { text: 'U.S. population', path: RoutePath.POPULATION },
  { text: 'Income', path: RoutePath.INCOME },
];

/**
 * Routes (pages) mapped to their corresponding React components.
 */
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
      { path: RoutePath.INCOME, element: <IncomeView /> },
    ],
  },
  { path: RoutePath.LOGIN, element: <LoginView /> },
  { path: RoutePath.LOGOUT, element: <LogoutView /> },
  { path: '*', element: <NotFoundView /> },
];

export const router = createBrowserRouter(routes);
