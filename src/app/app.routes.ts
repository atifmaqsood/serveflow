import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'pos',
  },
  {
    path: 'pos',
    loadComponent: () =>
      import('./features/pos-terminal/pos-terminal.component').then(
        (m) => m.PosTerminalComponent
      ),
  },
  {
    path: 'orders',
    loadComponent: () =>
      import('./features/orders-history/orders-history.component').then(
        (m) => m.OrdersHistoryComponent
      ),
  },
  {
    path: 'menu',
    loadComponent: () =>
      import('./features/menu-management/menu-management.component').then(
        (m) => m.MenuManagementComponent
      ),
  },
  {
    path: 'reports',
    loadComponent: () =>
      import('./features/sales-reports/sales-reports.component').then(
        (m) => m.SalesReportsComponent
      ),
  },
  {
    path: 'settings',
    loadComponent: () =>
      import('./features/settings/settings.component').then((m) => m.SettingsComponent),
  },
  {
    path: '**',
    redirectTo: 'pos',
  },
];
