import { useEffect, useState, type FormEvent } from "react";
import { CheckCircle2 } from "lucide-react";
import api from "../../services/api";

type Bank = { name: string; code: string };
type RiderProfile = { bank_info?: { bank_name?: string; bank_code?: string; account_number?: string; account_name?: string } };

const errorText = (error: unknown) => (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "We could not save your payment information.";

export default function RiderPaymentSettings() {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [bankOpen, setBankOpen] = useState(false);
  const [bankName, setBankName] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [resolving, setResolving] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    api.get<RiderProfile>("/riders/profile").then(({ data }) => {
      const bank = data.bank_info;
      setBankName(bank?.bank_name || ""); setBankCode(bank?.bank_code || "");
      setAccountNumber(bank?.account_number || ""); setAccountName(bank?.account_name || "");
    }).catch(() => setMessage("Could not load your current payment information."));
    api.get<{ data?: Bank[] }>("/system/banks").then(({ data }) => setBanks(Array.from(new Map((data.data || []).map(bank => [bank.code, bank])).values()))).catch(() => setMessage("Could not load the bank list."));
  }, []);

  useEffect(() => {
    if (accountNumber.length !== 10 || !bankCode) { setAccountName(""); return; }
    let active = true;
    const timer = window.setTimeout(async () => {
      setResolving(true); setMessage("");
      try {
        const { data } = await api.get<{ data?: { account_name?: string } }>("/system/resolve-account", { params: { account_number: accountNumber, bank_code: bankCode } });
        if (active) setAccountName(data.data?.account_name || "");
      } catch { if (active) { setAccountName(""); setMessage("We could not verify that account. Check the details and try again."); } }
      finally { if (active) setResolving(false); }
    }, 350);
    return () => { active = false; window.clearTimeout(timer); };
  }, [accountNumber, bankCode]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      await api.post("/riders/bank-info", { bank_name: bankName, bank_code: bankCode, account_number: accountNumber, account_name: accountName });
      setMessage("Payment information updated successfully.");
    } catch (error) { setMessage(errorText(error)); }
    finally { setBusy(false); }
  }

  return <div className="pepi-settings-page"><div className="pepi-dashboard-heading"><div><h2>Payment information</h2><p>Add the verified bank account used for rider payouts.</p></div></div><form className="pepi-dashboard-card pepi-settings-form" onSubmit={submit}><label>Bank name<button type="button" className="pepi-bank-select" onClick={() => setBankOpen(true)}>{bankName || "Select a bank"}</button></label><label>Account number<input inputMode="numeric" pattern="[0-9]{10}" maxLength={10} value={accountNumber} onChange={event => setAccountNumber(event.target.value.replace(/\D/g, ""))} placeholder="10-digit account number" required/></label><label>Account name<input value={resolving ? "Verifying account..." : accountName} readOnly placeholder="Verified automatically" required/></label><button className="pepi-primary" disabled={busy || resolving || !accountName}>{busy ? "Saving" : "Save payment information"}</button>{message && <div className={message.includes("successfully") ? "pepi-inline-notice" : "pepi-inline-error"}>{message}</div>}</form>{bankOpen && <div className="pepi-dialog-backdrop" onMouseDown={() => setBankOpen(false)}><section className="pepi-dialog pepi-bank-dialog" onMouseDown={event => event.stopPropagation()}><h3>Select bank</h3><div className="pepi-bank-list">{banks.map(bank => <button type="button" key={bank.code} onClick={() => { setBankName(bank.name); setBankCode(bank.code); setAccountName(""); setBankOpen(false); }}>{bank.name}{bank.code === bankCode && <CheckCircle2 size={16}/>}</button>)}</div><button onClick={() => setBankOpen(false)}>Close</button></section></div>}</div>;
}
