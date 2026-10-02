import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import api from "../../services/api";

type EarningsData = {
  today: number;
  pending: number;
  payout_policy?: { threshold: number; auto_approve: boolean; available_balance: number; bank_ready: boolean; eligible: boolean; latest?: { amount: number; status: string; failure_reason?: string } | null };
  transactions: { id: string; type: string; recipient: string; date: string; status: string; amount: number }[];
  orders: { id: string; orderId: string; date: string; status: string; amount: number; commission: number }[];
};

export default function EarningsPage({ role }: { role: "vendor" | "rider" }) {
  const base = role === "vendor" ? "/vendors" : "/riders";
  const [data, setData] = useState<EarningsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [amount, setAmount] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const result = await api.get<EarningsData>(`${base}/earnings`); setData(result.data); }
    catch { setError("Could not load earnings. Please try again."); }
    finally { setLoading(false); }
  }, [base]);
  useEffect(() => { load(); }, [load]);
  async function withdraw(event: FormEvent) {
    event.preventDefault(); setSubmitting(true); setMessage("");
    try { await api.post(`${base}/withdraw`, { amount: Number(amount) }); setAmount(""); setMessage("Withdrawal request submitted."); await load(); }
    catch (err) { setMessage((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Withdrawal could not be requested."); }
    finally { setSubmitting(false); }
  }
  const money = (value: number) => `₦${Number(value || 0).toLocaleString("en-NG", { maximumFractionDigits: 2 })}`;
  const policy = data?.payout_policy;
  const activePayout = policy?.latest && ["pending", "approved", "processing"].includes(policy.latest.status);
  const canWithdraw = role !== "vendor" || Boolean(policy?.eligible && !activePayout);
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Finances</p><h2>Earnings & payments</h2><p>See completed orders, payout readiness, and withdrawal activity.</p></div>{role === "vendor" && <Link className="pepi-secondary-action" to="/vendor/payment-settings">Payment information</Link>}</div>{loading && <div role="status" className="pepi-panel">Loading earnings…</div>}{error && <div role="alert" className="pepi-panel">{error} <button onClick={load}>Retry</button></div>}{data && <><div className="pepi-stat-grid"><div className="pepi-stat"><div><small>Today</small><strong>{money(data.today)}</strong></div></div><div className="pepi-stat"><div><small>Available for payout</small><strong>{money(policy?.available_balance ?? data.pending)}</strong></div></div></div>{policy && <section className="pepi-payout-readiness"><div><span className={policy.bank_ready ? "ready" : ""}/><p><strong>{policy.bank_ready ? "Bank account ready" : "Payment information required"}</strong><small>{policy.bank_ready ? `Minimum withdrawal ${money(policy.threshold)}. ${policy.auto_approve ? "Eligible requests are processed automatically." : "Requests require approval."}` : "Add and verify a bank account before requesting a withdrawal."}</small></p></div>{policy.latest && <div><span className={policy.latest.status === "completed" ? "ready" : ""}/><p><strong>Latest payout: {policy.latest.status}</strong><small>{money(policy.latest.amount)}{policy.latest.failure_reason ? ` · ${policy.latest.failure_reason}` : ""}</small></p></div>}</section>}<form className="pepi-panel pepi-checkout-form" onSubmit={withdraw}><h3>Request a withdrawal</h3><label>Amount (NGN)<input type="number" min={policy?.threshold || 1} step="0.01" value={amount} onChange={event => setAmount(event.target.value)} required /></label><button className="pepi-primary" disabled={submitting || !canWithdraw || Number(amount) <= 0 || Number(amount) > Number(policy?.available_balance ?? data.pending)}>{submitting ? "Submitting…" : activePayout ? "Payout already in progress" : !policy?.bank_ready && role === "vendor" ? "Add payment information first" : "Request withdrawal"}</button>{message && <p role="status">{message}</p>}<Link to={role === "vendor" ? "/vendor/payment-settings" : `/${role}/profile`}>Manage payment information</Link></form><section className="pepi-section"><h3>Recent payouts</h3>{data.transactions.length ? <div className="pepi-panel">{data.transactions.map(transaction => <div className="pepi-cart-row" key={transaction.id}><div><strong>{transaction.type} · {transaction.recipient}</strong><small>{transaction.date} · {transaction.status}</small></div><strong>{money(transaction.amount)}</strong></div>)}</div> : <div className="pepi-panel">No payouts yet.</div>}</section><section className="pepi-section"><h3>Completed orders</h3>{data.orders.length ? <div className="pepi-panel">{data.orders.map(order => <div className="pepi-cart-row" key={order.id}><div><strong>{order.orderId}</strong><small>{order.date}</small></div><strong>{money(role === "rider" ? order.commission : order.amount - order.commission)}</strong></div>)}</div> : <div className="pepi-panel">No completed orders yet.</div>}</section></>}</>;
}
