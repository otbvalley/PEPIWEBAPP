import { ArrowLeft, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Support: React.FC = () => (
  <div className="min-h-screen bg-black px-6 py-12 text-white">
    <main className="mx-auto max-w-3xl">
      <Link to="/" className="mb-12 flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500">
        <ArrowLeft className="h-4 w-4" /> Back to PickEatPickIt
      </Link>
      <h1 className="text-4xl font-black uppercase tracking-tighter">PickEatPickIt Support</h1>
      <p className="mt-5 max-w-2xl text-gray-400">Help with customer orders, vendor operations, rider deliveries, payments, privacy, or account access.</p>
      <a href="mailto:support@pickeatpickit.com?subject=PickEatPickIt%20support%20request" className="mt-8 inline-flex items-center gap-3 rounded-xl bg-green-500 px-6 py-4 font-bold text-black">
        <Mail className="h-5 w-5" /> support@pickeatpickit.com
      </a>
      <p className="mt-8 text-sm text-gray-500">Include your account type and relevant order number. Never email passwords, OTPs, full card details, or bank PINs.</p>
      <div className="mt-12 flex gap-6 text-sm">
        <Link className="text-green-500 underline" to="/privacy">Privacy Policy</Link>
        <Link className="text-green-500 underline" to="/account-deletion">Account Deletion</Link>
      </div>
    </main>
  </div>
);

export default Support;
