import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, Mail, Phone } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { backendAuthService } from "../../services/backendAuthService";
import { roleEntry } from "./roleRouting";
import { AuthField, AuthShell } from "./AuthShell";

type Country = { name: string; phone_code: string };
const fallbackCountries: Country[] = [
  { name: "Nigeria", phone_code: "+234" },
  { name: "Ghana", phone_code: "+233" },
  { name: "Kenya", phone_code: "+254" },
];

function messageFor(error: unknown) {
  return (error as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail
    || (error as Error).message
    || "Something went wrong. Please try again.";
}

export default function CustomerPhoneAuth({ mode = "signin" }: { mode?: "signin" | "signup" }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [stage, setStage] = useState<"phone" | "code">("phone");
  const [countries, setCountries] = useState<Country[]>(fallbackCountries);
  const [countryCode, setCountryCode] = useState("+234");
  const [phone, setPhone] = useState(() => localStorage.getItem("customerRememberedPhone") || "");
  const [email, setEmail] = useState("");
  const [fullPhone, setFullPhone] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    api.get<Country[]>("/location/countries").then(({ data }) => {
      if (Array.isArray(data) && data.length) setCountries(data.filter(country => country.phone_code));
    }).catch(() => undefined);
  }, []);

  async function requestCode(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const normalized = `${countryCode}${phone.replace(/\D/g, "").replace(/^0+/, "")}`;
      const response = await backendAuthService.startCustomerPhoneAuth(normalized, mode === "signup" ? email.trim() : undefined);
      localStorage.setItem("customerRememberedPhone", phone);
      setFullPhone(normalized); setStage("code");
      setNotice(response.email_sent ? `Enter the six-digit code sent to ${normalized} and your email.` : `Enter the six-digit code sent to ${normalized}.`);
    } catch (requestError) { setError(messageFor(requestError)); }
    finally { setBusy(false); }
  }

  async function verifyCode(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const result = await backendAuthService.verifyCustomerPhoneOTP(fullPhone, code);
      const entry = roleEntry(result.user);
      const returnTo = (location.state as { from?: string } | null)?.from;
      const destination = entry === "/customer/home" && returnTo?.startsWith("/customer/") && !returnTo.startsWith("//") ? returnTo : entry;
      navigate(destination, { replace: true });
    } catch (requestError) { setError(messageFor(requestError)); }
    finally { setBusy(false); }
  }

  return <AuthShell mode="login" title={stage === "phone" ? (mode === "signup" ? "Start with your phone" : "Welcome back") : "Enter your code"} copy={stage === "phone" ? "Enter your phone number to continue with Pepi." : `We sent a verification code to ${fullPhone}.`}>
    {notice && <p className="auth-notice">{notice}</p>}
    {error && <p role="alert" className="auth-error">{error}</p>}
    {stage === "phone" ? <form className="auth-form" onSubmit={requestCode}>
      <AuthField label="Phone number"><div className="auth-control auth-phone-control"><Phone/><select aria-label="Country code" value={countryCode} onChange={event => setCountryCode(event.target.value)}>{countries.map(country => <option value={country.phone_code} key={`${country.name}-${country.phone_code}`}>{country.phone_code} {country.name}</option>)}</select><input type="tel" inputMode="tel" autoComplete="tel-national" value={phone} onChange={event => setPhone(event.target.value)} placeholder="800 000 0000" required/></div></AuthField>
      {mode === "signup" && <AuthField label="Email address"><div className="auth-control"><Mail/><input type="email" autoComplete="email" value={email} onChange={event => setEmail(event.target.value)} placeholder="you@example.com" required/></div></AuthField>}
      <p className="auth-foot" style={{ margin: 0 }}>By continuing, you agree to the <Link to="/terms">Terms</Link> and <Link to="/privacy">Privacy Policy</Link>.</p>
      <button className="auth-primary" disabled={busy}>{busy ? "Sending code..." : "Continue"}<ArrowRight/></button>
    </form> : <form className="auth-form" onSubmit={verifyCode}>
      <AuthField label="Verification code"><div className="auth-control"><input className="otp-input" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]{6}" maxLength={6} value={code} onChange={event => setCode(event.target.value.replace(/\D/g, ""))} placeholder="000000" required/></div></AuthField>
      <button className="auth-primary" disabled={busy || code.length !== 6}>{busy ? "Checking code..." : "Continue"}<ArrowRight/></button>
      <button className="auth-secondary" type="button" onClick={() => { setStage("phone"); setCode(""); setError(""); }}><ArrowLeft/> Change phone number</button>
    </form>}
    <p className="auth-foot"><Link to="/customer/search">Browse meals without signing in</Link></p>
  </AuthShell>;
}
