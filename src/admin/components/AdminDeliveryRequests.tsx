/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, Check, ChevronRight, Copy, Loader2, PackageCheck, Radio, Route, SlidersHorizontal, UserRound, X } from "lucide-react";
import api from "../../services/api";

type Props = { initialView: "create" | "list"; onClose: () => void };
const input = "w-full rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm outline-none transition focus:border-green-500 focus:ring-4 focus:ring-green-100";
const empty = {
  order_for: "self", requested_for_user_id: "",
  service_type: "pickup_and_dropoff", content_type: "documents", content_description: "", weight_kg: "",
  speed: "normal", pickup_address: "", pickup_contact_name: "", pickup_contact_phone: "",
  destination_address: "", destination_contact_name: "", destination_contact_phone: "", distance_km: "",
  distance_override_reason: "", weather_condition: "clear", traffic_condition: "normal", demand_period: "standard",
  payment_method: "pay_on_delivery", payer: "recipient", collection_amount: "0", special_instructions: "", scheduled_at: "",
  package_quantity: "1", dimension_length: "", dimension_width: "", dimension_height: "", declared_value: "0",
  package_photo_url: "", vehicle_type: "motorcycle",
};

const money = (value: unknown) => `₦${Number(value || 0).toLocaleString()}`;
const label = (value: string) => value.replaceAll("_", " ").replace(/\b\w/g, c => c.toUpperCase());
const localDateTimeInput = (date: Date) => {
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
};

export default function AdminDeliveryRequests({ initialView, onClose }: Props) {
  const [view, setView] = useState<"create" | "list">(initialView);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(empty);
  const [quote, setQuote] = useState<any>(null);
  const [jobs, setJobs] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [riders, setRiders] = useState<any[]>([]);
  const [assigning, setAssigning] = useState<Record<string, { rider_id: string; reason: string }>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const errorRef = useRef<HTMLParagraphElement>(null);
  const set = (key: keyof typeof empty, value: string) => { setForm(current => ({ ...current, [key]: value })); setQuote(null); setError(""); };
  const quotePayload = useMemo(() => ({
    pickup_address: form.pickup_address, destination_address: form.destination_address,
    ...(form.distance_km ? { distance_km: Number(form.distance_km), distance_override_reason: form.distance_override_reason } : {}),
    weight_kg: Number(form.weight_kg), content_type: form.content_type, weather_condition: form.weather_condition,
    traffic_condition: form.traffic_condition, demand_period: form.demand_period, speed: form.speed,
  }), [form]);

  const loadJobs = async () => { setBusy(true); try { setJobs((await api.get("/admin/delivery-requests")).data || []); } finally { setBusy(false); } };
  useEffect(() => { Promise.all([api.get("/admin/users"), api.get("/admin/delivery-requests/eligible-riders")]).then(([users, eligible]) => { setCustomers((users.data || []).filter((item: any) => item.role === "customer" && item.is_active !== false)); setRiders(eligible.data || []); }).catch(() => undefined); }, []);
  useEffect(() => { if (view === "list") void loadJobs(); }, [view]);
  useEffect(() => { if (error) errorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); }, [error]);

  const next = () => {
    if (step === 1 && (!form.content_description.trim() || !Number(form.weight_kg) || (form.order_for === "customer" && !form.requested_for_user_id))) return setError("Choose who this is for and add the package description and weight.");
    if (step === 2 && ![form.pickup_address, form.pickup_contact_name, form.pickup_contact_phone, form.destination_address, form.destination_contact_name, form.destination_contact_phone].every(value => value.trim())) return setError("Complete both contacts and addresses.");
    if (step === 2 && form.distance_km && !form.distance_override_reason.trim()) return setError("Add a reason for the verified distance override.");
    setError(""); setStep(value => Math.min(4, value + 1));
  };
  const estimate = async () => { setBusy(true); setError(""); try { setQuote((await api.post("/admin/delivery-requests/quote", quotePayload)).data); } catch (e: any) { setError(e.response?.data?.detail || "Could not calculate this estimate."); } finally { setBusy(false); } };
  const create = async () => {
    if (!quote) return estimate();
    setBusy(true); setError("");
    try {
      await api.post("/admin/delivery-requests", { ...quotePayload, ...form,
        requested_for_user_id: form.order_for === "customer" ? form.requested_for_user_id : null,
        weight_kg: Number(form.weight_kg), package_quantity: Number(form.package_quantity), declared_value: Number(form.declared_value || 0),
        dimensions_cm: form.dimension_length && form.dimension_width && form.dimension_height ? { length: Number(form.dimension_length), width: Number(form.dimension_width), height: Number(form.dimension_height) } : null,
        collection_amount: Number(form.collection_amount || 0), scheduled_at: form.scheduled_at ? new Date(form.scheduled_at).toISOString() : null,
      });
      setForm(empty); setQuote(null); setStep(1); setView("list");
    } catch (e: any) { setError(e.response?.data?.detail || "The delivery could not be broadcast."); } finally { setBusy(false); }
  };
  const assign = async (id: string) => {
    const value = assigning[id];
    if (!value?.rider_id || value.reason.trim().length < 3) return setError("Select a rider and add an assignment reason.");
    setBusy(true); setError("");
    try { await api.post(`/admin/delivery-requests/${id}/assign`, value); await loadJobs(); }
    catch (e: any) { setError(e.response?.data?.detail || "The rider could not be assigned."); setBusy(false); }
  };
  const uploadPackagePhoto = async (file?: File) => { if (!file) return; setBusy(true); setError(""); const body = new FormData(); body.append("file", file); try { const { data } = await api.post("/support/attachments", body, { headers: { "Content-Type": "multipart/form-data" } }); set("package_photo_url", data.url); } catch (e: any) { setError(e.response?.data?.detail || "The package photo could not be uploaded."); } finally { setBusy(false); } };
  const cancel = async (id: string) => {
    setBusy(true); setError("");
    try { await api.post(`/admin/delivery-requests/${id}/cancel`); await loadJobs(); }
    catch (e: any) { setError(e.response?.data?.detail || "The delivery could not be cancelled."); setBusy(false); }
  };

  return <div className="fixed inset-0 z-[100] flex justify-end bg-slate-950/55 backdrop-blur-sm" role="dialog" aria-modal="true">
    <button aria-label="Close" className="absolute inset-0 cursor-default" onClick={onClose}/>
    <section className="relative h-full w-full max-w-3xl overflow-y-auto bg-slate-50 shadow-2xl">
      <header className="sticky top-0 z-20 border-b border-white/10 bg-slate-950 px-5 py-5 text-white sm:px-8">
        <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.25em] text-green-400">Rider dispatch</p><h1 className="mt-1 text-2xl font-black">{view === "create" ? "Order a rider" : "Rider orders"}</h1></div><button onClick={onClose} className="rounded-xl bg-white/10 p-3 hover:bg-white/20"><X size={20}/></button></div>
        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl bg-white/10 p-1"><button onClick={() => setView("create")} className={`rounded-xl px-4 py-3 text-xs font-black ${view === "create" ? "bg-green-500 text-white" : "text-slate-300"}`}>Create delivery</button><button onClick={() => setView("list")} className={`rounded-xl px-4 py-3 text-xs font-black ${view === "list" ? "bg-green-500 text-white" : "text-slate-300"}`}>View broadcasts</button></div>
      </header>

      {view === "list" ? <div className="space-y-3 p-5 sm:p-8">{error && <p className="rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}{busy ? <Center/> : jobs.length ? jobs.map(job => <article key={job.id} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
        <div className="flex items-start justify-between gap-3"><div><p className="text-[10px] font-black uppercase tracking-wider text-green-600">{label(job.content_type)} · {job.weight_kg} kg · {label(job.vehicle_type || "motorcycle")}</p><h2 className="mt-1 font-black text-slate-900">{job.pickup_address}</h2><p className="mt-1 text-sm text-slate-500">to {job.delivery_address}</p>{job.scheduled_at && <p className="mt-2 text-xs font-bold text-slate-500">Scheduled for {new Date(job.scheduled_at).toLocaleString()}</p>}</div><span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase ${job.status === "broadcast" ? "bg-amber-100 text-amber-800" : job.status === "completed" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"}`}>{label(job.status)}</span></div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4"><Metric label="Distance" value={`${job.distance_km} km`}/><Metric label="Fee" value={money(job.delivery_fee)}/><Metric label="Pickup code" value={job.pickup_code || "Pending"}/><Metric label="Recipient code" value={job.delivery_code || "Pending"}/></div>
        <div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void navigator.clipboard.writeText(`${window.location.origin}/track/delivery/${job.tracking_token}`)} className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-xs font-black"><Copy size={14}/>Copy tracking link</button>{["broadcast", "scheduled"].includes(job.status) && <button disabled={busy} onClick={() => void cancel(job.id)} className="rounded-xl border border-red-200 px-4 py-2 text-xs font-black text-red-700 hover:bg-red-50">Cancel request</button>}</div>
        {job.status === "broadcast" && <div className="mt-4 grid gap-2 rounded-2xl bg-slate-50 p-3 sm:grid-cols-[1fr_1fr_auto]"><select className={input} value={assigning[job.id]?.rider_id || ""} onChange={e => setAssigning(current => ({ ...current, [job.id]: { rider_id: e.target.value, reason: current[job.id]?.reason || "" } }))}><option value="">Assign a rider</option>{riders.map(rider => <option key={rider.id} value={rider.id}>{rider.name} · {rider.is_online ? "online" : "offline"} · {rider.vehicle_type || "vehicle not set"}</option>)}</select><input className={input} value={assigning[job.id]?.reason || ""} onChange={e => setAssigning(current => ({ ...current, [job.id]: { rider_id: current[job.id]?.rider_id || "", reason: e.target.value } }))} placeholder="Assignment reason"/><button type="button" onClick={() => void assign(job.id)} className="rounded-xl bg-slate-950 px-4 text-xs font-black text-white">Assign</button></div>}
        {job.sla_pickup_at && new Date(job.sla_pickup_at).getTime() < Date.now() && !["picked_up","completed","cancelled"].includes(job.status) && <p className="mt-3 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">Pickup SLA has passed. Contact the rider or reassign this delivery.</p>}
      </article>) : <div className="rounded-3xl bg-white p-12 text-center"><PackageCheck className="mx-auto text-green-600" size={42}/><h2 className="mt-4 font-black">No rider orders yet</h2><button onClick={() => setView("create")} className="mt-4 rounded-xl bg-green-600 px-5 py-3 text-xs font-black text-white">Create the first one</button></div>}</div> :
      <div className="p-5 sm:p-8">
        <div className="mb-6 flex items-center gap-2">{["Package", "Route", "Conditions", "Review"].map((item, index) => <div key={item} className="flex flex-1 items-center gap-2"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[10px] font-black ${step > index + 1 ? "bg-green-600 text-white" : step === index + 1 ? "bg-slate-950 text-white" : "bg-slate-200 text-slate-500"}`}>{step > index + 1 ? <Check size={13}/> : index + 1}</span><span className="hidden text-[10px] font-black uppercase text-slate-500 sm:block">{item}</span></div>)}</div>
        <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
          {step === 1 && <><Title icon={<PackageCheck/>} title="What is being moved?" subtitle="Capture enough detail to match the right rider and vehicle."/><div className="mb-5 rounded-2xl bg-green-50 p-4"><Title icon={<UserRound/>} title="Who is this delivery for?" subtitle="Admin can create a delivery for the business or on behalf of an active customer."/><Grid><Field label="Ordering for"><select className={input} value={form.order_for} onChange={e => set("order_for", e.target.value)}><option value="self">Admin business</option><option value="customer">A customer</option></select></Field>{form.order_for === "customer" && <Field label="Customer"><select className={input} value={form.requested_for_user_id} onChange={e => set("requested_for_user_id", e.target.value)}><option value="">Select customer</option>{customers.map(customer => <option key={customer.id} value={customer.id}>{`${customer.firstname || ""} ${customer.lastname || ""}`.trim() || customer.email} · {customer.phone || customer.email}</option>)}</select></Field>}</Grid></div><Grid><Field label="Service"><select className={input} value={form.service_type} onChange={e => set("service_type", e.target.value)}><option value="pickup_and_dropoff">Pickup and drop-off</option><option value="pickup_only">Pickup only</option><option value="dropoff_only">Drop-off only</option></select></Field><Field label="Content type"><select className={input} value={form.content_type} onChange={e => set("content_type", e.target.value)}>{["documents","food","liquid","fragile","high_value","bulky","other"].map(v => <option key={v} value={v}>{label(v)}</option>)}</select></Field><Field label="Weight"><select className={input} value={form.weight_kg} onChange={e => set("weight_kg", e.target.value)}><option value="">Choose weight</option><option value="1">Up to 2 kg</option><option value="3.5">2.01 to 5 kg</option><option value="7.5">5.01 to 10 kg</option><option value="15">10.01 to 20 kg</option><option value="25">Over 20 kg</option></select></Field><Field label="Vehicle"><select className={input} value={form.vehicle_type} onChange={e => set("vehicle_type", e.target.value)}>{["bicycle","motorcycle","car","van"].map(v => <option key={v} value={v}>{label(v)}</option>)}</select></Field><Field label="Quantity"><input type="number" min="1" className={input} value={form.package_quantity} onChange={e => set("package_quantity", e.target.value)}/></Field><Field label="Declared value"><input type="number" min="0" className={input} value={form.declared_value} onChange={e => set("declared_value", e.target.value)}/></Field></Grid><Field label="Package description"><textarea className={`${input} mt-1 min-h-24`} value={form.content_description} onChange={e => set("content_description", e.target.value)} placeholder="Example: Two sealed cartons of glassware"/></Field></>}
          {step === 2 && <><Title icon={<Route/>} title="Pickup and destination" subtitle="The server calculates distance and ETA from both addresses."/><div className="grid gap-5 lg:grid-cols-2"><Address title="Pickup" prefix="pickup" form={form} set={set}/><Address title="Destination" prefix="destination" form={form} set={set}/></div><div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4"><p className="text-xs font-black text-amber-900">Verified distance override</p><p className="mt-1 text-xs text-amber-800">Use only when map routing is unavailable. Every override is recorded.</p><Grid><Field label="Distance in km"><input type="number" min="0.1" step="0.1" className={input} value={form.distance_km} onChange={e => set("distance_km", e.target.value)} placeholder="Leave blank for map routing"/></Field><Field label="Reason"><input className={input} value={form.distance_override_reason} onChange={e => set("distance_override_reason", e.target.value)} placeholder="Required when overriding"/></Field></Grid></div></>}
          {step === 3 && <><Title icon={<SlidersHorizontal/>} title="Conditions and payment" subtitle="Traffic and rush hour are not charged twice. The higher applicable value is used."/><Grid><SelectField label="Weather" value={form.weather_condition} values={["clear","light_rain","heavy_rain"]} onChange={(v: string) => set("weather_condition", v)}/><SelectField label="Traffic" value={form.traffic_condition} values={["light","normal","moderate","heavy"]} onChange={(v: string) => set("traffic_condition", v)}/><SelectField label="Demand period" value={form.demand_period} values={["standard","rush_hour","holiday","high_demand"]} onChange={(v: string) => set("demand_period", v)}/><SelectField label="Payment" value={form.payment_method} values={["pay_on_delivery","admin_wallet"]} onChange={(v: string) => set("payment_method", v)}/><SelectField label="Who pays" value={form.payer} values={["recipient","sender"]} onChange={(v: string) => set("payer", v)}/><Field label="Collection amount"><input type="number" min="0" className={input} value={form.collection_amount} onChange={e => set("collection_amount", e.target.value)}/></Field><Field label="Schedule for later"><input type="datetime-local" min={localDateTimeInput(new Date(Date.now() + 300000))} className={input} value={form.scheduled_at} onChange={e => set("scheduled_at", e.target.value)}/></Field></Grid><Field label="Special instructions"><textarea className={`${input} min-h-20`} value={form.special_instructions} onChange={e => set("special_instructions", e.target.value)} placeholder="Gate details, handling notes, or delivery instructions"/></Field></>}
          {step === 4 && <><Title icon={<Radio/>} title="Review and broadcast" subtitle="The price is calculated again on the server when the job is created."/>{!quote ? <button disabled={busy} onClick={estimate} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 p-4 text-sm font-black text-white">{busy && <Loader2 className="animate-spin" size={17}/>}Calculate estimate</button> : <div className="space-y-2">{quote.breakdown.map((row: any) => <div key={row.code} className="flex justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm"><span className="text-slate-500">{row.label}</span><b>{money(row.amount)}</b></div>)}<div className="mt-4 rounded-2xl bg-green-600 p-5 text-white"><div className="flex items-end justify-between"><div><p className="text-[10px] font-black uppercase tracking-widest text-green-100">Estimated delivery fee</p><p className="mt-1 text-3xl font-black">{money(quote.quoted_fee)}</p></div><div className="text-right"><p className="text-[10px] uppercase text-green-100">Rider earns</p><b>{money(quote.rider_earnings)}</b></div></div></div><button disabled={busy} onClick={create} className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-950 p-4 text-sm font-black text-white">{busy ? <Loader2 className="animate-spin" size={17}/> : <Radio size={17}/>}Broadcast to riders</button></div>}</>}
          {step === 1 && <Field label="Package photo, optional"><input type="file" accept="image/*" capture="environment" className={input} onChange={e => void uploadPackagePhoto(e.target.files?.[0])}/>{form.package_photo_url&&<span className="mt-2 block text-green-700">Photo attached</span>}</Field>}
          {error && <p ref={errorRef} role="alert" className="mt-4 rounded-xl bg-red-50 p-3 text-xs font-bold text-red-700">{error}</p>}
        </div>
        {step < 4 && <div className="mt-5 flex justify-between"><button disabled={step === 1} onClick={() => setStep(value => value - 1)} className="flex items-center gap-2 rounded-xl px-4 py-3 text-xs font-black text-slate-600 disabled:opacity-30"><ArrowLeft size={16}/>Back</button><button onClick={next} className="flex items-center gap-2 rounded-xl bg-green-600 px-5 py-3 text-xs font-black text-white">Continue<ChevronRight size={16}/></button></div>}
      </div>}
    </section>
  </div>;
}

function Title({ icon, title, subtitle }: any) { return <div className="mb-6 flex gap-3"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-100 text-green-700">{icon}</span><div><h2 className="text-lg font-black text-slate-900">{title}</h2><p className="text-xs leading-relaxed text-slate-500">{subtitle}</p></div></div>; }
function Grid({ children }: any) { return <div className="mb-4 grid gap-4 sm:grid-cols-2">{children}</div>; }
function Field({ label: title, children }: any) { return <label className="block text-xs font-black text-slate-600"><span className="mb-2 block">{title}</span>{children}</label>; }
function SelectField({ label: title, value, values, onChange }: any) { return <Field label={title}><select className={input} value={value} onChange={e => onChange(e.target.value)}>{values.map((v: string) => <option key={v} value={v}>{label(v)}</option>)}</select></Field>; }
function Address({ title, prefix, form, set }: any) { return <div className="rounded-2xl bg-slate-50 p-4"><p className="mb-3 text-xs font-black uppercase text-green-700">{title}</p><div className="space-y-3"><textarea className={`${input} min-h-20`} value={form[`${prefix}_address`]} onChange={e => set(`${prefix}_address`, e.target.value)} placeholder={`${title} address`}/><input className={input} value={form[`${prefix}_contact_name`]} onChange={e => set(`${prefix}_contact_name`, e.target.value)} placeholder="Contact name"/><input type="tel" className={input} value={form[`${prefix}_contact_phone`]} onChange={e => set(`${prefix}_contact_phone`, e.target.value)} placeholder="Phone number"/></div></div>; }
function Metric({ label: title, value }: any) { return <div className="rounded-xl bg-slate-50 p-3"><p className="font-black">{value}</p><p className="text-[9px] uppercase text-slate-400">{title}</p></div>; }
function Center() { return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-green-600" size={36}/></div>; }
