import { Routes } from '@angular/router';
import { TabsPage } from './tabs.page';
import { categoriesFlagGuard } from '../core/guards/categories-flag.guard';

export const routes: Routes = [
  {
    path: '',
    component: TabsPage,
    children: [
      {
        path: 'todo-list',
        loadComponent: () =>
          import('../todo/todo.page').then((m) => m.TodoPage),
      },
      {
        path: 'categories',
        canMatch: [categoriesFlagGuard],
        loadComponent: () =>
          import('../categories/categories.page').then((m) => m.CategoriesPage),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import('../settings/settings.page').then((m) => m.SettingsPage),
      },
      {
        path: '',
        redirectTo: '/todo-list',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: '/todo-list',
    pathMatch: 'full',
  },
];
