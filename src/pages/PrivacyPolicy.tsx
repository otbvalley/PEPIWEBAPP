import React from "react";
import { ArrowLeft, Shield } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section>
    <h2 className="text-xl font-bold text-white uppercase mb-4">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

const PrivacyPolicy: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-black text-white font-sans overflow-x-hidden">
      <div className="container mx-auto px-6 py-12 relative z-10">
        <button onClick={() => navigate("/")} className="group flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-green-500 transition-colors mb-12">
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to PickEatPickIt
        </button>
        <main className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center border border-green-500/20"><Shield className="w-6 h-6 text-green-500" /></div>
            <h1 className="text-4xl font-black uppercase tracking-tighter">Privacy <span className="text-green-500">Policy</span></h1>
          </div>
          <p className="text-sm text-gray-500 font-bold uppercase mb-12 tracking-widest">Effective September 7, 2026</p>
          <div className="space-y-12 text-gray-400 font-medium leading-relaxed">
            <Section title="1. Who We Are">
              <p>PickEatPickIt operates customer, vendor, and rider applications for ordering, preparing, paying for, and delivering food and related physical services. This policy applies to those applications and our website.</p>
              <p>Questions or privacy requests: <a className="text-green-500 underline" href="mailto:support@pickeatpickit.com">support@pickeatpickit.com</a>.</p>
            </Section>
            <Section title="2. Information We Collect">
              <p><strong className="text-white">Account and contact data:</strong> name, email address, phone number, password hash, profile image, address, city, state, and account role.</p>
              <p><strong className="text-white">Vendor and rider verification data:</strong> business details, registration or tax information, licences, identity or storefront images and videos, availability, vehicle or delivery details, and bank payout details.</p>
              <p><strong className="text-white">Order and payment data:</strong> cart contents, orders, delivery instructions, transaction references, wallet activity, refunds, commissions, and payout history. Card details are entered with our payment provider and are not stored by PickEatPickIt.</p>
              <p><strong className="text-white">Location data:</strong> delivery addresses and precise or approximate device location when you use nearby discovery, address selection, navigation, or active-delivery tracking. Rider location is processed while the rider app is in use during delivery work.</p>
              <p><strong className="text-white">User content:</strong> chat messages, support requests, ratings, reviews, photos, videos, documents, and voice messages you choose to upload.</p>
              <p><strong className="text-white">Device and technical data:</strong> device identifier and name, platform, push-notification token, IP address, session and security information, app diagnostics, and timestamps.</p>
            </Section>
            <Section title="3. How We Use Information">
              <p>We use information to create and secure accounts; show nearby vendors; process orders, payments, refunds, commissions, and payouts; connect customers, vendors, and riders; provide delivery tracking and navigation; send transactional notifications; verify businesses and delivery partners; prevent fraud; provide support; comply with law; and maintain and improve service reliability.</p>
            </Section>
            <Section title="4. When We Share Information">
              <p>We share only what is needed with customers, vendors, and riders completing an order. Delivery participants may receive names, order details, delivery address, contact details, and live order location.</p>
              <p>Service providers process data for us: Paystack for payments and payouts; Cloudinary for uploaded media; Supabase and our database hosting providers for data and authentication infrastructure; Resend for email; Expo for app delivery and push-notification infrastructure; and Google Maps Platform for maps, geocoding, and navigation.</p>
              <p>We may disclose information to authorities or professional advisers when required by law, to protect safety and rights, or during a business reorganisation. We do not sell personal information or use personal information for cross-app behavioural advertising.</p>
            </Section>
            <Section title="5. Permissions and Your Choices">
              <p>Location, camera, photo library, microphone, and notification access is requested when relevant features need it. You can deny or revoke permission in device settings. Some features may then be unavailable; customer addresses can be entered manually.</p>
              <p>You may update profile information, notification preferences, and saved addresses in the app. Marketing messages, if introduced, will include an opt-out method.</p>
            </Section>
            <Section title="6. Retention">
              <p>We retain active account information while your account remains open. When an account is deleted, profile data and data not subject to a legal hold are deleted or de-identified. Order, payment, payout, fraud-prevention, tax, and dispute records may be retained for up to seven years where needed for legal, accounting, safety, or contractual obligations. Support and security logs are normally retained for up to two years. Backups expire through scheduled rotation.</p>
            </Section>
            <Section title="7. Security and International Processing">
              <p>We use access controls, encrypted HTTPS transport, credential hashing, and service-provider security controls. No system can guarantee absolute security. Providers may process information outside your country under their contractual and legal safeguards.</p>
            </Section>
            <Section title="8. Your Rights and Account Deletion">
              <p>You may request access, correction, deletion, restriction, or a copy of personal data, subject to applicable law. Delete your account from Profile settings in the customer, vendor, or rider app, or use our <Link className="text-green-500 underline" to="/account-deletion">account-deletion request page</Link>. We may verify identity before completing a request.</p>
            </Section>
            <Section title="9. Children">
              <p>PickEatPickIt is not directed to children under 18, and we do not knowingly create accounts for children.</p>
            </Section>
            <Section title="10. Changes">
              <p>We may update this policy when our services or legal obligations change. We will post the revised effective date and provide additional notice when required.</p>
            </Section>
          </div>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
