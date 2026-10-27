import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ArrowLeft, ArrowRight, MapPin } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api, { refreshRoleSession } from "../../services/api";
import type { UserData } from "../../services/backendAuthService";
import { readStoredUser, roleHome } from "./roleRouting";
import { AuthField, AuthShell } from "./AuthShell";

type PartnerRole = "vendor" | "rider";
type Place = { name?: string; country_name?: string; state_name?: string; city_name?: string } | string;
type Bank = { name: string; code: string };
type Draft = { step: number; form: Record<string, string> };

const professions = ["Chef", "Caterer", "Restaurant Owner", "Store Manager", "Pharmacist", "Wholesaler", "Retailer", "Baker", "Grocer"];
const vendorTypes = ["Restaurant", "Supermarket", "Pharmacy", "Grocery Store", "Bakery", "Drink Store", "Others"];
const experienceOptions = ["1 Year", "3 Years", "5 Years", "10 Years", "10+ Years"];
const weekdays = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const genders = ["Male", "Female", "Other"];
const vehicleTypes = ["Motorcycle", "Bicycle", "Car", "Van"];
const deliveryRanges = [5, 10, 15, 20, 30];

const nameOf = (place: Place) => typeof place === "string" ? place : place.name || place.country_name || place.state_name || place.city_name || "";
const placeOptions = (places: Place[]) => places.map(place => nameOf(place)).filter(Boolean).map(name => ({ label: name, value: name }));
const errorMessage = (error: unknown) => (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "We could not save your profile. Please try again.";

function SearchSelect({ label, value, options, onChange, placeholder }: { label: string; value: string; options: Place[]; onChange: (value: string) => void; placeholder: string }) {
  const id = `choices-${label.toLowerCase().replace(/\s/g, "-")}`;
  return <AuthField label={label}><div className="auth-control"><MapPin/><input list={id} value={value} onChange={event => onChange(event.target.value)} placeholder={placeholder} autoComplete="off" required/><datalist id={id}>{options.map(option => { const name = nameOf(option); return <option value={name} key={name}/>; })}</datalist></div></AuthField>;
}

function SelectField({ label, value, options, onChange, placeholder, disabled = false }: { label: string; value: string; options: { label: string; value: string }[]; onChange: (value: string) => void; placeholder: string; disabled?: boolean }) {
  return <AuthField label={label}><div className="auth-control"><select value={value} onChange={event => onChange(event.target.value)} required disabled={disabled}><option value="" disabled>{placeholder}</option>{options.map(option => <option value={option.value} key={option.value}>{option.label}</option>)}</select></div></AuthField>;
}

function readDraft(key: string): Draft | null {
  try { return JSON.parse(localStorage.getItem(key) || "null") as Draft | null; } catch { return null; }
}

export default function CompleteProfile({ role }: { role: PartnerRole }) {
  const user = useMemo(readStoredUser, []);
  const navigate = useNavigate();
  const location = useLocation();
  const requestedReturn = (location.state as { from?: string } | null)?.from;
  const returnTo = requestedReturn?.startsWith(`/${role}/`) && requestedReturn !== `/${role}/onboarding` && !requestedReturn.startsWith("//") ? requestedReturn : roleHome(role);
  const draftKey = `pepi-${role}-onboarding-${user?.id || "unknown"}`;
  const savedDraft = useMemo(() => readDraft(draftKey), [draftKey]);
  const total = role === "vendor" ? 4 : 3;
  const [step, setStep] = useState(Math.min(savedDraft?.step || 1, total));
  const [error, setError] = useState("");
  const [notice, setNotice] = useState(savedDraft ? "Your saved progress has been restored." : "");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Record<string, string>>({
    country: "Nigeria",
    firstname: user?.firstname || "",
    lastname: user?.lastname || "",
    business_email: user?.email || "",
    business_phone: user?.phone || "",
    phone: user?.phone || "",
    delivery_range: "10",
    day_from: "MONDAY",
    day_to: "SUNDAY",
    opening_time: "08:00",
    closing_time: "22:00",
    total_workers: "1",
    ...savedDraft?.form,
  });
  const [countries, setCountries] = useState<Place[]>([]);
  const [states, setStates] = useState<Place[]>([]);
  const [cities, setCities] = useState<Place[]>([]);
  const [banks, setBanks] = useState<Bank[]>([]);
  const [resolvingAccount, setResolvingAccount] = useState(false);
  const set = (name: string) => (value: string) => setForm(current => ({ ...current, [name]: value }));
  const field = (name: string, label: string, type = "text", required = true) => <AuthField label={label} key={name}><div className="auth-control"><input type={type} value={form[name] || ""} onChange={event => set(name)(event.target.value)} required={required}/></div></AuthField>;

  useEffect(() => { localStorage.setItem(draftKey, JSON.stringify({ step, form } satisfies Draft)); }, [draftKey, form, step]);
  useEffect(() => { api.get("/location/countries").then(({ data }) => setCountries(data || [])).catch(() => setCountries(["Nigeria"])); }, []);
  useEffect(() => { if (!form.country) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states`).then(({ data }) => setStates(data || [])).catch(() => setStates([])); }, [form.country]);
  useEffect(() => { if (!form.country || !form.state) return; api.get(`/location/countries/${encodeURIComponent(form.country)}/states/${encodeURIComponent(form.state)}/cities`).then(({ data }) => setCities(data || [])).catch(() => setCities([])); }, [form.country, form.state]);
  useEffect(() => {
    if (role !== "vendor") return;
    api.get<{ status?: boolean; data?: Bank[] }>("/system/banks").then(({ data }) => {
      const unique = Array.from(new Map((data.data || []).map(bank => [bank.code, bank])).values());
      setBanks(unique);
    }).catch(() => setNotice("The bank list could not be loaded. Please refresh and try again."));
  }, [role]);
  useEffect(() => {
    if (role !== "vendor" || form.account_number?.length !== 10 || !form.bank_code) return;
    let active = true;
    const timer = window.setTimeout(async () => {
      setResolvingAccount(true);
      try {
        const { data } = await api.get<{ status?: boolean; data?: { account_name?: string } }>("/system/resolve-account", { params: { account_number: form.account_number, bank_code: form.bank_code } });
        if (active) {
          set("account_name")(data.data?.account_name || "");
          setError("");
        }
      } catch {
        if (active) { set("account_name")(""); setError("We could not verify that bank account. Check the bank and account number."); }
      } finally { if (active) setResolvingAccount(false); }
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [form.account_number, form.bank_code, role]);

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
          navigate(returnTo, { replace: true });
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
  }, [draftKey, navigate, returnTo, role, user]);

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
          business_address: form.business_address, business_category: form.business_category || form.vendor_type, profession: form.profession, vendor_type: form.vendor_type,
          years_of_experience: form.years_of_experience, country_name: form.country, state: form.state, city: form.city, zip: form.zip,
          business_description: form.description, day_from: form.day_from, day_to: form.day_to, opening_time: form.opening_time, closing_time: form.closing_time,
          total_workers: Number(form.total_workers || 0), bank_name: form.bank_name, bank_code: form.bank_code, account_number: form.account_number, account_name: form.account_name,
          corporate_terms_accepted: true,
        });
      } else {
        await api.post("/riders/", {
          firstname: form.firstname || user.firstname || "", lastname: form.lastname || user.lastname || "", phone: form.phone || user.phone || "",
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
      window.dispatchEvent(new CustomEvent("pepi-session-updated", { detail: { ...user, ...current } }));
      localStorage.removeItem(draftKey);
      navigate(returnTo, { replace: true });
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
    {role === "vendor" && step === 1 && actions(<>{field("business_name", "Business name")}<div className="auth-grid">{field("business_email", "Business email", "email")}{field("business_phone", "Business phone", "tel")}</div><div className="auth-grid"><SelectField label="Vendor type" value={form.vendor_type || ""} options={vendorTypes.map(value => ({ label: value, value }))} onChange={value => setForm(current => ({ ...current, vendor_type: value, business_category: value }))} placeholder="Select category"/><SelectField label="Profession" value={form.profession || ""} options={professions.map(value => ({ label: value, value }))} onChange={set("profession")} placeholder="Select profession"/></div><SelectField label="Years of experience" value={form.years_of_experience || ""} options={experienceOptions.map(value => ({ label: value, value }))} onChange={set("years_of_experience")} placeholder="Select years"/></>)}
    {role === "vendor" && step === 2 && actions(<><SearchSelect label="Country" value={form.country || ""} options={countries} onChange={value => setForm(current => ({ ...current, country: value, state: "", city: "" }))} placeholder="Search countries"/><div className="auth-grid"><SelectField label="State" value={form.state || ""} options={placeOptions(states)} onChange={value => setForm(current => ({ ...current, state: value, city: "" }))} placeholder={states.length ? "Select state" : "Loading states..."} disabled={!states.length}/><SelectField label="City" value={form.city || ""} options={placeOptions(cities)} onChange={set("city")} placeholder={!form.state ? "Select a state first" : cities.length ? "Select city" : "Loading cities..."} disabled={!form.state || !cities.length}/></div>{field("business_address", "Business address")} {field("zip", "Postcode", "text", false)}</>)}
    {role === "vendor" && step === 3 && actions(<>{field("description", "Business description")}<div className="auth-grid"><SelectField label="Opening day" value={form.day_from || ""} options={weekdays.map(value => ({ label: value[0] + value.slice(1).toLowerCase(), value }))} onChange={set("day_from")} placeholder="Select day"/><SelectField label="Closing day" value={form.day_to || ""} options={weekdays.map(value => ({ label: value[0] + value.slice(1).toLowerCase(), value }))} onChange={set("day_to")} placeholder="Select day"/></div><div className="auth-grid">{field("opening_time", "Opening time", "time")}{field("closing_time", "Closing time", "time")}</div>{field("total_workers", "Number of workers", "number")}</>)}
    {role === "vendor" && step === 4 && actions(<><SelectField label="Bank name" value={form.bank_code || ""} options={banks.map(bank => ({ label: bank.name, value: bank.code }))} onChange={code => { const bank = banks.find(item => item.code === code); setForm(current => ({ ...current, bank_code: code, bank_name: bank?.name || "", account_name: "" })); }} placeholder={banks.length ? "Select bank" : "Loading banks..."} disabled={!banks.length}/><div className="auth-grid"><AuthField label="Account number"><div className="auth-control"><input inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={form.account_number || ""} onChange={event => set("account_number")(event.target.value.replace(/\D/g, ""))} required placeholder="10-digit account number"/></div></AuthField><AuthField label="Account name"><div className="auth-control"><input value={resolvingAccount ? "Verifying account..." : form.account_name || ""} readOnly required placeholder="Verified automatically"/></div></AuthField></div><label className="auth-check"><input type="checkbox" required/><span>I confirm these business and settlement details are correct.</span></label></>, true)}
    {role === "rider" && step === 1 && actions(<><div className="auth-grid">{field("firstname", "First name")}{field("lastname", "Last name")}</div>{field("phone", "Phone number", "tel")}<div className="auth-grid"><SelectField label="Gender" value={form.gender || ""} options={genders.map(value => ({ label: value, value }))} onChange={set("gender")} placeholder="Select gender"/><SelectField label="Vehicle type" value={form.vehicle_type || ""} options={vehicleTypes.map(value => ({ label: value, value }))} onChange={set("vehicle_type")} placeholder="Select vehicle type"/></div><div className="auth-grid">{field("vehicle_brand", "Vehicle brand")}{field("plate_number", "Plate number")}</div></>)}
    {role === "rider" && step === 2 && actions(<><SearchSelect label="Country" value={form.country || ""} options={countries} onChange={value => setForm(current => ({ ...current, country: value, state: "", city: "" }))} placeholder="Search countries"/><div className="auth-grid"><SelectField label="State" value={form.state || ""} options={placeOptions(states)} onChange={value => setForm(current => ({ ...current, state: value, city: "" }))} placeholder={states.length ? "Select state" : "Loading states..."} disabled={!states.length}/><SelectField label="City" value={form.city || ""} options={placeOptions(cities)} onChange={set("city")} placeholder={!form.state ? "Select a state first" : cities.length ? "Select city" : "Loading cities..."} disabled={!form.state || !cities.length}/></div>{field("address", "Home address")} {field("zip", "Postcode", "text", false)}</>)}
    {role === "rider" && step === 3 && actions(<><div className="auth-grid">{field("next_of_kin_name", "Next of kin name")}{field("next_of_kin_phone", "Next of kin phone", "tel")}</div><div className="auth-grid">{field("previous_work", "Previous delivery work", "text", false)}{field("work_duration", "Work duration", "text", false)}</div><div className="auth-grid"><SelectField label="Delivery range" value={form.delivery_range || "10"} options={deliveryRanges.map(value => ({ label: `${value} km`, value: String(value) }))} onChange={set("delivery_range")} placeholder="Select delivery range"/>{field("referral_code", "Referral code", "text", false)}</div><label className="auth-check"><input type="checkbox" required/><span>I confirm these rider details are correct.</span></label></>, true)}
  </AuthShell>;
}
