import { createWebHistory, createRouter } from 'vue-router';

const DefaultView = () => import('./components/views/Default.vue');
const SecondaryView = () => import('./components/views/Secondary.vue');

export const routes = [
  {
    text: 'Cell towers',
    path: '/',
    component: DefaultView,
  },
  {
    text: 'U.S. population',
    path: '/usa-population',
    component: SecondaryView,
  },
];

export const router = createRouter({
  history: createWebHistory(),
  routes,
});
