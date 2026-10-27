import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import api, { refreshRoleSession } from "../../services/api";
import { decodeJwtToken, type UserData } from "../../services/backendAuthService";
import WebShell from "../components/WebShell";
import { roleHome, type PepiRole } from "./roleRouting";

export default function ProtectedWorkspace({ role }: { role: Exclude<PepiRole, "admin"> }) {
  const [state, setState] = useState<{ checking: boolean; user: UserData | null }>({ checking: true, user: null });
  const location = useLocation();
  useEffect(() => {
    let active = true;
    async function confirm() {
      try {
        let token = localStorage.getItem("authToken");
        let claims = token ? decodeJwtToken(token) : null;
        if (!claims || !claims.exp || claims.exp * 1000 <= Date.now()) {
          token = await refreshRoleSession();
          claims = token ? decodeJwtToken(token) : null;
        }
        if (!claims || claims.role !== role) throw new Error("Wrong role");
        const { data } = await api.get("/auth/me");
        if (data.role !== role) throw new Error("Wrong role");
        const user = { ...data, id: data.user_id, role: data.role } as UserData;
        if (active) setState({ checking: false, user });
      } catch {
        if (active) setState({ checking: false, user: null });
      }
    }
    confirm();
    return () => { active = false; };
  }, [role]);
  useEffect(() => {
    const updateSession = (event: Event) => {
      const user = (event as CustomEvent<UserData>).detail;
      if (user?.role === role) setState({ checking: false, user });
    };
    window.addEventListener("pepi-session-updated", updateSession);
    return () => window.removeEventListener("pepi-session-updated", updateSession);
  }, [role]);
  if (state.checking) return <div className="pepi-loading" role="status">Loading your workspace…</div>;
  if (!state.user) {
    const token = localStorage.getItem("authToken");
    const claims = token ? decodeJwtToken(token) : null;
    if (claims?.role && claims.role !== role) return <Navigate to={roleHome(claims.role)} replace />;
    return <Navigate to={`/signin?role=${role}`} replace state={{ from: location.pathname + location.search }} />;
  }
  const onboardingPath = `/${role}/onboarding`;
  const onboardingComplete = state.user.profile_completed === true && state.user.onboarding_completed === true;
  if (!onboardingComplete && location.pathname !== onboardingPath) {
    return <Navigate to={onboardingPath} replace state={{ from: location.pathname + location.search }} />;
  }
  if (onboardingComplete && location.pathname === onboardingPath) {
    return <Navigate to={roleHome(role)} replace />;
  }
  return <WebShell role={role} user={state.user} />;
}
