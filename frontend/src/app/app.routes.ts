import { Routes } from '@angular/router';
import { MainLayout } from './layout/main-layout/main-layout';

/* =====================
   CORE MODULES
   ===================== */
import { EntityComponent } from './components/entity-component/entity-component/entity-component';
import { NodeComponent } from './components/node-component/node-component/node-component';
import { BindingComponent } from './components/binding-component/binding-component/binding-component';
import { CombinationComponent } from './components/combination-component/combination-component/combination-component';
import { BindingList } from './components/binding-component/binding-list/binding-list';
import { EmployeeComponent } from './components/employee-component/employee-component/employee-component';

/* =====================
   USER MANAGEMENT
   ===================== */
import { Role } from './components/user-management/role/role';
import { RoleRights } from './components/user-management/role-rights/role-rights';
import { Users } from './components/user-management/users/users';

/* =====================
   AUTH
   ===================== */
import { Login } from './auth/login/login';
import { UpdatePassword } from './auth/update-password/update-password';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleRightsView } from './components/user-management/role-rights/role-rights-view/role-rights-view';
import { CopyModule } from './components/user-management/copy-module/copy-module';
import { Welcome } from './auth/welcome/welcome';
import { Forbidden } from './auth/forbidden/forbidden';

export const routes: Routes = [
  /* =====================
     AUTH ROUTES (PUBLIC)
     ===================== */
  {
    path: 'login',
    component: Login,
  },
  {
    path: 'update-password',
    component: UpdatePassword,
  },
  {
    path: 'forbidden',
    component: Forbidden,
  },

  /* =====================
     PROTECTED ROUTES
     ===================== */
  {
    path: '',
    component: MainLayout,
    canActivate: [AuthGuard],
    canActivateChild: [AuthGuard],
    children: [
      { path: '', component: Welcome },

      /* -------- Core Screens -------- */
      {
        path: 'entity-types',
        component: EntityComponent,
        data: { permission: 'entity-types' },
      },
      {
        path: 'nodes',
        component: NodeComponent,
        data: { permission: 'nodes' },
      },
      {
        path: 'relationships',
        component: BindingComponent,
        data: { permission: 'relationships' },
      },
      {
        path: 'relationships/:id',
        component: BindingList,
        data: { permission: 'relationships' },
      },
      {
        path: 'hierarchy',
        component: CombinationComponent,
        data: { permission: 'hierarchy' },
      },

      {
        path: 'employees',
        component: EmployeeComponent,
        data: { permission: 'employees' },
      },

      /* =====================
         CONFIGURATION
         ===================== */
      {
        path: '',
        children: [
          {
            path: 'user-management',
            children: [
              { path: 'roles', component: Role, data: { permission: 'roles' } },
              {
                path: 'role-rights',
                component: RoleRights,
                data: { permission: 'role-rights' },
              },
              {
                path: 'users',
                component: Users,
                data: { permission: 'users' },
              },
              {
                path: 'role-rights/view/:roleId/:appId',
                component: RoleRightsView,
                data: { permission: 'role-rights' },
              },
              {
                path: 'role-rights/copy',
                component: CopyModule,
                data: { permission: 'user-management/role-rights/copy' },
              },

              // default inside user-management
              { path: '', redirectTo: 'roles', pathMatch: 'full' },
            ],
          },
        ],
      },
    ],
  },

  /* =====================
     FALLBACK
     ===================== */
  { path: '**', redirectTo: 'login' },
];
