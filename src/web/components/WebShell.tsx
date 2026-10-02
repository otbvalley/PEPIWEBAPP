import { useCallback, useEffect, useRef, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Activity, Bell, ChevronRight, CircleHelp, Clock3, Home, LogOut, MapPin, Menu, MessageCircle, Package, Settings, ShoppingCart, Star, UserRound, WalletCards, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { UserData } from "../../services/backendAuthService";
import logo from "../../assets/Logo SVG 1.png";
import RiderPresence from "./RiderPresence";
import api, { getAdminWebSocketUrl } from "../../services/api";
import { getCart } from "../customer/cart";
import "./WebShell.css";

type Role = "customer" | "vendor" | "rider";
type Props = { role: Role; user: UserData };
type ShellLink = readonly [label: string, path: string, icon: LucideIcon];

const primaryLinks: Record<Role, readonly ShellLink[]> = {
  customer: [
    ["Home", "/customer/home", Home], ["Order", "/customer/orders", Package],
    ["Cart", "/customer/cart", ShoppingCart], ["Account", "/customer/profile", UserRound],
  ],
  vendor: [
    ["Home", "/vendor/dashboard", Home], ["Orders", "/vendor/orders", Package],
    ["Chat", "/vendor/chat", MessageCircle], ["Account", "/vendor/profile", UserRound],
  ],
  rider: [
    ["Home", "/rider/dashboard", Home], ["Chat", "/rider/chat", MessageCircle],
    ["Orders", "/rider/deliveries", Package], ["Map", "/rider/map", MapPin], ["Account", "/rider/profile", UserRound],
  ],
} as const;
const desktopGroups: Record<Role, readonly { label: string; links: readonly ShellLink[] }[]> = {
  customer: [
    { label: "Order food", links: [["Home", "/customer/home", Home], ["Discover", "/customer/search", Menu], ["Cart", "/customer/cart", ShoppingCart], ["Orders", "/customer/orders", Package]] },
    { label: "Your Pepi", links: [["Messages", "/customer/messages", MessageCircle], ["Offers", "/customer/offers", Star], ["Wallet", "/customer/wallet", WalletCards], ["Addresses", "/customer/addresses", MapPin]] },
  ],
  vendor: [
    { label: "Operations", links: [["Home", "/vendor/dashboard", Home], ["Orders", "/vendor/orders", Package], ["Menu", "/vendor/menu", Menu], ["Chat", "/vendor/chat", MessageCircle]] },
    { label: "Business", links: [["Earnings", "/vendor/earnings", WalletCards], ["Reviews", "/vendor/reviews", Star], ["Order history", "/vendor/history", Clock3], ["Settings", "/vendor/settings", Settings]] },
  ],
  rider: [
    { label: "Deliveries", links: [["Home", "/rider/dashboard", Home], ["Orders", "/rider/deliveries", Package], ["Map", "/rider/map", MapPin], ["Chat", "/rider/chat", MessageCircle]] },
    { label: "Performance", links: [["Earnings", "/rider/earnings", WalletCards], ["Activity", "/rider/activity", Activity], ["Reviews", "/rider/reviews", Star], ["Settings", "/rider/settings", Settings]] },
  ],
} as const;

const pageNames: Record<string, string> = {
  home: "Home", dashboard: "Overview", search: "Discover", orders: "Orders", deliveries: "Deliveries",
  cart: "Your cart", checkout: "Checkout", messages: "Messages", chat: "Chat", menu: "Menu",
  earnings: "Earnings", reviews: "Reviews", profile: "Account", wallet: "Wallet", addresses: "Addresses",
  map: "Delivery map", notifications: "Notifications", history: "Order history", activity: "Activity",
  settings: "Settings", support: "Support",
};

function SidebarLink({ item, count }: { item: ShellLink; count?: number }) {
  const [label, path, Icon] = item;
  return <NavLink to={path} className={({ isActive }) => isActive ? "active" : ""}>
    <span className="pepi-nav-icon"><Icon size={18} strokeWidth={2} /></span>
    <span>{label}</span>{Boolean(count) && <b className="pepi-nav-count">{count && count > 99 ? "99+" : count}</b>}
    <ChevronRight className="pepi-nav-arrow" size={15} />
  </NavLink>;
}

export default function WebShell({ role, user }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const firstName = user.firstname || (role === "vendor" ? "Vendor" : role === "rider" ? "Rider" : "there");
  const initials = `${user.firstname?.[0] || ""}${user.lastname?.[0] || ""}`.trim() || firstName[0].toUpperCase();
  const routeKey = location.pathname.split("/").filter(Boolean).at(-1) || "home";
  const pageTitle = pageNames[routeKey] || routeKey.replace(/-/g, " ");
  const roleName = role[0].toUpperCase() + role.slice(1);
  const dashboardPath = role === "customer" ? "/customer/home" : `/${role}/dashboard`;
  const [notificationCount, setNotificationCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const [cartCount, setCartCount] = useState(() => role === "customer" ? getCart().reduce((sum, line) => sum + line.quantity, 0) : 0);
  const loadCounts = useCallback(async () => {
    try {
      const endpoint = role === "customer" ? "/customer/notifications" : role === "vendor" ? "/vendors/notifications" : "/riders/notifications";
      const { data } = await api.get(endpoint, { params: role === "customer" ? { limit: 1 } : undefined });
      const list = Array.isArray(data) ? data : data.notifications || [];
      setNotificationCount(Number(data.unread_count ?? list.filter((item: { is_read?: boolean }) => !item.is_read).length));
    } catch { /* Counts should never block the workspace. */ }
  }, [role]);
  useEffect(() => { void loadCounts(); const timer = window.setInterval(() => void loadCounts(), 30000); return () => window.clearInterval(timer); }, [loadCounts]);
  useEffect(() => { const update = () => void loadCounts(); window.addEventListener("pepi-notifications-change", update); return () => window.removeEventListener("pepi-notifications-change", update); }, [loadCounts]);
  useEffect(() => { if (role !== "customer") return; const update = () => setCartCount(getCart().reduce((sum, line) => sum + line.quantity, 0)); window.addEventListener("pepi-cart-change", update); return () => window.removeEventListener("pepi-cart-change", update); }, [role]);
  useEffect(() => { const token = localStorage.getItem("authToken"); if (!token) return; const socket = new WebSocket(`${getAdminWebSocketUrl()}?token=${encodeURIComponent(token)}`); socket.onmessage = event => { try { const message = JSON.parse(event.data); if (message.type === "notification") void loadCounts(); } catch { /* Ignore non-JSON events. */ } }; return () => socket.close(); }, [loadCounts]);
  useEffect(() => { setSidebarOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!sidebarOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { setSidebarOpen(false); menuButtonRef.current?.focus(); }
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => { document.body.style.overflow = previousOverflow; document.removeEventListener("keydown", onKeyDown); };
  }, [sidebarOpen]);
  const signOut = () => { localStorage.removeItem("authToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("userData"); navigate("/signin"); };
  return <div className={`pepi-shell pepi-shell--${role}`}>
    {sidebarOpen && <button className="pepi-sidebar-overlay" onClick={() => setSidebarOpen(false)} aria-label="Close navigation" />}
    <aside id="pepi-navigation" className={`pepi-sidebar${sidebarOpen ? " is-open" : ""}`} aria-label={`${roleName} navigation`}>
      <div className="pepi-sidebar-brand"><NavLink to={dashboardPath} className="pepi-logo"><img src={logo} alt="PickIT PickEAT" /></NavLink><span>{roleName}</span><button className="pepi-sidebar-close" onClick={() => { setSidebarOpen(false); menuButtonRef.current?.focus(); }} aria-label="Close navigation"><X size={21}/></button></div>
      <NavLink to={`/${role}/profile`} className="pepi-sidebar-user">
        <span className="pepi-user-avatar">{initials}</span>
        <span className="pepi-user-copy"><strong>{firstName}</strong><small>{user.email}</small></span>
      </NavLink>
      <nav aria-label={`${roleName} workspace`}>{desktopGroups[role].map(group => <div className="pepi-nav-group" key={group.label}><p>{group.label}</p>{group.links.map(item => <SidebarLink key={item[1]} item={item} count={item[1] === "/customer/cart" ? cartCount : undefined}/>)}</div>)}</nav>
      <div className="pepi-sidebar-footer">
        <NavLink to={`/${role}/support`} className="pepi-help-link"><CircleHelp size={18} /><span><strong>Need help?</strong><small>Visit support</small></span></NavLink>
        <button className="pepi-signout" onClick={signOut}><LogOut size={18}/> Sign out</button>
      </div>
    </aside>
    <div className="pepi-main">
      <header className="pepi-topbar">
        <div className="pepi-topbar-title"><button ref={menuButtonRef} className="pepi-menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open navigation" aria-expanded={sidebarOpen} aria-controls="pepi-navigation"><Menu size={21}/></button><span className="pepi-mobile-brand"><img src={logo} alt="" /></span><div><small><span>{roleName} workspace</span><ChevronRight size={13} />{pageTitle}</small><h1>{routeKey === "home" || routeKey === "dashboard" ? `Good day, ${firstName}` : pageTitle}</h1></div></div>
        <div className="pepi-topbar-actions">{role === "customer" && <NavLink to="/customer/cart" className="pepi-icon-button pepi-header-cart" aria-label={`Cart with ${cartCount} items`}><ShoppingCart size={19}/>{cartCount > 0 && <b className="pepi-header-count">{cartCount > 99 ? "99+" : cartCount}</b>}</NavLink>}<NavLink to={`/${role}/notifications`} className="pepi-icon-button" aria-label={`${notificationCount} unread notifications`}><Bell size={19}/>{notificationCount > 0 && <b className="pepi-header-count">{notificationCount > 99 ? "99+" : notificationCount}</b>}</NavLink><NavLink to={`/${role}/profile`} className="pepi-topbar-avatar" aria-label="Open account">{initials}</NavLink></div>
      </header>
      {role === "rider" && <RiderPresence />}
      <main className="pepi-content"><div className="pepi-content-inner"><Outlet context={{ inWebShell: true }} /></div></main>
      <nav className="pepi-mobile-tabs" style={{ gridTemplateColumns: `repeat(${primaryLinks[role].length}, 1fr)` }} aria-label="Main navigation">{primaryLinks[role].map(([label, path, Icon]) => <NavLink key={path} to={path} className={({ isActive }) => isActive ? "active" : ""}><span><Icon size={19} strokeWidth={2.1} />{path === "/customer/cart" && cartCount > 0 && <b className="pepi-tab-count">{cartCount > 9 ? "9+" : cartCount}</b>}</span><small>{label}</small></NavLink>)}</nav>
    </div>
  </div>;
}
