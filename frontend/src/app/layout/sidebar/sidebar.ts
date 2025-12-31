import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar implements OnInit {
  isCollapsed = false;
  openSections = new Set<string>();

  sidebarSections: any[] = [];
  singleLinks: any[] = [];

  ngOnInit() {
    this.buildSidebar();
  }

  buildSidebar() {
    const permissions = JSON.parse(localStorage.getItem('permissions') || '[]');

    const canAccess = (route: string) =>
      permissions.some((p: any) => p.route === route);

    /* =====================
       SINGLE LINKS (TOP)
       ===================== */
    this.singleLinks = [
      {
        label: 'Welcome',
        route: '/',
        icon: 'fa-hand-sparkles',
        canView: true, // ✅ ALWAYS VISIBLE
      },
      {
        label: 'Employees',
        route: '/employees',
        icon: 'fa-id-badge',
        canView: canAccess('employees'),
      },
    ];

    /* =====================
       DROPDOWN SECTIONS
       ===================== */
    const sections = [
      {
        section: 'User Management',
        icon: 'fa-users',
        children: [
          {
            label: 'Roles',
            route: '/user-management/roles',
            icon: 'fa-user-shield',
            canView: canAccess('roles'),
          },
          {
            label: 'Role Rights',
            route: '/user-management/role-rights',
            icon: 'fa-key',
            canView: canAccess('role-rights'),
          },
          {
            label: 'Copy Role Rights',
            route: '/user-management/role-rights/copy',
            icon: 'fa-copy',
            canView: canAccess('user-management/role-rights/copy'),
          },
          {
            label: 'Users',
            route: '/user-management/users',
            icon: 'fa-users',
            canView: canAccess('users'),
          },
        ],
      },
      {
        section: 'Configuration',
        icon: 'fa-cog',
        children: [
          {
            label: 'Entity Types',
            route: '/entity-types',
            icon: 'fa-layer-group',
            canView: canAccess('entity-types'),
          },
          {
            label: 'Nodes',
            route: '/nodes',
            icon: 'fa-diagram-project',
            canView: canAccess('nodes'),
          },

          {
            label: 'Relationships',
            route: '/relationships',
            icon: 'fa-link',
            canView: canAccess('relationships'),
          },
          {
            label: 'Hierarchy',
            route: '/hierarchy',
            icon: 'fa-sitemap',
            canView: canAccess('hierarchy'),
          },
        ],
      },
    ];

    // remove empty sections automatically
    this.sidebarSections = sections.filter((section) =>
      section.children.some((c: any) => c.canView)
    );
  }

  toggleSidebar() {
    this.isCollapsed = !this.isCollapsed;
  }

  toggleSection(name: string) {
    this.openSections.has(name)
      ? this.openSections.delete(name)
      : this.openSections.add(name);
  }

  isOpen(name: string): boolean {
    return this.openSections.has(name);
  }
}
