export function hasRole(userRole: string, requiredRole: string) {
  const hierarchy = ["USER", "STAFF", "ADMIN"];
  return hierarchy.indexOf(userRole) >= hierarchy.indexOf(requiredRole);
}
