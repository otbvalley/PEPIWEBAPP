/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import api from "../../services/api";

const field = "w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-bold outline-none focus:border-green-500 focus:ring-4 focus:ring-green-100";
const groups = [["content_types", "Content handling"], ["weather", "Weather"], ["traffic", "Traffic"], ["demand_periods", "Demand and seasons"], ["speed", "Service speed"]] as const;

export default function DeliveryPricingSettings() {
  const [config, setConfig] = useState<any>(null);
  const [version, setVersion] = useState(1);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  useEffect(() => { api.get("/admin/delivery-requests/pricing").then(({ data }) => { setConfig(data.config); setVersion(data.version); }).catch(() => setMessage("Could not load delivery pricing." )).finally(() => setBusy(false)); }, []);
  const number = (key: string, value: string) => setConfig((current: any) => ({ ...current, [key]: Number(value) }));
  const row = (group: string, index: number, key: string, value: string) => setConfig((current: any) => ({ ...current, [group]: current[group].map((item: any, i: number) => i === index ? { ...item, [key]: Number(value) } : item) }));
  const save = async () => { setBusy(true); setMessage(""); try { const { data } = await api.put("/admin/delivery-requests/pricing", { config }); setVersion(data.version); setMessage("Delivery pricing published successfully."); } catch (error: any) { setMessage(error.response?.data?.detail || "Could not save delivery pricing."); } finally { setBusy(false); } };
  if (busy && !config) return <div className="flex justify-center p-20"><Loader2 className="animate-spin text-green-600" size={36}/></div>;
  if (!config) return <p className="rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-700">{message}</p>;
  return <div className="space-y-5">
    <header className="rounded-3xl bg-slate-950 p-6 text-white"><div className="flex flex-wrap items-center justify-between gap-4"><div><p className="text-[10px] font-black uppercase tracking-[.2em] text-green-400">Pricing version {version}</p><h2 className="mt-1 text-2xl font-black">Admin delivery pricing</h2><p className="mt-1 max-w-2xl text-sm text-slate-400">Changes create a new version. Existing delivery quotes keep the exact rules used when they were created.</p></div><ShieldCheck className="text-green-400" size={38}/></div></header>
    <section className="grid gap-4 rounded-3xl border bg-white p-5 shadow-sm sm:grid-cols-2 lg:grid-cols-4">{[["base_fee","Base pickup fee"],["price_per_km","Price per km"],["minimum_fee","Minimum fee"],["maximum_fee","Maximum fee"],["dynamic_cap_percent","Dynamic cap %"],["rider_share_percent","Rider share %"]].map(([key,label]) => <label key={key} className="text-xs font-black text-slate-500">{label}<input type="number" min="0" className={`${field} mt-2`} value={config[key]} onChange={e => number(key,e.target.value)}/></label>)}</section>
    <section className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">Weight bands</h3><div className="mt-4 overflow-x-auto"><table className="w-full min-w-[520px] text-left text-sm"><thead><tr className="text-[10px] uppercase text-slate-400"><th className="pb-2">Band</th><th className="pb-2">Maximum kg</th><th className="pb-2">Fee</th></tr></thead><tbody>{config.weight_bands.map((item: any,index: number) => <tr key={item.label} className="border-t"><td className="py-3 font-bold">{item.label}</td><td className="py-2 pr-3"><input type="number" className={field} value={item.max_kg} onChange={e => row("weight_bands",index,"max_kg",e.target.value)}/></td><td className="py-2"><input type="number" className={field} value={item.fee} onChange={e => row("weight_bands",index,"fee",e.target.value)}/></td></tr>)}</tbody></table></div></section>
    <div className="grid gap-5 lg:grid-cols-2">{groups.map(([key,title]) => <section key={key} className="rounded-3xl border bg-white p-5 shadow-sm"><h3 className="font-black">{title}</h3><div className="mt-3 space-y-2">{config[key].map((item: any,index: number) => <div key={item.code} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-3"><div><b className="text-sm">{item.label}</b><p className="text-[10px] uppercase text-slate-400">{item.code.replaceAll("_"," ")}</p></div><div className="relative w-28"><input type="number" min="0" max="100" className={field} value={item.percent} onChange={e => row(key,index,"percent",e.target.value)}/><span className="absolute right-3 top-2.5 text-xs text-slate-400">%</span></div></div>)}</div></section>)}</div>
    {message && <p className={`rounded-xl p-3 text-xs font-bold ${message.includes("successfully") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>{message}</p>}
    <button disabled={busy} onClick={save} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-700 p-4 text-sm font-black text-white disabled:opacity-50">{busy ? <Loader2 className="animate-spin" size={18}/> : <Save size={18}/>}Publish pricing configuration</button>
  </div>;
}
