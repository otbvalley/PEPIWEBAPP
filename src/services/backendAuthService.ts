import api from "./api";

export interface UserData {
  id: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  phone: string | null;
  is_verified: boolean;
  role: string;
  vendor_id?: string;
  rider_id?: string;
  profile_completed?: boolean;
  onboarding_completed?: boolean;
}

export interface JwtPayload {
  sub: string;
  user_id: string;
  email: string;
  role: string;
  firstname?: string;
  lastname?: string;
  vendor_id?: string;
  rider_id?: string;
  profile_completed?: boolean;
  onboarding_completed?: boolean;
  exp: number;
  admin_role?: "admin" | "super_admin";
  permissions?: string[];
}

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  user?: Partial<UserData>;
  vendor?: { id: string };
  rider?: { id: string };
};
type LoginResponse = { success: boolean; message: string; token: string; user: UserData };

export function decodeJwtToken(token: string): JwtPayload | null {
  try {
    const encoded = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const bytes = Uint8Array.from(atob(encoded), character => character.charCodeAt(0));
    return JSON.parse(new TextDecoder().decode(bytes)) as JwtPayload;
  } catch { return null; }
}

function authError(error: unknown): Error {
  const response = (error as { response?: { data?: { detail?: string } } }).response;
  return new Error(response?.data?.detail || (error as Error).message || "Authentication failed.");
}

function saveSession(data: AuthResponse): LoginResponse {
  if (!data.access_token) throw new Error("Authentication response has no access token.");
  const claims = decodeJwtToken(data.access_token);
  if (!claims?.user_id || !claims.role) throw new Error("Authentication response has invalid claims.");
  const user: UserData = {
    id: claims.user_id,
    email: claims.email || data.user?.email || "",
    firstname: data.user?.firstname ?? claims.firstname ?? null,
    lastname: data.user?.lastname ?? claims.lastname ?? null,
    phone: data.user?.phone ?? null,
    is_verified: data.user?.is_verified ?? true,
    role: claims.role,
    vendor_id: claims.vendor_id || data.vendor?.id,
    rider_id: claims.rider_id || data.rider?.id,
    profile_completed: claims.profile_completed,
    onboarding_completed: claims.onboarding_completed,
  };
  localStorage.setItem("authToken", data.access_token);
  if (data.refresh_token) localStorage.setItem("refreshToken", data.refresh_token);
  localStorage.setItem("userData", JSON.stringify(user));
  return { success: true, message: "Login successful", token: data.access_token, user };
}

async function loginAt(path: string, email: string, password: string): Promise<LoginResponse> {
  try { const { data } = await api.post<AuthResponse>(path, { email, password, platform: "web" }); return saveSession(data); }
  catch (error) { throw authError(error); }
}

export const backendAuthService = {
  login: (email: string, password: string) => loginAt("/auth/login", email, password),
  customerLogin: (email: string, password: string) => loginAt("/auth/customer/login", email, password),
  vendorLogin: (email: string, password: string) => loginAt("/auth/vendor/login", email, password),
  riderLogin: (email: string, password: string) => loginAt("/auth/rider/login", email, password),
  async register(data: { email: string; password: string; firstname: string; lastname: string; phone: string; user_type: "customer" | "vendor" | "rider" }) {
    try { const response = await api.post("/auth/register", data); return response.data as { user_id: string; email: string }; }
    catch (error) { throw authError(error); }
  },
  async verifyOTP(email: string, otp_code: string, auth_context?: "customer" | "vendor" | "rider"): Promise<LoginResponse> {
    try { const { data } = await api.post<AuthResponse>("/auth/verify-otp", { email, otp_code, auth_context, platform: "web" }); return saveSession(data); }
    catch (error) { throw authError(error); }
  },
};
