import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./web/pages/Landing";
import PartnerLanding from "./web/pages/PartnerLanding";
import NotFound from "./web/pages/NotFound";
import RoleLogin from "./web/auth/RoleLogin";
import ProtectedWorkspace from "./web/auth/ProtectedWorkspace";
import CompleteProfile from "./web/auth/CompleteProfile";
import { Registration, PasswordReset } from "./web/auth/Registration";
import { CustomerHome, CustomerSearch, CustomerKitchen, VendorDashboard, RiderDashboard } from "./web/pages/WorkspacePages";
import { CustomerCart, CustomerCheckout, CustomerPaymentVerify } from "./web/customer/CartFlow";
import CustomerAddresses from "./web/customer/Addresses";
import CustomerOrders from "./web/customer/Orders";
import { CustomerFaq, CustomerFavorites, CustomerOffers, CustomerOnboarding, CustomerOrderRoute, CustomerPassword, CustomerPreferences, CustomerWallet, WalletVerify } from "./web/customer/CustomerAccountPages";
import EarningsPage from "./web/pages/EarningsPage";
import { ProfilePage, SessionsPage, NotificationsPage, SupportPage, ReviewsPage, ActivityPage, SettingsPage } from "./web/pages/RoleAccount";
import RoleChat from "./web/pages/RoleChat";
import { VendorOrders, VendorMenu, RiderDeliveries, RiderOrderDetail } from "./web/pages/RoleOperations";
import { VendorOrderDetail, VendorPasswordSettings, VendorPaymentSettings, VendorSettings } from "./web/pages/VendorPages";
import RiderMapPage from "./web/pages/RiderMapPage";
import AdminRoute from "./admin/AdminRoute";
import About from "./pages/About";
import Careers from "./pages/Careers";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import Terms from "./pages/Terms";
import AccountDeletion from "./pages/AccountDeletion";

const AdminDashboard = lazy(() => import("./admin/dashboard/AdminDashboard"));
const AdminLogin = lazy(() => import("./admin/login/AdminLogin"));

export default function AppRoutes() {
  return <Suspense fallback={<div className="pepi-loading" role="status">Loading…</div>}><Routes>
    <Route path="/" element={<Landing />} />
    <Route path="/vendors" element={<PartnerLanding role="vendor" />} />
    <Route path="/riders" element={<PartnerLanding role="rider" />} />
    <Route path="/signin" element={<RoleLogin />} />
    <Route path="/login" element={<Navigate to="/signin" replace />} />
    <Route path="/signup" element={<Registration />} />
    <Route path="/forgot-password" element={<PasswordReset />} />
    <Route path="/vendor-login" element={<Navigate to="/signin?role=vendor" replace />} />
    <Route path="/rider-login" element={<Navigate to="/signin?role=rider" replace />} />
    <Route path="/vendor-signup" element={<Navigate to="/signup?role=vendor" replace />} />
    <Route path="/rider-registration" element={<Navigate to="/signup?role=rider" replace />} />

    <Route path="/customer" element={<ProtectedWorkspace role="customer" />}>
      <Route index element={<Navigate to="home" replace />} />
      <Route path="home" element={<CustomerHome />} />
      <Route path="onboarding" element={<CustomerOnboarding />} />
      <Route path="search" element={<CustomerSearch />} />
      <Route path="kitchen/:id" element={<CustomerKitchen />} />
      <Route path="cart" element={<CustomerCart />} />
      <Route path="checkout" element={<CustomerCheckout />} />
      <Route path="payment-verify" element={<CustomerPaymentVerify />} />
      <Route path="wallet/verify" element={<WalletVerify />} />
      <Route path="orders" element={<CustomerOrders />} />
      <Route path="orders/:id" element={<CustomerOrderRoute />} />
      <Route path="messages" element={<RoleChat />} />
      <Route path="notifications" element={<NotificationsPage role="customer" />} />
      <Route path="profile" element={<ProfilePage role="customer" />} />
      <Route path="profile/edit" element={<ProfilePage role="customer" edit />} />
      <Route path="profile/sessions" element={<SessionsPage />} />
      <Route path="wallet" element={<CustomerWallet />} />
      <Route path="addresses" element={<CustomerAddresses />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="favorites" element={<CustomerFavorites />} />
      <Route path="offers" element={<CustomerOffers />} />
      <Route path="change-password" element={<CustomerPassword />} />
      <Route path="faq" element={<CustomerFaq />} />
      <Route path="preferences" element={<CustomerPreferences />} />
    </Route>

    <Route path="/vendor" element={<ProtectedWorkspace role="vendor" />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="onboarding" element={<CompleteProfile role="vendor" />} />
      <Route path="dashboard" element={<VendorDashboard />} />
      <Route path="orders" element={<VendorOrders />} />
      <Route path="orders/:id" element={<VendorOrderDetail />} />
      <Route path="menu" element={<VendorMenu />} />
      <Route path="earnings" element={<EarningsPage role="vendor" />} />
      <Route path="chat" element={<RoleChat />} />
      <Route path="notifications" element={<NotificationsPage role="vendor" />} />
      <Route path="profile" element={<ProfilePage role="vendor" />} />
      <Route path="profile/edit" element={<ProfilePage role="vendor" edit />} />
      <Route path="profile/sessions" element={<SessionsPage />} />
      <Route path="reviews" element={<ReviewsPage role="vendor" />} />
      <Route path="history" element={<ActivityPage role="vendor" />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="settings" element={<VendorSettings />} />
      <Route path="payment-settings" element={<VendorPaymentSettings />} />
      <Route path="change-password" element={<VendorPasswordSettings />} />
    </Route>

    <Route path="/rider" element={<ProtectedWorkspace role="rider" />}>
      <Route index element={<Navigate to="dashboard" replace />} />
      <Route path="onboarding" element={<CompleteProfile role="rider" />} />
      <Route path="dashboard" element={<RiderDashboard />} />
      <Route path="deliveries" element={<RiderDeliveries />} />
      <Route path="deliveries/:id" element={<RiderOrderDetail />} />
      <Route path="map" element={<RiderMapPage />} />
      <Route path="earnings" element={<EarningsPage role="rider" />} />
      <Route path="chat" element={<RoleChat />} />
      <Route path="notifications" element={<NotificationsPage role="rider" />} />
      <Route path="profile" element={<ProfilePage role="rider" />} />
      <Route path="profile/edit" element={<ProfilePage role="rider" edit />} />
      <Route path="profile/sessions" element={<SessionsPage />} />
      <Route path="reviews" element={<ReviewsPage role="rider" />} />
      <Route path="support" element={<SupportPage />} />
      <Route path="settings" element={<SettingsPage />} />
      <Route path="activity" element={<ActivityPage role="rider" />} />
    </Route>

    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/admin-dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
    <Route path="/about" element={<About />} />
    <Route path="/careers" element={<Careers />} />
    <Route path="/privacy" element={<PrivacyPolicy />} />
    <Route path="/terms" element={<Terms />} />
    <Route path="/account-deletion" element={<AccountDeletion />} />
    <Route path="*" element={<NotFound />} />
  </Routes></Suspense>;
}
