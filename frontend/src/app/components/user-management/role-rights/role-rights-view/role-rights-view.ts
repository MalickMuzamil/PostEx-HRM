import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { RoleRightsService } from '../../../../core/services/role-rights-service';
import { RoleService } from '../../../../core/services/role-service';
import { AuthService } from '../../../../core/services/auth-service';

@Component({
  selector: 'app-role-rights-view',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-rights-view.html',
  styleUrl: './role-rights-view.css',
})
export class RoleRightsView {
  roleId!: number;
  appId!: number;

  roleName = '';
  appName = '';

  menuTree: any[] = [];
  selectedMenuIds = new Set<number>();

  activeNode: any = null;
  breadcrumb: any[] = [];

  canView = false;

  actionPermissions = {
    view: false,
    create: false,
    update: false,
    delete: false,
  };

  summary = { total: 0, view: 0, create: 0, update: 0, delete: 0 };

  actionMap: {
    [menuId: number]: {
      view: boolean;
      create: boolean;
      update: boolean;
      delete: boolean;
    };
  } = {};

  loadingActions = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private roleRightsService: RoleRightsService,
    private roleService: RoleService,
    private auth: AuthService
  ) {}

  ngOnInit() {

    this.canView = this.auth.hasPermission('role-rights', 'view');

    if (!this.canView) {
      return;
    }

    this.roleId = +this.route.snapshot.paramMap.get('roleId')!;
    this.appId = +this.route.snapshot.paramMap.get('appId')!;

    this.loadRoleName();
    this.loadApplicationName();

    this.loadMenus();
    this.loadRights();
  }


  /* ================= HEADER DATA ================= */

  loadRoleName() {
    this.roleService.getRoles().subscribe((res: any) => {
      const roles = res.data ?? res ?? [];
      const role = roles.find((r: any) => r.role_id === this.roleId);
      this.roleName = role?.role_name ?? '';
    });
  }

  loadApplicationName() {
    this.roleRightsService.getApplications().subscribe((res: any) => {
      const apps = res.data ?? res ?? [];
      const app = apps.find((a: any) => a.app_id === this.appId);
      this.appName = app?.app_name ?? '';
    });
  }

  /* ================= MENUS ================= */

  loadMenus() {
    this.roleRightsService.getMenus(this.appId).subscribe((res: any) => {
      this.menuTree = this.buildTree(res.data ?? res);

      if (this.menuTree.length) {
        this.setActiveNode(this.menuTree[0]);
      }
    });
  }

  loadRights() {
    this.roleRightsService
      .getRoleRights(this.roleId, this.appId)
      .subscribe((res: any) => {
        (res.data ?? res).forEach((menuId: number) => {
          this.selectedMenuIds.add(menuId);
          this.loadMenuActionsInline(menuId);
        });
      });
  }

  loadMenuActionsInline(menuId: number) {
    this.roleRightsService
      .getRoleMenuActions(this.roleId, menuId)
      .subscribe((res: any) => {
        this.actionMap[menuId] = {
          view: false,
          create: false,
          update: false,
          delete: false,
          ...(res?.data?.permissions || {}),
        };

        this.updateSummary();
      });
  }

  buildTree(flat: any[]) {
    const map = new Map<number, any>();
    const tree: any[] = [];

    flat.forEach((m) => {
      m.children = [];
      map.set(m.menu_id, m);
    });

    flat.forEach((m) => {
      if (m.parent_id) {
        map.get(m.parent_id)?.children.push(m);
      } else {
        tree.push(m);
      }
    });

    return tree;
  }

  isChecked(id: number): boolean {
    return this.selectedMenuIds.has(id);
  }

  setActiveNode(node: any) {
    this.activeNode = node;
    this.buildBreadcrumb(node);

    this.loadActionPermissions(node);
  }

  loadActionPermissions(menuNode: any) {
    if (!menuNode || menuNode.parent_id == null) {
      this.resetActionPermissions();
      return;
    }

    this.loadingActions = true;

    this.roleRightsService
      .getRoleMenuActions(this.roleId, menuNode.menu_id)
      .subscribe({
        next: (res: any) => {
          this.actionPermissions = {
            view: false,
            create: false,
            update: false,
            delete: false,
            ...(res?.data?.permissions || {}),
          };
          this.loadingActions = false;
        },
        error: () => {
          this.loadingActions = false;
        },
      });
  }

  resetActionPermissions() {
    this.actionPermissions = {
      view: false,
      create: false,
      update: false,
      delete: false,
    };
  }

  buildBreadcrumb(node: any) {
    const path = [];
    let current = node;

    while (current) {
      path.unshift(current);
      current = this.menuTree.find((m) => m.menu_id === current.parent_id);
    }

    this.breadcrumb = path;
  }

  /* ================= BACK ================= */

  goBack() {
    this.router.navigate(['/user-management/role-rights']);
  }

  updateSummary() {
    const vals = Object.values(this.actionMap || {});
    this.summary.total = vals.length;
    this.summary.view = vals.filter((v) => v.view).length;
    this.summary.create = vals.filter((v) => v.create).length;
    this.summary.update = vals.filter((v) => v.update).length;
    this.summary.delete = vals.filter((v) => v.delete).length;
  }
}
