import { useState, type FormEvent } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { backendAuthService as authService } from "../../services/backendAuthService";
import { roleHome } from "./roleRouting";
import { AuthField, AuthShell } from "./AuthShell";

export default function RoleLogin() {
  const navigate = useNavigate(); const location = useLocation(); const [params] = useSearchParams();
  const requested = params.get("role"); const signupRole = requested === "vendor" || requested === "rider" ? requested : "customer";
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [show, setShow] = useState(false); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); setError(""); setLoading(true);
    try { const result = await authService.login(email, password); const role = result.user?.role; const returnTo = (location.state as { from?: string } | null)?.from; navigate(role && returnTo?.startsWith(`/${role}/`) && !returnTo.startsWith("//") ? returnTo : roleHome(role), { replace: true }); }
    catch (err) { setError(err instanceof Error ? err.message : "We could not sign you in. Check your details and try again."); }
    finally { setLoading(false); }
  }
  return <AuthShell mode="login" title="Welcome back" copy="Enter your details. We will take you to the right Pepi workspace.">
    <form className="auth-form" onSubmit={submit}>
      <AuthField label="Email address"><div className="auth-control"><Mail/><input type="email" autoComplete="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com" required/></div></AuthField>
      <AuthField label="Password"><div className="auth-control"><LockKeyhole/><input type={show ? "text" : "password"} autoComplete="current-password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" required/><button type="button" aria-label={show ? "Hide password" : "Show password"} onClick={() => setShow(!show)}>{show ? <EyeOff/> : <Eye/>}</button></div></AuthField>
      <div style={{ textAlign: "right" }}><Link className="auth-inline-link" to="/forgot-password">Forgot password?</Link></div>
      {error && <div role="alert" className="auth-error">{error}</div>}
      <button className="auth-primary" disabled={loading}>{loading ? "Signing in..." : "Sign in"}<ArrowRight/></button>
    </form>
    <p className="auth-foot">New to Pepi? <Link to={`/signup?role=${signupRole}`}>Create an account</Link></p>
  </AuthShell>;
}
