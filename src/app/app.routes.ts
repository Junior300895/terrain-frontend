import { Routes } from '@angular/router';
import { authGuard, adminGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'connexion',
    loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'inscription',
    loadComponent: () => import('./features/auth/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'reservations',
    loadComponent: () => import('./features/reservations/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'mes-reservations',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reservations/my-reservations.component').then(m => m.MyReservationsComponent)
  },
  {
    path: 'admin',
    canActivate: [authGuard, adminGuard],
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard',    loadComponent: () => import('./features/admin/dashboard.component').then(m => m.DashboardComponent) },
      { path: 'reservations', loadComponent: () => import('./features/admin/reservations-list.component').then(m => m.ReservationsListComponent) },
      { path: 'creneaux',     loadComponent: () => import('./features/admin/creneaux-manager.component').then(m => m.CreneauxManagerComponent) },
      { path: 'rapports',     loadComponent: () => import('./features/admin/rapport.component').then(m => m.RapportComponent) },
      { path: 'depenses',     loadComponent: () => import('./features/admin/depenses.component').then(m => m.DepensesComponent) },
      { path: 'depenses',     loadComponent: () => import('./features/admin/depenses.component').then(m => m.DepensesComponent) }
    ]
  },
  { path: '**', redirectTo: '' }
];
