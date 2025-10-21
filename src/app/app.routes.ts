import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'home',
    loadComponent: () => import('./home/home.page').then((m) => m.HomePage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'login',
    loadComponent: () => import('./login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },
  {
    path: 'dashboard',
    loadComponent: () =>
      import('./dashboard/dashboard.page').then((m) => m.DashboardPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./register/register.page').then((m) => m.RegisterPage),
  },
  {
    path: 'users',
    loadComponent: () => import('./users/users.page').then((m) => m.UsersPage),
  },
  {
    path: 'tasks',
    loadComponent: () => import('./tasks/tasks.page').then((m) => m.TasksPage),
  },
  {
    path: 'create-task',
    loadComponent: () =>
      import('./create-task/create-task.page').then((m) => m.CreateTaskPage),
  },
  {
    path: 'projects',
    loadComponent: () =>
      import('./projects/projects.page').then((m) => m.ProjectsPage),
  },
  {
    path: 'project-details-modal',
    loadComponent: () =>
      import('./project-details-modal/project-details-modal.page').then(
        (m) => m.ProjectDetailsModalPage
      ),
  },
  {
    path: 'assign-members-modal',
    loadComponent: () =>
      import('./assign-members-modal/assign-members-modal.page').then(
        (m) => m.AssignMembersModalPage
      ),
  },
  {
    path: 'notification-bell',
    loadComponent: () =>
      import('./notification-bell/notification-bell.page').then(
        (m) => m.NotificationsPage
      ),
  },
  {
    path: 'notification',
    loadComponent: () =>
      import('./notificatio/notification.page').then(
        (m) => m.NotificationBellComponent
      ),
  },
];
