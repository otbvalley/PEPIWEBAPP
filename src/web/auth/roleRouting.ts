import type { UserData } from "../../services/backendAuthService";

export type PepiRole = "customer" | "vendor" | "rider" | "admin";

export function roleHome(role?: string) {
  switch (role) {
    case "vendor":
      return "/vendor/dashboard";
    case "rider":
      return "/rider/dashboard";
    case "admin":
      return "/admin-dashboard";
    default:
      return "/customer/home";
  }
}

export function roleEntry(user?: Partial<UserData> | null) {
  const role = user?.role;
  if ((role === "vendor" || role === "rider" || role === "customer")
    && (user?.profile_completed !== true || user?.onboarding_completed !== true)) {
    return `/${role}/onboarding`;
  }
  return roleHome(role);
}

export function readStoredUser(): UserData | null {
  try {
    const raw = localStorage.getItem("userData");
    return raw ? (JSON.parse(raw) as UserData) : null;
  } catch {
    return null;
  }
}
