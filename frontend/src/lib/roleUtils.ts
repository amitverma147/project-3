import { UserRole } from "@/types/user";

// Navigation items configuration per role
export interface NavItem {
  name: string;
  href: string;
  icon?: string;
}

export const getNavigationItems = (role: UserRole): NavItem[] => {
  switch (role) {
    case "admin":
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "About", href: "/about" },
        { name: "Managers", href: "/managers" },
        { name: "Team Leads", href: "/team-leads" },
        { name: "Employees", href: "/employees" },
      ];
    case "manager":
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "About", href: "/about" },
        { name: "Team Leads", href: "/team-leads" },
        { name: "Employees", href: "/employees" },
      ];
    case "team_lead":
      return [
        { name: "Dashboard", href: "/dashboard" },
        { name: "About", href: "/about" },
        { name: "Employees", href: "/employees" },
      ];
    case "employee":
      return [{ name: "About", href: "/about" }];
    default:
      return [{ name: "About", href: "/about" }];
  }
};

// Route access control
export const canAccessRoute = (userRole: UserRole, route: string): boolean => {
  const navItems = getNavigationItems(userRole);
  return navItems.some((item) => item.href === route);
};

export const getRouteAllowedRoles = (route: string): UserRole[] => {
  switch (route) {
    case "/dashboard":
      return ["admin", "manager", "team_lead"];
    case "/managers":
      return ["admin"];
    case "/team-leads":
      return ["admin", "manager"];
    case "/employees":
      return ["admin", "manager", "team_lead"];
    case "/about":
      return ["admin", "manager", "team_lead", "employee"];
    case "/profile":
      return ["admin", "manager", "team_lead"];
    default:
      return ["admin", "manager", "team_lead", "employee"];
  }
};

// Check if user has access to specific route
export const hasRouteAccess = (userRole: UserRole, route: string): boolean => {
  const allowedRoles = getRouteAllowedRoles(route);
  return allowedRoles.includes(userRole);
};

// Get redirect path for unauthorized access
export const getRedirectPath = (userRole: UserRole): string => {
  const navItems = getNavigationItems(userRole);
  return navItems.length > 0 ? navItems[0].href : "/about";
};
