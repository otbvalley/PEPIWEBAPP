import { useLocation } from "react-router-dom";

const EXACT_LOADING_LABELS: Record<string, string> = {
  "/": "Loading Pepi…",
  "/vendors": "Loading vendor information…",
  "/riders": "Loading rider information…",
  "/signin": "Loading sign in…",
  "/login": "Loading sign in…",
  "/signup": "Loading registration…",
  "/forgot-password": "Loading password recovery…",
  "/about": "Loading about Pepi…",
  "/careers": "Loading careers…",
  "/privacy": "Loading privacy information…",
  "/terms": "Loading terms…",
  "/account-deletion": "Loading account deletion information…",
  "/admin-login": "Loading admin sign in…",
  "/admin-dashboard": "Loading admin dashboard…",
};

const WORKSPACE_LOADING_LABELS: Record<string, Record<string, string>> = {
  customer: {
    home: "Loading meals near you…",
    onboarding: "Preparing your customer profile…",
    search: "Finding meals and kitchens…",
    meal: "Loading meal details…",
    kitchen: "Loading kitchen details…",
    cart: "Loading your cart…",
    checkout: "Preparing checkout…",
    "payment-verify": "Verifying your payment…",
    wallet: "Loading your wallet…",
    orders: "Loading your orders…",
    messages: "Loading your conversations…",
    notifications: "Loading your notifications…",
    profile: "Loading your profile…",
    addresses: "Loading your saved addresses…",
    support: "Loading customer support…",
    favorites: "Loading your favorite meals…",
    offers: "Loading available offers…",
    "change-password": "Loading password settings…",
    faq: "Loading frequently asked questions…",
    preferences: "Loading your preferences…",
  },
  vendor: {
    dashboard: "Loading your business overview…",
    onboarding: "Preparing your vendor profile…",
    orders: "Loading your kitchen orders…",
    menu: "Loading your menu…",
    earnings: "Loading your earnings…",
    chat: "Loading your conversations…",
    notifications: "Loading your notifications…",
    profile: "Loading your business profile…",
    reviews: "Loading customer reviews…",
    history: "Loading your order history…",
    support: "Loading vendor support…",
    settings: "Loading business settings…",
    "payment-settings": "Loading payment settings…",
    "change-password": "Loading password settings…",
  },
  rider: {
    dashboard: "Loading your delivery overview…",
    onboarding: "Preparing your rider profile…",
    deliveries: "Loading your deliveries…",
    map: "Loading your delivery map…",
    earnings: "Loading your earnings…",
    chat: "Loading your conversations…",
    notifications: "Loading your notifications…",
    profile: "Loading your rider profile…",
    reviews: "Loading your reviews…",
    support: "Loading rider support…",
    settings: "Loading rider settings…",
    activity: "Loading your delivery activity…",
  },
};

function getRouteLoadingLabel(pathname: string) {
  const normalizedPath = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  const exactLabel = EXACT_LOADING_LABELS[normalizedPath];
  if (exactLabel) return exactLabel;

  const [, role, section, detail] = normalizedPath.split("/");
  if (role === "customer" && section === "wallet" && detail === "verify") return "Verifying your wallet…";
  if (section === "profile" && detail === "edit") return role === "vendor" ? "Loading business profile editor…" : "Loading profile editor…";
  if (section === "profile" && detail === "sessions") return "Loading your active sessions…";
  if (role === "customer" && section === "orders" && detail) return "Loading order details…";
  if (role === "vendor" && section === "orders" && detail) return "Loading kitchen order details…";
  if (role === "rider" && section === "deliveries" && detail) return "Loading delivery details…";

  return WORKSPACE_LOADING_LABELS[role]?.[section] || "Loading this page…";
}

export default function RouteLoading() {
  const { pathname } = useLocation();
  return <div className="pepi-loading" role="status" aria-live="polite">{getRouteLoadingLabel(pathname)}</div>;
}
