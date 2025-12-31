import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../core/services/role-service';
import { RoleRightsService } from '../../../core/services/role-rights-service';
import { AlertService } from '../../../core/services/alert.service';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { AppValidators } from '../../../core/validators/app-validators-service';
import { Table } from '../../../shared/table/table';
import { Pagination } from '../../../shared/pagination/pagination';

@Component({
  selector: 'app-role-rights',
  standalone: true,
  imports: [CommonModule, FormsModule, Table, Pagination],
  templateUrl: './role-rights.html',
  styleUrl: './role-rights.css',
})
export class RoleRights {
  AppValidators = AppValidators;

  /* ------------------ DATA ------------------ */
  roles: any[] = [];
  applications: any[] = [];
  assignedRights: any[] = [];

  selectedRoleId: any = '';
  activeAppId: number | null = null;

  appTree: any[] = [];
  menuMap = new Map<number, any>();

  selectedMenuIds = new Set<number>();
  expandedNodes = new Set<any>();

  activeNode: any = null;
  breadcrumb: any[] = [];

  searchTerm = '';
  searchResults: any[] = [];
  previewChains: any[][] = [];

  filterRoleId: any = '';
  filterAppId: any = '';

  /* ------------------ AUTH ------------------ */
  canView = false;
  canCreate = false;
  canUpdate = false;
  canDelete = false;
  currentPage = 1;
  pageSize = 10;

  constructor(
    private roleService: RoleService,
    private roleRightsService: RoleRightsService,
    private alert: AlertService,
    private router: Router,
    private auth: AuthService
  ) {}

  /* ------------------ INIT ------------------ */
  ngOnInit() {
    this.canView = this.auth.hasPermission('role-rights', 'view');
    this.canCreate = this.auth.hasPermission('role-rights', 'create');
    this.canUpdate = this.auth.hasPermission('role-rights', 'update');
    this.canDelete = this.auth.hasPermission('role-rights', 'delete');

    if (!this.canView) {
      this.alert.error('You do not have permission to view role rights');
      return;
    }

    this.loadRoles();
    this.loadApplications();
    this.loadAssignedRights();
  }

  /* ------------------ LOADERS ------------------ */
  loadRoles() {
    this.roleService.getRoles().subscribe((res: any) => {
      this.roles = (res.data || []).filter(
        (r: any) => r.is_active === 1 && r.role_name !== 'SuperAdmin'
      );
    });
  }

  loadApplications() {
    this.roleRightsService.getApplications().subscribe((res: any) => {
      this.applications = res.data || [];
    });
  }

  loadAssignedRights() {
    this.roleRightsService.getAssignedRights().subscribe((res: any) => {
      this.assignedRights = res.data || [];
    });
  }

  /* ------------------ ROLE CHANGE ------------------ */
  onRoleChange() {
    this.resetState();
    if (!this.selectedRoleId) return;

    this.appTree = this.applications.map((app: any) => ({
      id: `app-${app.app_id}`,
      app_id: app.app_id,
      menu_name: app.app_name,
      isApp: true,
      children: [],
    }));
  }

  resetState() {
    this.appTree = [];
    this.menuMap.clear();
    this.selectedMenuIds.clear();
    this.expandedNodes.clear();
    this.activeNode = null;
    this.breadcrumb = [];
    this.activeAppId = null;
  }

  /* ------------------ TREE ------------------ */
  getNodeKey(node: any) {
    return node.isApp ? node.id : node.menu_id;
  }

  toggleExpand(node: any) {
    const key = this.getNodeKey(node);

    this.expandedNodes.has(key)
      ? this.expandedNodes.delete(key)
      : this.expandedNodes.add(key);

    if (node.isApp && node.children.length === 0) {
      this.loadMenus(node);
      this.activeAppId = node.app_id;
    }

    this.activeNode = node;
    this.buildBreadcrumb(node);
  }

  loadMenus(appNode: any) {
    this.roleRightsService.getMenus(appNode.app_id).subscribe((res: any) => {
      appNode.children = this.buildMenuTree(res.data || []);
      this.loadRoleRights(appNode.app_id);
    });
  }

  buildMenuTree(flat: any[]) {
    const map = new Map<number, any>();
    const tree: any[] = [];

    flat.forEach((m) => {
      m.children = [];
      m.isApp = false;

      // 🔥 permissions per leaf
      m.permissions = {
        view: false,
        create: false,
        update: false,
        delete: false,
      };

      map.set(m.menu_id, m);
      this.menuMap.set(m.menu_id, m);
    });

    flat.forEach((m) => {
      m.parent_id ? map.get(m.parent_id)?.children.push(m) : tree.push(m);
    });

    return tree;
  }

  loadRoleRights(appId: number) {
    this.roleRightsService
      .getRoleRights(this.selectedRoleId, appId)
      .subscribe((res: any) => {
        // 1️⃣ menu ids (old logic)
        (res.data || []).forEach((menuId: number) => {
          this.selectedMenuIds.add(menuId);
        });

        // 2️⃣ LOAD ACTION PERMISSIONS (THIS WAS MISSING)
        this.menuMap.forEach((node, menuId) => {
          if (!node?.route) return;

          this.roleRightsService
            .getRoleMenuActions(this.selectedRoleId, menuId)
            .subscribe((permRes: any) => {
              if (permRes?.data?.permissions) {
                const p = permRes.data.permissions;

                node.permissions = {
                  view: !!p.view,
                  create: !!p.create,
                  update: !!p.update,
                  delete: !!p.delete,
                };

                // 🔥🔥🔥 THIS IS THE FIX
                if (p.view || p.create || p.update || p.delete) {
                  this.selectedMenuIds.add(menuId);
                }

                this.buildPreviewChains();
              }
            });
        });
      });
  }

  /* ------------------ MENU TOGGLE ------------------ */
  toggleMenu(node: any, checked: boolean) {
    if (!checked) {
      this.removeNodeWithChildren(node); // ✅ correct
    } else {
      this.selectedMenuIds.add(node.menu_id);
      this.selectParents(node);
    }

    this.buildPreviewChains();
  }

  private removeNodeWithChildren(node: any) {
    // remove menu id
    this.selectedMenuIds.delete(node.menu_id);

    // 🔥 reset permissions if leaf
    if (node.permissions) {
      node.permissions.view = false;
      node.permissions.create = false;
      node.permissions.update = false;
      node.permissions.delete = false;
    }

    // recurse children
    if (node.children?.length) {
      node.children.forEach((child: any) => {
        this.removeNodeWithChildren(child);
      });
    }
  }

  isChecked(id: number) {
    return this.selectedMenuIds.has(id);
  }

  private unselectAllChildren(node: any) {
    if (!node?.children?.length) return;
    node.children.forEach((c: any) => {
      this.selectedMenuIds.delete(c.menu_id);
      this.unselectAllChildren(c);
    });
  }

  /* ------------------ PERMISSION LOGIC ------------------ */
  onPermissionToggle(node: any, changed?: string) {
    // 🔹 CRUD → View auto ON
    if (
      node.permissions.create ||
      node.permissions.update ||
      node.permissions.delete
    ) {
      node.permissions.view = true;
    }

    // 🔹 View OFF → CRUD OFF
    if (changed === 'view' && !node.permissions.view) {
      node.permissions.create = false;
      node.permissions.update = false;
      node.permissions.delete = false;
    }

    // 🔥🔥🔥 MAIN FIX
    const hasAnyPermission =
      node.permissions.view ||
      node.permissions.create ||
      node.permissions.update ||
      node.permissions.delete;

    if (hasAnyPermission) {
      // menu select
      this.selectedMenuIds.add(node.menu_id);

      // parents select
      this.selectParents(node);
    } else {
    }

    this.buildPreviewChains();
  }

  /* ------------------ VALIDATION ------------------ */
  private hasInvalidParentSelection(): boolean {
    for (const id of this.selectedMenuIds) {
      const node = this.menuMap.get(id);
      if (node?.children?.length) {
        const childSelected = node.children.some((c: any) =>
          this.selectedMenuIds.has(c.menu_id)
        );
        if (!childSelected) return true;
      }
    }
    return false;
  }

  /* ------------------ SINGLE SAVE ------------------ */
  saveRights() {
    if (!this.selectedRoleId || !this.activeAppId) {
      this.alert.error('Select role & application');
      return;
    }

    if (this.selectedMenuIds.size === 0) {
      this.alert.error('Please select at least one menu before saving');
      return;
    }

    if (this.hasInvalidParentSelection()) {
      this.alert.error(
        'Parent menu selected Already But at least select one Sub-menu before saving'
      );
      return;
    }

    // 1️⃣ SAVE MENUS (OLD ROUTE)
    this.roleRightsService
      .assignRights({
        role_id: this.selectedRoleId,
        app_id: this.activeAppId,
        menu_ids: Array.from(this.selectedMenuIds),
      })
      .subscribe(() => {
        // 2️⃣ SAVE ACTION PERMISSIONS (OLD ROUTE)
        Array.from(this.selectedMenuIds).forEach((menuId) => {
          const node = this.menuMap.get(menuId);

          if (node?.route && node.permissions) {
            // auto enforce view
            if (
              node.permissions.create ||
              node.permissions.update ||
              node.permissions.delete
            ) {
              node.permissions.view = true;
            }

            this.roleRightsService
              .saveRoleMenuActions(
                this.selectedRoleId,
                menuId,
                node.permissions
              )
              .subscribe();
          }
        });

        this.alert.success('Rights & permissions saved successfully');
        this.loadAssignedRights();
      });
  }

  /* ------------------ BREADCRUMB ------------------ */
  buildBreadcrumb(node: any) {
    const path: any[] = [];
    let current = node;

    while (current) {
      path.unshift(current);
      current = this.findParent(current);
    }
    this.breadcrumb = path;
  }

  findParent(node: any) {
    for (const app of this.appTree) {
      if (app.children.includes(node)) return app;
      for (const m of app.children) {
        if (m.children?.includes(node)) return m;
      }
    }
    return null;
  }

  /* ------------------ SEARCH ------------------ */
  onSearchChange() {
    this.searchResults = [];
    if (!this.searchTerm.trim()) return;

    const term = this.searchTerm.toLowerCase();

    const traverse = (node: any, path: any[]) => {
      const newPath = [...path, node];
      if (node.menu_name?.toLowerCase().includes(term)) {
        this.searchResults.push({ node, path: newPath });
      }
      node.children?.forEach((c: any) => traverse(c, newPath));
    };

    this.appTree.forEach((app) => traverse(app, []));
  }

  selectFromSearch(result: any) {
    result.path.forEach((p: any) => this.expandedNodes.add(this.getNodeKey(p)));

    if (!result.node.isApp) {
      this.selectedMenuIds.add(result.node.menu_id);
    }

    this.activeNode = result.node;
    this.breadcrumb = result.path;
    this.buildPreviewChains();

    this.searchResults = [];
    this.searchTerm = '';
  }

  /* ------------------ PREVIEW ------------------ */
  buildPreviewChains() {
    const chains: any[][] = [];

    this.selectedMenuIds.forEach((id) => {
      const node = this.menuMap.get(id);
      if (!node) return;

      const chain: any[] = [];
      let current: any = node;

      while (current) {
        chain.unshift(current);
        current = this.findParent(current);
      }

      if (
        !chains.some(
          (c) =>
            c.length === chain.length &&
            c.every((x, i) => x.menu_id === chain[i].menu_id)
        )
      ) {
        chains.push(chain);
      }
    });

    this.previewChains = chains;
  }

  /* ------------------ TABLE FILTER ------------------ */
  get filteredAssignedRights() {
    return this.assignedRights.filter((row: any) => {
      if (row.role_name === 'SuperAdmin') return false;

      const roleMatch = !this.filterRoleId || row.role_id == this.filterRoleId;

      const appMatch = !this.filterAppId || row.app_id == this.filterAppId;

      return roleMatch && appMatch;
    });
  }

  /* ------------------ VIEW / DELETE ------------------ */
  viewRights(row: any) {
    this.router.navigate([
      '/user-management/role-rights/view',
      row.role_id,
      row.app_id,
    ]);
  }

  deleteRights(row: any) {
    this.alert.confirm('Are you sure?').then((r) => {
      if (!r.isConfirmed) return;

      this.roleRightsService
        .deleteAssignedRights(row.role_id, row.app_id)
        .subscribe(() => {
          this.loadAssignedRights();

          if (
            this.selectedRoleId == row.role_id &&
            this.activeAppId == row.app_id
          ) {
            this.resetState();
            this.selectedRoleId = '';
          }

          this.alert.success('Assigned rights deleted successfully');
        });
    });
  }

  expandAll() {
    this.appTree.forEach((app) => {
      this.expandedNodes.add(this.getNodeKey(app));

      if (app.isApp && app.children.length === 0) {
        this.loadMenus(app);
      }
    });

    this.menuMap.forEach((_, id) => {
      this.expandedNodes.add(id);
    });
  }

  collapseAll() {
    this.expandedNodes.clear();
    this.activeNode = null;
    this.breadcrumb = [];
  }

  getRoleName() {
    return (
      this.roles.find((r) => r.role_id == this.selectedRoleId)?.role_name || '-'
    );
  }

  getAppName() {
    return (
      this.applications.find((a) => a.app_id === this.activeAppId)?.app_name ||
      '-'
    );
  }

  private selectParents(node: any) {
    let parent = this.findParent(node);

    while (parent) {
      if (!parent.isApp && parent.menu_id) {
        this.selectedMenuIds.add(parent.menu_id);
      }

      if (parent.isApp && parent.app_id) {
        this.activeAppId = parent.app_id;
        break;
      }

      parent = this.findParent(parent);
    }
  }

  isAppChecked(app: any): boolean {
    return app.children?.some((child: any) =>
      this.isNodeOrDescendantChecked(child)
    );
  }

  private isNodeOrDescendantChecked(node: any): boolean {
    if (this.selectedMenuIds.has(node.menu_id)) return true;
    return node.children?.some((c: any) => this.isNodeOrDescendantChecked(c));
  }

  isNodeChecked(node: any): boolean {
    // leaf
    if (!node.children || node.children.length === 0) {
      return this.selectedMenuIds.has(node.menu_id);
    }

    // parent menu OR app
    return node.children.some((child: any) => this.isNodeChecked(child));
  }

  get pagedAssignedRights() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    return this.filteredAssignedRights.slice(start, end);
  }

  onPageChange(page: number) {
    this.currentPage = page;
  }
}
