import React, { useState } from "react";
import axios from "axios";
import { ArrowLeft, CheckCircle2, Trash2 } from "lucide-react";
import { Link, useSearchParams } from "react-router-dom";
import { publicApi } from "../services/api";

const PHRASE = "DELETE MY ACCOUNT";

const AccountDeletion: React.FC = () => {
  const [params, setParams] = useSearchParams();
  const confirmToken = params.get("confirm_token");
  const recoveryToken = params.get("recovery_token");
  const [accountType, setAccountType] = useState("customer");
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const getError = (value: unknown) => axios.isAxiosError(value) ? String(value.response?.data?.detail || value.message) : "Something went wrong. Please try again.";

  const submitRequest = async (event: React.FormEvent) => {
    event.preventDefault(); setLoading(true); setError("");
    try {
      const { data } = await publicApi.post("/public/account-deletion-request", { account_type: accountType, email, confirmation, reason_code: reason || null, reason_text: feedback || null });
      setMessage(data.message);
    } catch (value) { setError(getError(value)); } finally { setLoading(false); }
  };
  const confirmRequest = async () => {
    setLoading(true); setError("");
    try {
      const { data } = await publicApi.post("/public/account-deletion-request/confirm", { confirmation_token: confirmToken });
      setParams({ recovery_token: data.recovery_token });
      setMessage("Your account is disabled and scheduled for deletion. Save this page if you may want to restore it.");
    } catch (value) { setError(getError(value)); } finally { setLoading(false); }
  };
  const restore = async () => {
    setLoading(true); setError("");
    try {
      await publicApi.post("/user/account/deletion-request/cancel", { recovery_token: recoveryToken });
      setParams({}); setMessage("Your account has been restored. You can sign in again.");
    } catch (value) { setError(getError(value)); } finally { setLoading(false); }
  };

  const field = "mt-2 w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-white outline-none focus:border-green-500";
  return <div className="min-h-screen bg-black font-sans text-white"><main className="container mx-auto max-w-3xl px-6 py-12">
    <Link to="/" className="mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500"><ArrowLeft className="h-4 w-4" /> Back to PickEatPickIt</Link>
    <div className="mb-8 flex items-center gap-4"><div className="flex h-12 w-12 items-center justify-center rounded-xl border border-red-500/20 bg-red-500/10"><Trash2 className="h-6 w-6 text-red-400" /></div><h1 className="text-4xl font-black uppercase tracking-tighter">Delete Your Account</h1></div>
    {message && <div className="mb-6 flex gap-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4 text-green-300"><CheckCircle2 className="h-5 w-5 shrink-0" />{message}</div>}
    {error && <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-300">{error}</div>}
    {confirmToken ? <section className="rounded-2xl border border-white/10 bg-white/5 p-6"><h2 className="mb-3 text-xl font-bold">Confirm deletion request</h2><p className="mb-6 text-gray-400">Confirming disables your account immediately. Permanent deletion is scheduled for 30 days later, and we will email you a recovery link.</p><button disabled={loading} onClick={confirmRequest} className="rounded-xl bg-red-500 px-6 py-3 font-bold disabled:opacity-50">{loading ? "Confirming..." : "Confirm account deletion"}</button></section>
    : recoveryToken ? <section className="rounded-2xl border border-white/10 bg-white/5 p-6"><h2 className="mb-3 text-xl font-bold">Restore your account</h2><p className="mb-6 text-gray-400">You can cancel scheduled deletion during the 30-day recovery period.</p><button disabled={loading} onClick={restore} className="rounded-xl bg-green-500 px-6 py-3 font-bold text-black disabled:opacity-50">{loading ? "Restoring..." : "Restore my account"}</button></section>
    : !message && <form onSubmit={submitRequest} className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6">
      <p className="text-gray-400">Submit this form if you cannot access the app. We will email your registered address to verify the request.</p>
      <label className="block text-sm font-bold">Account type<select value={accountType} onChange={e => setAccountType(e.target.value)} className={field}><option className="bg-black" value="customer">Customer</option><option className="bg-black" value="vendor">Vendor</option><option className="bg-black" value="rider">Rider</option></select></label>
      <label className="block text-sm font-bold">Registered email<input required type="email" value={email} onChange={e => setEmail(e.target.value)} className={field} /></label>
      <label className="block text-sm font-bold">Reason, optional<select value={reason} onChange={e => setReason(e.target.value)} className={field}><option className="bg-black" value="">Prefer not to say</option><option className="bg-black">I no longer use the app</option><option className="bg-black">Privacy concerns</option><option className="bg-black">I created another account</option><option className="bg-black">Other</option></select></label>
      <label className="block text-sm font-bold">Additional feedback, optional<textarea value={feedback} onChange={e => setFeedback(e.target.value)} maxLength={1000} className={`${field} min-h-24`} /></label>
      <label className="block text-sm font-bold">Type {PHRASE} to confirm<input required value={confirmation} onChange={e => setConfirmation(e.target.value)} className={field} placeholder={PHRASE} /></label>
      <button disabled={loading || confirmation !== PHRASE} className="rounded-xl bg-red-500 px-6 py-3 font-bold disabled:opacity-40">{loading ? "Submitting..." : "Request account deletion"}</button>
    </form>}
    <div className="mt-8 space-y-5 text-sm leading-relaxed text-gray-400"><p>Your account is disabled after confirmation and permanently deleted after 30 days. During the recovery period you can restore access using the link sent to your email.</p><p>Order, payment, payout, fraud prevention, tax, and dispute records may be retained where legally or operationally required. Retained records are not used for marketing.</p><p>See our <Link className="text-green-500 underline" to="/privacy">Privacy Policy</Link> for complete data practices.</p></div>
  </main></div>;
};
export default AccountDeletion;
