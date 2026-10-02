import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api, { refreshRoleSession } from "../../services/api";
import { readStoredUser, roleHome } from "./roleRouting";
import { AuthField, AuthShell } from "./AuthShell";

type Place = { name?: string; country_name?: string; state_name?: string; city_name?: string } | string;
const nameOf = (place: Place) => typeof place === "string" ? place : place.name || place.country_name || place.state_name || place.city_name || "";

function SearchSelect({ label, value, options, onChange, placeholder }: { label: string; value: string; options: Place[]; onChange: (value: string) => void; placeholder: string }) {
  const id = `choices-${label.toLowerCase().replace(/\s/g, "-")}`;
  return <AuthField label={label}><div className="auth-control"><MapPin/><input list={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" required/><datalist id={id}>{options.map(option => { const name = nameOf(option); return <option value={name} key={name}/>; })}</datalist></div></AuthField>;
}

export default function CompleteProfile({ role }: { role: "vendor" | "rider" }) {
  const user = readStoredUser(); const navigate = useNavigate();
  const [step, setStep] = useState(1); const [error, setError] = useState(""); const [busy, setBusy] = useState(false); const [form, setForm] = useState<Record<string, string>>({ country: "Nigeria" });
  const [countries, setCountries] = useState<Place[]>([]); const [states, setStates] = useState<Place[]>([]); const [cities, setCities] = useState<Place[]>([]);
  const set = (name: string) => (value: string) => setForm(current => ({ ...current, [name]: value }));
  const field = (name: string, label: string, type = "text") => <AuthField label={label} key={name}><div className="auth-control"><input type={type} value={form[name] || ""} onChange={event => set(name)(event.target.value)} required/></div></AuthField>;

  useEffect(() => { api.get("/location/countries").then(({ data }) => setCountries(data || [])).catch(() => setCountries(["Nigeria"])); }, []);
  useEffect(() => { if (!form.country) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states`).then(({ data }) => setStates(data || [])).catch(() => setStates([])); }, [form.country]);
  useEffect(() => { if (!form.country || !form.state) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states/${encodeURIComponent(form.state)}/cities`).then(({ data }) => setCities(data || [])).catch(() => setCities([])); }, [form.country, form.state]);

  function advance(event: FormEvent) { event.preventDefault(); setError(""); setStep(2); }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!user) return; setBusy(true); setError("");
    try {
      if (role === "vendor") await api.post("/vendors/", { user_id: user.id, firstname: user.firstname || "", lastname: user.lastname || "", email: user.email, phone: user.phone || form.business_phone, full_name: `${user.firstname || ""} ${user.lastname || ""}`.trim(), business_name: form.business_name, business_email: form.business_email || user.email, business_phone: form.business_phone, business_address: form.business_address, business_category: form.business_category, country_name: form.country, state: form.state, city: form.city });
      else await api.post("/riders/", { user_id: user.id, firstname: user.firstname || "", lastname: user.lastname || "", email: user.email, phone: form.phone || user.phone || "", gender: form.gender, vehicle_type: form.vehicle_type, vehicle_brand: form.vehicle_brand, plate_number: form.plate_number, address: form.address, state: form.state, city: form.city, next_of_kin_name: form.next_of_kin_name, next_of_kin_phone: form.next_of_kin_phone });
      await refreshRoleSession(); navigate(roleHome(role), { replace: true });
    } catch (err) { setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "We could not save your profile. Please try again."); } finally { setBusy(false); }
  }
  return <AuthShell title={role === "vendor" ? (step === 1 ? "Tell us about your kitchen" : "Where can customers find you?") : (step === 1 ? "Tell us how you deliver" : "Finish your rider details")} copy={step === 1 ? "These details help us prepare the right workspace for you." : "Search the location lists and confirm the remaining information."} step={step} total={2}>
    {error && <p role="alert" className="auth-error">{error}</p>}
    {step === 1 ? <form className="auth-form" onSubmit={advance}>{role === "vendor" ? <>{field("business_name", "Business name")}<div className="auth-grid">{field("business_email", "Business email", "email")}{field("business_phone", "Business phone", "tel")}</div><AuthField label="Business category"><div className="auth-control"><input list="business-categories" value={form.business_category || ""} onChange={event => set("business_category")(event.target.value)} placeholder="Search or choose a category" required/><datalist id="business-categories"><option value="Restaurant"/><option value="Home kitchen"/><option value="Bakery"/><option value="Catering"/><option value="Fast food"/><option value="Cafe"/></datalist></div></AuthField></> : <>{field("phone", "Phone number", "tel")}<div className="auth-grid"><AuthField label="Gender"><div className="auth-control"><input list="gender-options" value={form.gender || ""} onChange={event => set("gender")(event.target.value)} placeholder="Search or choose" required/><datalist id="gender-options"><option value="Female"/><option value="Male"/><option value="Prefer not to say"/></datalist></div></AuthField><AuthField label="Vehicle type"><div className="auth-control"><input list="vehicle-options" value={form.vehicle_type || ""} onChange={event => set("vehicle_type")(event.target.value)} placeholder="Search or choose" required/><datalist id="vehicle-options"><option value="Bicycle"/><option value="Motorcycle"/><option value="Car"/><option value="Van"/></datalist></div></AuthField></div><div className="auth-grid">{field("vehicle_brand", "Vehicle brand")}{field("plate_number", "Plate number")}</div></>}<button className="auth-primary">Continue <ArrowRight/></button></form> : <form className="auth-form" onSubmit={submit}><SearchSelect label="Country" value={form.country || ""} options={countries} onChange={set("country")} placeholder="Search countries"/><div className="auth-grid"><SearchSelect label="State" value={form.state || ""} options={states} onChange={set("state")} placeholder="Search states"/><SearchSelect label="City" value={form.city || ""} options={cities} onChange={set("city")} placeholder="Search cities"/></div>{field(role === "vendor" ? "business_address" : "address", role === "vendor" ? "Business address" : "Home address")}{role === "rider" && <div className="auth-grid">{field("next_of_kin_name", "Next of kin name")}{field("next_of_kin_phone", "Next of kin phone", "tel")}</div>}<div className="auth-actions"><button type="button" className="auth-secondary" onClick={() => setStep(1)}><ArrowLeft/> Back</button><button className="auth-primary" disabled={busy}>{busy ? "Saving details..." : "Finish setup"}<ArrowRight/></button></div></form>}
  </AuthShell>;
}
