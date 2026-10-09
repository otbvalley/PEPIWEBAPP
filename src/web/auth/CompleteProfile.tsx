import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { refreshRoleSession } from "../../services/api";
import type { UserData } from "../../services/backendAuthService";
import { readStoredUser, roleHome } from "./roleRouting";
import { AuthField, AuthShell } from "./AuthShell";

type PartnerRole = "vendor" | "rider";
type Place = { name?: string; country_name?: string; state_name?: string; city_name?: string } | string;
type Draft = { step: number; form: Record<string, string> };

const nameOf = (place: Place) => typeof place === "string" ? place : place.name || place.country_name || place.state_name || place.city_name || "";
const errorMessage = (error: unknown) => (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "We could not save your profile. Please try again.";

function SearchSelect({ label, value, options, onChange, placeholder }: { label: string; value: string; options: Place[]; onChange: (value: string) => void; placeholder: string }) {
  const id = `choices-${label.toLowerCase().replace(/\s/g, "-")}`;
  return <AuthField label={label}><div className="auth-control"><MapPin/><input list={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" required/><datalist id={id}>{options.map(option => { const name = nameOf(option); return <option value={name} key={name}/>; })}</datalist></div></AuthField>;
}

function readDraft(key: string): Draft | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") as Draft | null; } catch { return null; }
}

export default function CompleteProfile({ role }: { role: PartnerRole }) {
  const user = useMemo(readStoredUser, []);
  const navigate = useNavigate();
  const draftKey = `pepi-${role}-onboarding-${user?.id || "unknown"}`;
  const savedDraft = useMemo(() => readDraft(draftKey), [draftKey]);
  const total = role === "vendor" ? 4 : 3;
  const [step, setStep] = useState(Math.min(savedDraft?.step || 1, total));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(savedDraft ? "Your saved progress has been restored." : "");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({ country: "Nigeria", ...savedDraft?.form });
  const [countries, setCountries] = useState<Place[]>([]);
  const [states, setStates] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);
  const set = (name: string) => (value: string) => setForm(current => ({ ...current, [name]: value }));
  const field = (name: string, label: string, type = "text", required = true) => <AuthField label={label} key={name}><div className="auth-control"><input type={type} value={form[name] || ""} onChange={event => set(name)(event.target.value)} required={required}/></div></AuthField>;

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify({ step, form } satisfies Draft)); }, [draftKey, form, step]);
  useEffect(() => { api.get("/location/countries").then(({ data }) => setCountries(data || [])).catch(() => setCountries(["Nigeria"])); }, []);
  useEffect(() => { if (!form.country) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states`).then(({ data }) => setStates(data || [])).catch(() => setStates([])); }, [form.country]);
  useEffect(() => { if (!form.country || !form.state) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states/${encodeURIComponent(form.state)}/cities`).then(({ data }) => setCities(data || [])).catch(() => setCities([])); }, [form.country, form.state]);

  useEffect(() => {
    let active = true;
    async function hydrate() {
      if (!user) { navigate(`/${role}/login`, { replace: true }); return; }
      try {
        const { data: current } = await api.get<UserData>("/auth/me");
        if (!active) return;
        localStorage.setItem("userData", JSON.stringify({ ...user, ...current }));
        if (current.profile_completed === true && current.onboarding_completed === true) {
          localStorage.removeItem(draftKey);
          navigate(roleHome(role), { replace: true });
          return;
        }
        const id = role === "vendor" ? current.vendor_id : current.rider_id;
        if (!id) return;
        const { data: profile } = role === "vendor" ? await api.get(`/vendors/${id}`) : await api.get("/riders/profile");
        if (!active) return;
        setForm(existing => {
          const next = { ...existing };
          const aliases: Record<string, string> = { country_name: "country", business_description: "description" };
          Object.entries(profile || {}).forEach(([key, value]) => {
            const target = aliases[key] || key;
            if (!next[target] && value != null && typeof value !== "object") next[target] = String(value);
          });
          return next;
        });
      } catch {
        setNotice("Your progress is saved on this device. You can continue setup now.");
      } finally { if (active) setLoading(false); }
    }
    void hydrate();
    return () => { active = false; };
  }, [draftKey, navigate, role, user]);

  function advance(event: FormEvent) { event.preventDefault(); setError(""); setNotice(""); setStep(current => Math.min(current + 1, total)); window.scrollTo({ top: 0, behavior: "smooth" }); }
  function back() { setError(""); setStep(current => Math.max(current - 1, 1)); }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!user) return;
    setBusy(true); setError("");
    try {
      if (role === "vendor") {
        await api.post("/vendors/", {
          user_id: user.id, firstname: user.firstname || "", lastname: user.lastname || "", full_name: `${user.firstname || ""} ${user.lastname || ""}`.trim(), email: user.email,
          phone: user.phone || form.business_phone, business_name: form.business_name, business_email: form.business_email || user.email, business_phone: form.business_phone,
          business_address: form.business_address, business_category: form.business_category, profession: form.profession, vendor_type: form.vendor_type,
          years_of_experience: Number(form.years_of_experience || 0), country_name: form.country, state: form.state, city: form.city, zip: form.zip,
          business_description: form.description, day_from: form.day_from, day_to: form.day_to, opening_time: form.opening_time, closing_time: form.closing_time,
          total_workers: Number(form.total_workers || 0), bank_name: form.bank_name, bank_code: form.bank_code, account_number: form.account_number, account_name: form.account_name,
          corporate_terms_accepted: true,
        });
      } else {
        await api.post("/riders/", {
          user_id: user.id, firstname: user.firstname || "", lastname: user.lastname || "", email: user.email, phone: form.phone || user.phone || "",
          gender: form.gender, vehicle_type: form.vehicle_type, vehicle_brand: form.vehicle_brand, plate_number: form.plate_number,
          state: form.state, city: form.city, address: form.address, zip: form.zip,
          next_of_kin_name: form.next_of_kin_name, next_of_kin_phone: form.next_of_kin_phone,
          previous_work: form.previous_work || null, work_duration: form.work_duration || null, referral_code: form.referral_code || null, delivery_range: Number(form.delivery_range || 10),
        });
      }
      await refreshRoleSession();
      const { data: current } = await api.get<UserData>("/auth/me");
      localStorage.setItem("userData", JSON.stringify({ ...user, ...current }));
      if (current.profile_completed !== true || current.onboarding_completed !== true) throw new Error("Profile completion was not confirmed");
      localStorage.removeItem(draftKey);
      navigate(roleHome(role), { replace: true });
    } catch (requestError) {
      setError(errorMessage(requestError));
      setNotice("Your entries are saved. Nothing has been lost.");
    } finally { setBusy(false); }
  }

  const titles = role === "vendor"
    ? ["Tell us about your kitchen", "Where can customers find you?", "Set your operating details", "Add your settlement account"]
    : ["Tell us how you deliver", "Where are you based?", "Complete your rider profile"];
  const actions = (content: ReactNode, final = false) => <form className="auth-form" onSubmit={final ? submit : advance}>{content}<div className="auth-actions">{step > 1 && <button type="button" className="auth-secondary" onClick={back}><ArrowLeft/> Back</button>}<button className="auth-primary" disabled={busy || loading}>{busy ? "Saving details..." : final ? "Finish setup" : "Continue"}<ArrowRight/></button></div></form>;

  return <AuthShell title={titles[step - 1]} copy="Complete your details once, then continue straight to your workspace." step={step} total={total}>
    {error && <p role="alert" className="auth-error">{error}</p>}
    {notice && <p className="auth-notice">{notice}</p>}
    {role === "vendor" && step === 1 && actions(<>{field("business_name", "Business name")}<div className="auth-grid">{field("business_email", "Business email", "email")}{field("business_phone", "Business phone", "tel")}</div><div className="auth-grid">{field("business_category", "Business category")}{field("vendor_type", "Vendor type")}</div><div className="auth-grid">{field("profession", "Profession")}{field("years_of_experience", "Years of experience", "number")}</div></>)}
    {role === "vendor" && step === 2 && actions(<><SearchSelect label="Country" value={form.country || ""} options={countries} onChange={set("country")} placeholder="Search countries"/><div className="auth-grid"><SearchSelect label="State" value={form.state || ""} options={states} onChange={set("state")} placeholder="Search states"/><SearchSelect label="City" value={form.city || ""} options={cities} onChange={set("city")} placeholder="Search cities"/></div>{field("business_address", "Business address")} {field("zip", "Postcode", "text", false)}</>)}
    {role === "vendor" && step === 3 && actions(<>{field("description", "Business description")}<div className="auth-grid">{field("day_from", "Opening day")}{field("day_to", "Closing day")}</div><div className="auth-grid">{field("opening_time", "Opening time", "time")}{field("closing_time", "Closing time", "time")}</div>{field("total_workers", "Number of workers", "number")}</>)}
    {role === "vendor" && step === 4 && actions(<>{field("bank_name", "Bank name")}{field("bank_code", "Bank code")}<div className="auth-grid">{field("account_number", "Account number")}{field("account_name", "Account name")}</div><label className="auth-check"><input type="checkbox" required/><span>I confirm these business and settlement details are correct.</span></label></>, true)}
    {role === "rider" && step === 1 && actions(<>{field("phone", "Phone number", "tel")}<div className="auth-grid">{field("gender", "Gender")}{field("vehicle_type", "Vehicle type")}</div><div className="auth-grid">{field("vehicle_brand", "Vehicle brand")}{field("plate_number", "Plate number")}</div></>)}
    {role === "rider" && step === 2 && actions(<><SearchSelect label="Country" value={form.country || ""} options={countries} onChange={set("country")} placeholder="Search countries"/><div className="auth-grid"><SearchSelect label="State" value={form.state || ""} options={states} onChange={set("state")} placeholder="Search states"/><SearchSelect label="City" value={form.city || ""} options={cities} onChange={set("city")} placeholder="Search cities"/></div>{field("address", "Home address")} {field("zip", "Postcode", "text", false)}</>)}
    {role === "rider" && step === 3 && actions(<><div className="auth-grid">{field("next_of_kin_name", "Next of kin name")}{field("next_of_kin_phone", "Next of kin phone", "tel")}</div><div className="auth-grid">{field("previous_work", "Previous delivery work", "text", false)}{field("work_duration", "Work duration", "text", false)}</div><div className="auth-grid">{field("delivery_range", "Delivery range", "text", false)}{field("referral_code", "Referral code", "text", false)}</div><label className="auth-check"><input type="checkbox" required/><span>I confirm these rider details are correct.</span></label></>, true)}
  </AuthShell>;
}
