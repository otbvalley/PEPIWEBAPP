import React from "react";
import { ArrowLeft, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

const AccountDeletion: React.FC = () => {
  const subject = encodeURIComponent("PickEatPickIt account deletion request");
  const body = encodeURIComponent("Account type (customer/vendor/rider):\nRegistered email or phone:\n\nI request deletion of my PickEatPickIt account and associated personal data.");
  return (
    <div className="min-h-screen bg-black text-white font-sans">
      <main className="container mx-auto max-w-3xl px-6 py-12">
        <Link to="/" className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500 mb-12"><ArrowLeft className="w-4 h-4" /> Back to PickEatPickIt</Link>
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-red-500/10 rounded-xl flex items-center justify-center border border-red-500/20"><Trash2 className="w-6 h-6 text-red-400" /></div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Delete Your Account</h1>
        </div>
        <div className="space-y-8 text-gray-400 leading-relaxed">
          <section><h2 className="text-xl font-bold text-white mb-3">Delete in the app</h2><p>Sign in to the customer, vendor, or rider app. Open Profile, then Edit Profile or Settings, select Delete Account, and confirm. Deletion is permanent.</p></section>
          <section><h2 className="text-xl font-bold text-white mb-3">Request deletion without the app</h2><p>Email us from the address registered to your account. Include your account type and registered phone number so we can verify the request. Never send a password, OTP, card number, or bank PIN.</p><a className="inline-flex mt-5 rounded-xl bg-green-500 px-6 py-3 font-bold text-black" href={`mailto:support@pickeatpickit.com?subject=${subject}&body=${body}`}>Email deletion request</a></section>
          <section><h2 className="text-xl font-bold text-white mb-3">What happens</h2><p>Account access ends after deletion. Profile data and data not subject to a legal hold are deleted or de-identified. Order, payment, payout, fraud-prevention, tax, and dispute records may be retained for up to seven years where legally or operationally required. We will not use retained records for marketing.</p></section>
          <p>See our <Link className="text-green-500 underline" to="/privacy">Privacy Policy</Link> for complete data practices.</p>
        </div>
      </main>
    </div>
  );
};

export default AccountDeletion;
