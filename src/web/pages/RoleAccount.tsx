import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bell, Bike, Camera, ChevronRight, CircleHelp, ClipboardList, Clock3, CreditCard, FileText, Heart, History, LayoutGrid, LocateFixed, Lock, LogOut, MapPin, MessageCircle, Shield, Smartphone, Star, Store, UserRound, WalletCards } from "lucide-react";
import api from "../../services/api";
import { readStoredUser, type PepiRole } from "../auth/roleRouting";

type Role = Exclude<PepiRole, "admin">;
type Json = Record<string, unknown>;
const errorText = (error: unknown) => (error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Something went wrong. Please try again.";
const textValue = (value: unknown) => typeof value === "string" ? value : value == null ? "" : String(value);

function useRemote<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const load = useCallback(async () => {
    setLoading(true); setError("");
    try { const response = await api.get<T>(url); setData(response.data); }
    catch (err) { setError(errorText(err)); }
    finally { setLoading(false); }
  }, [url]);
  useEffect(() => { void load(); }, [load]);
  return { data, loading, error, load, setData };
}

type ProfileField = { key: string; label: string; section: string; type?: "text" | "email" | "tel" | "number" | "textarea" | "select"; readOnly?: boolean; options?: string[]; placeholder?: string };
const profileFields: Record<Role, ProfileField[]> = {
  customer: [
    { key: "firstname", label: "First name", section: "Personal information" }, { key: "lastname", label: "Last name", section: "Personal information" },
    { key: "email", label: "Email address", section: "Personal information", type: "email", readOnly: true }, { key: "phone", label: "Phone number", section: "Personal information", type: "tel" },
    { key: "address", label: "Street address", section: "Primary address", placeholder: "House number and street" }, { key: "state", label: "State", section: "Primary address" },
    { key: "city", label: "City", section: "Primary address" }, { key: "zip", label: "Postcode", section: "Primary address" },
  ],
  vendor: [
    { key: "business_name", label: "Store name", section: "Business information" }, { key: "business_email", label: "Business email", section: "Business information", type: "email", readOnly: true },
    { key: "business_phone", label: "Business phone", section: "Business information", type: "tel" }, { key: "business_address", label: "Business address", section: "Business information", placeholder: "Search or enter full address" },
    { key: "business_description", label: "Business description", section: "Business information", type: "textarea" }, { key: "state", label: "State", section: "Address details" },
    { key: "city", label: "City", section: "Address details" }, { key: "zip", label: "Postcode", section: "Address details" },
    { key: "latitude", label: "Latitude", section: "Pinned location", type: "number" }, { key: "longitude", label: "Longitude", section: "Pinned location", type: "number" },
    { key: "firstname", label: "First name", section: "Personal information" }, { key: "lastname", label: "Last name", section: "Personal information" },
    { key: "email", label: "Account email", section: "Personal information", type: "email", readOnly: true }, { key: "phone", label: "Personal phone", section: "Personal information", type: "tel" },
  ],
  rider: [
    { key: "firstname", label: "First name", section: "Personal information" }, { key: "lastname", label: "Last name", section: "Personal information" },
    { key: "email", label: "Email address", section: "Personal information", type: "email", readOnly: true }, { key: "phone", label: "Phone number", section: "Personal information", type: "tel" },
    { key: "gender", label: "Gender", section: "Personal information", type: "select", options: ["Male", "Female", "Other"] }, { key: "address", label: "Residential address", section: "Address details" },
    { key: "state", label: "State", section: "Address details" }, { key: "city", label: "City", section: "Address details" }, { key: "zip", label: "Postcode", section: "Address details" },
    { key: "vehicle_type", label: "Vehicle type", section: "Vehicle information", type: "select", options: ["Bicycle", "Motorcycle", "Car", "Van"] }, { key: "vehicle_brand", label: "Vehicle brand", section: "Vehicle information" },
    { key: "plate_number", label: "Plate number", section: "Vehicle information" }, { key: "vehicle_registration", label: "Vehicle registration", section: "Vehicle information" },
    { key: "previous_work", label: "Previous delivery work", section: "Work information", type: "textarea" }, { key: "work_duration", label: "Work duration", section: "Work information" },
    { key: "next_of_kin_name", label: "Next of kin name", section: "Emergency contact" }, { key: "next_of_kin_phone", label: "Next of kin phone", section: "Emergency contact", type: "tel" },
    { key: "delivery_range", label: "Delivery range (km)", section: "Work zone", type: "number" }, { key: "latitude", label: "Latitude", section: "Work zone", type: "number" }, { key: "longitude", label: "Longitude", section: "Work zone", type: "number" },
  ],
};

const accountMenus = {
  customer: [
    ["Profile", "/customer/profile/edit", UserRound], ["Favorite meals", "/customer/favorites", Heart],
    ["Order history", "/customer/orders", History], ["Wallet", "/customer/wallet", WalletCards],
    ["Devices and sessions", "/customer/profile/sessions", Smartphone], ["Change password", "/customer/change-password", Lock],
    ["FAQ", "/customer/faq", CircleHelp], ["Support", "/customer/support", MessageCircle],
    ["Privacy policy", "/privacy", Shield], ["Terms of service", "/terms", FileText],
  ],
  vendor: [
    ["Profile", "/vendor/profile/edit", UserRound], ["Menu", "/vendor/menu", LayoutGrid],
    ["Order history", "/vendor/history", History], ["Earning and payment", "/vendor/earnings", CreditCard],
    ["Devices and sessions", "/vendor/profile/sessions", Smartphone], ["Change password", "/vendor/change-password", Lock],
    ["Reviews and ratings", "/vendor/reviews", Star], ["Support", "/vendor/support", MessageCircle],
    ["Privacy policy", "/privacy", Shield], ["Terms of service", "/terms", FileText],
  ],
  rider: [
    ["Profile", "/rider/profile/edit", UserRound], ["Order history", "/rider/activity", ClipboardList],
    ["Daily rider activity", "/rider/activity", Clock3], ["Earning and payment", "/rider/earnings", CreditCard],
    ["Devices and sessions", "/rider/profile/sessions", Smartphone], ["Support", "/rider/support", MessageCircle],
    ["Privacy policy", "/privacy", Shield], ["Terms of service", "/terms", FileText],
  ],
} as const;

function AccountOverview({ role, data, reload }: { role: Role; data: Json; reload: () => Promise<void> }) {
  const navigate = useNavigate();
  const stored = readStoredUser();
  const firstName = textValue(data.firstname || stored?.firstname);
  const lastName = textValue(data.lastname || stored?.lastname);
  const businessName = textValue(data.business_name);
  const name = role === "vendor" ? businessName || `${firstName} ${lastName}`.trim() : `${firstName} ${lastName}`.trim();
  const email = textValue(data.email || data.business_email || stored?.email);
  const phone = textValue(data.phone || data.business_phone || stored?.phone);
  const subtitle = role === "vendor" ? textValue(data.business_address) : email;
  const image = textValue(data.profile_image || data.logo_url);
  const initials = (role === "vendor" ? businessName : `${firstName} ${lastName}`).split(/\s+/).filter(Boolean).slice(0, 2).map(part => part[0]).join("").toUpperCase() || role[0].toUpperCase();
  const signOut = () => { localStorage.removeItem("authToken"); localStorage.removeItem("refreshToken"); localStorage.removeItem("userData"); navigate("/signin"); };
  return <section className={`pepi-account-screen pepi-account-screen--${role}`}>
    <header className="pepi-account-header"><div><p className="pepi-eyebrow">Account</p><h2>Profile</h2></div><button onClick={() => void reload()}>Refresh</button></header>
    <div className="pepi-account-card">
      <div className="pepi-account-identity">{image ? <img src={image} alt=""/> : <span>{initials}</span>}<div><h3>{name || `${role[0].toUpperCase()}${role.slice(1)}`}</h3>{subtitle && <p>{subtitle}</p>}{phone && <strong>{phone}</strong>}</div></div>
      <nav className="pepi-account-menu" aria-label={`${role} account options`}>{accountMenus[role].map(([label, path, Icon]) => <Link to={path} key={`${label}-${path}`}><span className="pepi-account-menu-icon"><Icon size={21}/></span><span>{label}</span><ChevronRight size={19}/></Link>)}</nav>
      <button className="pepi-account-logout" onClick={signOut}><span>Log out</span><LogOut size={21}/></button>
    </div>
  </section>;
}

export function ProfilePage({ role, edit = false }: { role: Role; edit?: boolean }) {
  const vendorId = readStoredUser()?.vendor_id;
  const url = role === "customer" ? "/user/profile" : role === "vendor" ? `/vendors/${vendorId || "missing"}` : "/riders/profile";
  const { data, loading, error, load } = useRemote<Json>(url);
  const [form, setForm] = useState<Json>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (!data) return;
    const stored = readStoredUser();
    setForm({ ...data, email: data.email || stored?.email || "", firstname: data.firstname || stored?.firstname || "", lastname: data.lastname || stored?.lastname || "", phone: data.phone || stored?.phone || "" });
  }, [data]);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setMessage("");
    const payload: Json = {};
    for (const field of profileFields[role]) {
      if (field.readOnly) continue;
      const value = textValue(form[field.key]).trim();
      payload[field.key] = field.type === "number" ? (value === "" ? null : Number(value)) : value;
    }
    try {
      await api.patch(role === "customer" ? "/user/profile" : role === "vendor" ? `/vendors/${vendorId}` : "/riders/profile", payload);
      setMessage("Profile saved."); await load();
    } catch (err) { setMessage(errorText(err)); }
    finally { setSaving(false); }
  }
  async function uploadPhoto(file?: File) {
    if (!file) return;
    setUploading(true); setMessage("");
    try {
      const body = new FormData(); body.append("file", file);
      const endpoint = role === "customer" ? "/user/profile/image" : role === "vendor" ? `/vendors/upload-asset?vendor_id=${encodeURIComponent(vendorId || "")}&asset_type=logo` : "/riders/upload-document?document_type=profile_photo";
      const { data: uploaded } = await api.post<{ url?: string; secure_url?: string }>(endpoint, body, { headers: { "Content-Type": "multipart/form-data" } });
      const image = uploaded.url || uploaded.secure_url;
      if (!image) throw new Error("Upload did not return an image URL.");
      if (role === "vendor") await api.patch(`/vendors/${vendorId}`, { logo_url: image });
      setForm(current => ({ ...current, [role === "vendor" ? "logo_url" : "profile_image"]: image }));
      setMessage("Profile photo updated."); await load();
    } catch (err) { setMessage(errorText(err)); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  }
  function useCurrentLocation() {
    if (!navigator.geolocation) { setMessage("Location is not supported by this browser."); return; }
    setLocating(true); setMessage("");
    navigator.geolocation.getCurrentPosition(
      position => { setForm(current => ({ ...current, latitude: position.coords.latitude, longitude: position.coords.longitude })); setLocating(false); },
      () => { setMessage("Could not access your location. Check browser permission and try again."); setLocating(false); },
      { enableHighAccuracy: true, timeout: 15000 },
    );
  }
  if (!edit) return <>{loading && <p role="status">Loading profile…</p>}{error && <p role="alert">{error} <button onClick={() => void load()}>Retry</button></p>}{data && <AccountOverview role={role} data={data} reload={load}/>}</>;
  const sections = [...new Set(profileFields[role].map(field => field.section))];
  const image = textValue(form[role === "vendor" ? "logo_url" : "profile_image"]);
  const displayName = role === "vendor" ? textValue(form.business_name) : `${textValue(form.firstname)} ${textValue(form.lastname)}`.trim();
  const ProfileIcon = role === "vendor" ? Store : role === "rider" ? Bike : UserRound;
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Account</p><h2>Edit profile</h2><p>Keep your account, contact, and location details current.</p></div></div>
    {loading && <p role="status">Loading profile…</p>}{error && <p role="alert">{error} <button onClick={() => void load()}>Retry</button></p>}
    {data && <form className="pepi-profile-form" onSubmit={save}>
      <section className="pepi-profile-hero">
        <button type="button" className="pepi-profile-photo" onClick={() => fileRef.current?.click()} disabled={uploading} aria-label="Update profile photo">{image ? <img src={image} alt=""/> : <ProfileIcon size={34}/>}<span><Camera size={14}/>{uploading ? "Uploading" : "Update photo"}</span></button>
        <input ref={fileRef} className="sr-only" type="file" accept="image/*" onChange={event => void uploadPhoto(event.target.files?.[0])}/>
        <div><h3>{displayName || `${role[0].toUpperCase()}${role.slice(1)}`}</h3><strong>{role === "vendor" ? textValue(form.business_category) || "Restaurant" : role === "rider" ? "Rider" : "Customer"}</strong><p>{textValue(form.email || form.business_email)}</p><p>{textValue(form.phone || form.business_phone)}</p></div>
      </section>
      {Boolean(data.status) && <div className="pepi-profile-status">Account status: <strong>{textValue(data.status)}</strong>{data.business_name_status === "pending" && <span> · Store name change pending approval</span>}</div>}
      {sections.map(section => <fieldset key={section} className="pepi-profile-section"><legend>{section}</legend>
        {section.includes("location") || section === "Work zone" ? <button type="button" className="pepi-location-button" onClick={useCurrentLocation} disabled={locating}><LocateFixed size={17}/>{locating ? "Finding location…" : "Use current location"}</button> : null}
        <div className="pepi-profile-fields">{profileFields[role].filter(field => field.section === section).map(field => <label className={field.type === "textarea" ? "is-wide" : ""} key={field.key}>{field.label}
          {field.type === "textarea" ? <textarea value={textValue(form[field.key])} readOnly={field.readOnly} placeholder={field.placeholder} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}/>
            : field.type === "select" ? <select value={textValue(form[field.key])} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}><option value="">Select {field.label.toLowerCase()}</option>{field.options?.map(option => <option key={option} value={option.toLowerCase()}>{option}</option>)}</select>
            : <input type={field.type || "text"} step={field.type === "number" ? "any" : undefined} value={textValue(form[field.key])} readOnly={field.readOnly} placeholder={field.placeholder} onChange={event => setForm(current => ({ ...current, [field.key]: event.target.value }))}/>}
        </label>)}</div>
      </fieldset>)}
      {role === "customer" && <Link className="pepi-profile-address-link" to="/customer/addresses"><MapPin size={18}/><span><strong>Saved delivery addresses</strong><small>Add, edit, delete, or choose your default delivery address.</small></span><ChevronRight size={18}/></Link>}
      <button className="pepi-primary pepi-profile-save" disabled={saving || uploading}>{saving ? "Saving…" : "Save changes"}</button>{message && <p className={message.includes("updated") || message.includes("saved") ? "pepi-inline-notice" : "pepi-inline-error"} role="status">{message}</p>}
    </form>}
  </>;
}

type Session = { id: string; device_name?: string; platform?: string; last_active?: string; is_current?: boolean };
export function SessionsPage() {
  const { data, loading, error, load } = useRemote<Session[]>("/auth/sessions");
  const [message, setMessage] = useState("");
  async function revoke(id: string) { try { await api.delete(`/auth/sessions/${id}`); setMessage("Session ended."); await load(); } catch (err) { setMessage(errorText(err)); } }
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Security</p><h2>Devices and sessions</h2></div></div>{loading && <p role="status">Loading sessions…</p>}{error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}<div className="pepi-panel">{data?.length ? data.map(session => <div className="pepi-cart-row" key={session.id}><div><strong>{session.device_name || session.platform || "Device"}{session.is_current ? " · Current" : ""}</strong><small>{session.last_active ? new Date(session.last_active).toLocaleString() : ""}</small></div><button disabled={session.is_current} onClick={() => void revoke(session.id)}>Sign out</button></div>) : !loading && <p>No active sessions found.</p>}</div></>;
}

type Notification = { id: string; title?: string; message?: string; body?: string; is_read?: boolean; created_at?: string; order_id?: string; conversation_id?: string; data?: { order_id?: string; conversation_id?: string } };
export function NotificationsPage({ role }: { role: Role }) {
  const navigate = useNavigate();
  const base = role === "customer" ? "/customer/notifications" : role === "vendor" ? "/vendors/notifications" : "/riders/notifications";
  const [items, setItems] = useState<Notification[]>([]); const [error, setError] = useState(""); const [loading, setLoading] = useState(true);
  const load = useCallback(async () => {
    setError(""); setLoading(true);
    try { const { data } = await api.get<Notification[] | { notifications: Notification[] }>(base, role === "customer" ? { params: { limit: 50 } } : undefined); setItems(Array.isArray(data) ? data : data.notifications || []); }
    catch (err) { setError(errorText(err)); } finally { setLoading(false); }
  }, [base, role]);
  useEffect(() => { void load(); }, [load]);
  async function markAllRead() { try { await api.post(`${base}/read-all`); window.dispatchEvent(new Event("pepi-notifications-change")); await load(); } catch (err) { setError(errorText(err)); } }
  const grouped = items.reduce<Record<string, Notification[]>>((result, item) => { const date = item.created_at ? new Date(item.created_at) : new Date(); const today = new Date(); const yesterday = new Date(); yesterday.setDate(today.getDate() - 1); const key = date.toDateString() === today.toDateString() ? "Today" : date.toDateString() === yesterday.toDateString() ? "Yesterday" : date.toLocaleDateString("en-NG", { dateStyle: "long" }); (result[key] ||= []).push(item); return result; }, {});
  const unread = items.filter(item => !item.is_read).length;
  const destination = (item: Notification) => {
    const orderId = item.data?.order_id || item.order_id; const conversationId = item.data?.conversation_id || item.conversation_id;
    if (conversationId) return `/${role}/${role === "customer" ? "messages" : "chat"}?conversationId=${encodeURIComponent(conversationId)}`;
    if (!orderId) return "";
    if (role === "customer") return `/customer/orders?orderId=${encodeURIComponent(orderId)}`;
    if (role === "vendor") return `/vendor/orders/${encodeURIComponent(orderId)}`;
    return `/rider/deliveries/${encodeURIComponent(orderId)}`;
  };
  function openNotification(item: Notification) {
    if (!item.is_read) {
      setItems(current => current.map(value => value.id === item.id ? { ...value, is_read: true } : value));
      void api.post(`${base}/${item.id}/read`).then(() => window.dispatchEvent(new Event("pepi-notifications-change"))).catch(err => { setError(errorText(err)); void load(); });
    }
    const target = destination(item); if (target) navigate(target);
  }
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Updates</p><h2>Notifications</h2><p>{unread ? `${unread} unread update${unread === 1 ? "" : "s"}` : "You are all caught up."}</p></div><div className="pepi-heading-actions">{unread > 0 && <button className="pepi-secondary-action" onClick={() => void markAllRead()}>Mark all read</button>}<button className="pepi-secondary-action" onClick={() => void load()}>Refresh</button></div></div>{loading && <p role="status">Loading notifications…</p>}{error && <p role="alert">{error}</p>}<div className="pepi-notification-groups">{Object.entries(grouped).map(([date, notifications]) => <section key={date}><h3>{date}</h3><div className="pepi-panel">{notifications.map(item => { const orderId = item.data?.order_id || item.order_id; const target = destination(item); return <button type="button" className={`pepi-notification-row ${item.is_read ? "" : "is-unread"} ${target ? "is-drillable" : ""}`} key={item.id} onClick={() => openNotification(item)}><span className="pepi-notification-icon"><Bell size={19}/>{!item.is_read && <i/>}</span><span className="pepi-notification-copy"><span><strong>{item.title || "Update"}</strong>{item.created_at && <time>{new Date(item.created_at).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}</time>}</span><small>{item.message || item.body}</small>{orderId && <b>Order ID: {String(orderId).slice(0, 8).toUpperCase()}</b>}</span>{target && <span className="pepi-notification-open">{orderId ? "View order" : "Open chat"}<ChevronRight size={16}/></span>}</button>; })}</div></section>)}{!loading && !items.length && <div className="pepi-panel">No notifications yet.</div>}</div></>;
}

type Ticket = { id: string; ticket_number?: string; subject: string; description?: string; status: string; resolution?: string; messages?: { id: string; message: string; sender_role?: string; created_at?: string; attachments?: string[] }[] };
export function SupportPage() {
  const { data, loading, error, load } = useRemote<Ticket[]>("/support/tickets");
  const [subject, setSubject] = useState(""); const [description, setDescription] = useState(""); const [category, setCategory] = useState("account_issue"); const [busy, setBusy] = useState(false); const [message, setMessage] = useState(""); const [files, setFiles] = useState<File[]>([]); const [selected, setSelected] = useState<Ticket | null>(null); const [reply, setReply] = useState("");
  async function uploadAll(selectedFiles: File[]) { const urls: string[] = []; for (const file of selectedFiles.slice(0, 5)) { const form = new FormData(); form.append("file", file); const { data } = await api.post<{ url?: string; secure_url?: string }>("/support/attachments", form, { headers: { "Content-Type": "multipart/form-data" } }); const url = data.url || data.secure_url; if (url) urls.push(url); } return urls; }
  async function submit(event: FormEvent) { event.preventDefault(); setBusy(true); setMessage(""); try { const attachments = await uploadAll(files); await api.post("/support/tickets", { subject, description, category, attachments }); setSubject(""); setDescription(""); setFiles([]); setMessage("Support ticket created."); await load(); } catch (err) { setMessage(errorText(err)); } finally { setBusy(false); } }
  async function open(ticket: Ticket) { setBusy(true); try { const { data: detail } = await api.get<Ticket>(`/support/tickets/${ticket.id}`); setSelected(detail); } catch (err) { setMessage(errorText(err)); } finally { setBusy(false); } }
  async function sendReply(event: FormEvent) { event.preventDefault(); if (!selected || !reply.trim()) return; setBusy(true); try { await api.post(`/support/tickets/${selected.id}/messages`, { message: reply.trim(), attachments: [] }); setReply(""); await open(selected); await load(); } catch (err) { setMessage(errorText(err)); setBusy(false); } }
  return <><div className="pepi-page-heading"><div><h2>Support</h2><p>Start a request or continue a conversation with the support team.</p></div></div><form className="pepi-panel pepi-checkout-form" onSubmit={submit}><h3>Ask Pepi for help</h3><label>Category<select value={category} onChange={event => setCategory(event.target.value)}>{["account_issue", "payment_issue", "late_delivery", "missing_item", "wrong_item", "rider_issue", "vendor_issue", "refund", "promo_issue", "food_quality", "safety_complaint"].map(value => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select></label><label>Subject<input value={subject} onChange={event => setSubject(event.target.value)} minLength={3} required /></label><label>What happened?<textarea value={description} onChange={event => setDescription(event.target.value)} minLength={5} required /></label><label>Photos or documents<input type="file" multiple accept="image/*,.pdf" onChange={event => setFiles(Array.from(event.target.files || []).slice(0, 5))}/><small>{files.length ? `${files.length} file${files.length === 1 ? "" : "s"} selected` : "Up to five files"}</small></label><button className="pepi-primary" disabled={busy}>{busy ? "Sending" : "Create ticket"}</button>{message && <p role="status">{message}</p>}</form><section className="pepi-section"><h3>Your tickets</h3>{loading && <p role="status">Loading tickets</p>}{error && <p role="alert">{error}</p>}<div className="pepi-panel">{data?.length ? data.map(ticket => <button className="pepi-support-ticket" key={ticket.id} onClick={() => void open(ticket)}><span><strong>{ticket.subject}</strong><small>{ticket.ticket_number} · {ticket.status}</small></span><span>Open</span></button>) : !loading && <p>No support tickets yet.</p>}</div></section>{selected && <div className="pepi-dialog-backdrop" onMouseDown={() => setSelected(null)}><section className="pepi-dialog pepi-support-dialog" onMouseDown={event => event.stopPropagation()}><header><div><small>{selected.ticket_number} · {selected.status}</small><h3>{selected.subject}</h3></div><button onClick={() => setSelected(null)} aria-label="Close">×</button></header><div className="pepi-support-messages">{selected.messages?.map(item => <article className={item.sender_role === "admin" ? "from-support" : "from-user"} key={item.id}><p>{item.message}</p>{item.attachments?.map(url => <a href={url} target="_blank" rel="noreferrer" key={url}>Open attachment</a>)}<small>{item.sender_role === "admin" ? "Support" : "You"}{item.created_at ? ` · ${new Date(item.created_at).toLocaleString()}` : ""}</small></article>)}{selected.resolution && <div className="pepi-inline-notice"><strong>Resolution</strong><p>{selected.resolution}</p></div>}</div>{!["closed", "resolved"].includes(selected.status) && <form className="pepi-support-reply" onSubmit={sendReply}><textarea required value={reply} onChange={event => setReply(event.target.value)} placeholder="Write a reply"/><button className="pepi-primary" disabled={busy}>Send</button></form>}</section></div>}</>;
}

export function WalletPage() {
  const { data, loading, error, load } = useRemote<{ balance: number }>("/payments/wallet/balance");
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Payments</p><h2>Wallet</h2></div></div>{loading && <p role="status">Loading balance…</p>}{error && <p role="alert">{error} <button onClick={() => void load()}>Retry</button></p>}{data && <div className="pepi-panel"><p>Available balance</p><h3>₦{Number(data.balance || 0).toLocaleString("en-NG")}</h3><p>Use your wallet at checkout in the Pepi app.</p></div>}</>;
}

export function ReviewsPage({ role }: { role: "vendor" | "rider" }) {
  const { data, loading, error } = useRemote<{ average_rating: number; total_reviews: number; reviews: { id: string; rating: number; comment?: string }[] }>(`/${role === "vendor" ? "vendors" : "riders"}/reviews`);
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Feedback</p><h2>Reviews</h2></div></div>{loading && <p role="status">Loading reviews…</p>}{error && <p role="alert">{error}</p>}{data && <><div className="pepi-panel"><strong>{Number(data.average_rating || 0).toFixed(1)} ★</strong> · {data.total_reviews} reviews</div><div className="pepi-panel">{data.reviews?.length ? data.reviews.map(review => <div className="pepi-cart-row" key={review.id}><div><strong>{review.rating} ★</strong><small>{review.comment || "No comment"}</small></div></div>) : <p>No reviews yet.</p>}</div></>}</>;
}

export function ActivityPage({ role }: { role: "vendor" | "rider" }) {
  const url = role === "vendor" ? "/orders/" : "/riders/orders";
  const { data, loading, error } = useRemote<{ id: string; status: string; created_at: string; total_amount?: number }[]>(url);
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">History</p><h2>{role === "vendor" ? "Order history" : "Activity"}</h2></div></div>{loading && <p role="status">Loading activity…</p>}{error && <p role="alert">{error}</p>}<div className="pepi-panel">{data?.length ? data.map(item => <div className="pepi-cart-row" key={item.id}><div><strong>#{item.id.slice(0, 8)}</strong><small>{item.created_at ? new Date(item.created_at).toLocaleString() : ""} · {item.status}</small></div><strong>₦{Number(item.total_amount || 0).toLocaleString("en-NG")}</strong></div>) : !loading && <p>No activity yet.</p>}</div></>;
}

export function SettingsPage() {
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Account</p><h2>Settings</h2></div></div><div className="pepi-panel pepi-account-links"><Link to="/rider/profile/edit">Edit rider profile</Link><Link to="/rider/profile/sessions">Devices and sessions</Link><Link to="/rider/notifications">Notifications</Link><Link to="/rider/support">Support</Link><Link to="/rider/earnings">Earnings</Link></div></>;
}
