import { useCallback, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Bike, Check, ChevronLeft, Clock3, MapPin, MessageCircle, Phone, Store } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import api, { getAdminWebSocketUrl } from "../../services/api";
import "./OrderFlowExperience.css";

type Order = {
  id: string; restaurant_name: string; status: string; items_count: number;
  total_amount: number; created_at: string; delivery_address: string;
  customer_order_code?: string; vendor_id: string;
  delivery_type?: string; payment_method?: string; scheduled_time?: string; special_instructions?: string; apartment?: string; landmark?: string; delivery_fee?: number; additional_fees?: number; discount_amount?: number; vendor?: { user_id?: string }; rider_info?: { name?: string; phone?: string; vehicle_type?: string; profile_image?: string; user_id?: string };
  rating?: number;
  order_subtotal?: number; discount?: number;
  order_items?: { id: string; quantity: number; price?: number; menu_item?: { name: string; price?: number } }[];
};
type Update = { id: string; status: string; message: string; timestamp: string };
type Tab = "active" | "completed" | "cancelled";

const activeStatuses = new Set(["scheduled", "pending", "accepted", "preparing", "ready", "picked_up"]);
const progressSteps = [
  ["scheduled", "Order Scheduled"], ["pending", "Order Placed"], ["accepted", "Order Accepted"],
  ["preparing", "Preparing"], ["ready", "Ready for Pickup"], ["picked_up", "Picked Up"], ["completed", "Delivered"],
] as const;
const statusMessages: Record<string, string> = {
  scheduled: "Your order is saved and will be sent to the kitchen at the selected WAT time.",
  pending: "Your order has been received and is waiting for confirmation.", accepted: "Store has accepted your order.",
  preparing: "The restaurant is preparing your order.", ready: "Your order is ready for pickup.",
  picked_up: "A rider has picked up your order.", completed: "Your order has been delivered.",
};

export default function CustomerOrders() {
  const [params, setParams] = useSearchParams();
  const [orders, setOrders] = useState<Order[]>([]);
  const [tab, setTab] = useState<Tab>("active");
  const [selected, setSelected] = useState<Order | null>(null);
  const [timeline, setTimeline] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [trackingError, setTrackingError] = useState("");
  const [rating, setRating] = useState(0); const [review, setReview] = useState(""); const [reviewing, setReviewing] = useState(false); const [reviewMessage, setReviewMessage] = useState("");
  const selectedId = selected?.id;
  const load = useCallback(async () => {
    setError("");
    try {
      const { data } = await api.get<Order[]>("/orders/");
      setOrders(data);
      setSelected(current => current ? data.find(order => order.id === current.id) || current : null);
    } catch { setError("Could not load orders. Please try again."); }
    finally { setLoading(false); }
  }, []);
  const openOrder = useCallback(async (order: Order) => { setTimeline([]); setSelected(order); setParams({ orderId: order.id }); try { const { data } = await api.get<Order>(`/orders/${order.id}`); setSelected(data); } catch { /* list data remains available */ } }, [setParams]);
  useEffect(() => {
    void load();
    const interval = window.setInterval(() => void load(), 30000);
    return () => window.clearInterval(interval);
  }, [load]);
  useEffect(() => { const token = localStorage.getItem("authToken"); if (!token) return; const socket = new WebSocket(`${getAdminWebSocketUrl()}?token=${encodeURIComponent(token)}`); socket.onmessage = event => { try { const message = JSON.parse(event.data); if (message.type === "notification" && message.notification_type === "order_status") { void load(); if (message.data?.order_id && message.data.order_id === selectedId) void api.get<Order>(`/orders/${selectedId}`).then(({ data }) => setSelected(data)); } } catch { /* Ignore malformed events. */ } }; return () => socket.close(); }, [load, selectedId]);
  useEffect(() => { const id = params.get("orderId"); if (!id || selected?.id === id) return; const existing = orders.find(order => order.id === id); if (existing) void openOrder(existing); }, [orders, params, selected?.id, openOrder]);
  useEffect(() => {
    if (!selectedId) return;
    let active = true;
    const read = () => api.get<Update[]>(`/orders/${selectedId}/tracking`)
      .then(({ data }) => { if (active) { setTimeline(data); setTrackingError(""); } })
      .catch(() => { if (active) setTrackingError("Could not load tracking updates."); });
    void read();
    const interval = window.setInterval(() => void read(), 30000);
    return () => { active = false; window.clearInterval(interval); };
  }, [selectedId]);
  const visible = orders.filter(order => tab === "active" ? activeStatuses.has(order.status) : tab === "completed" ? order.status === "completed" : ["cancelled", "failed"].includes(order.status));
  const money = (value: number) => `₦${Number(value || 0).toLocaleString("en-NG")}`;
  const date = (value: string) => new Date(value).toLocaleString("en-NG", { dateStyle: "medium", timeStyle: "short" });
  const submitReview = async () => { if (!selected || !rating) return; setReviewing(true); setReviewMessage(""); try { await api.post("/vendors/reviews", { vendor_id: selected.vendor_id, order_id: selected.id, rating, comment: review.trim() || null }); setSelected(current => current ? { ...current, rating } : current); setReviewMessage("Thank you for your review."); } catch (err) { setReviewMessage((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Your review could not be submitted."); } finally { setReviewing(false); } };
  if (selected) {
    const currentStep = progressSteps.findIndex(([status]) => status === selected.status);
    const orderCode = selected.customer_order_code || selected.id.slice(0, 5).toUpperCase();
    const subtotal = selected.order_subtotal ?? Math.max(0, selected.total_amount - (selected.delivery_fee || 0) + (selected.discount_amount || selected.discount || 0));
    return <div className="pepi-track-order">
    <header className="pepi-track-header"><button aria-label="Back to orders" onClick={() => { setSelected(null); setParams({}); }}><ChevronLeft size={22}/></button><h2>Track Order</h2><button aria-label="Refresh order" onClick={() => void load()}>Refresh</button></header>
    <section className="pepi-track-card pepi-track-status"><span><Clock3 size={27}/></span><div><h3>{progressSteps[currentStep]?.[1] || selected.status.replaceAll("_", " ")}</h3><p>{statusMessages[selected.status] || "Your order status has been updated."}</p></div></section>
    <section className="pepi-track-card pepi-track-info">
      <div className="pepi-track-info-row"><Store size={21}/><div><small>Store</small><strong>{selected.restaurant_name}</strong></div></div><hr/>
      <span className="pepi-track-badge type">{selected.delivery_type === "pickup" ? "Pickup" : "Delivery"}</span><hr/>
      {selected.delivery_type !== "pickup" && <><div className="pepi-track-info-row"><MapPin size={21}/><div><small>Delivery Address</small><strong>{selected.delivery_address}{selected.apartment ? ` · ${selected.apartment}` : ""}{selected.landmark ? ` · ${selected.landmark}` : ""}</strong></div></div><hr/></>}
      <span className="pepi-track-badge payment">{selected.payment_method === "cod" ? "Cash on Delivery" : selected.payment_method === "wallet" ? "Wallet" : "Paid Online"}</span>
      <hr/><div className="pepi-order-code"><small>Order Code</small><strong>{orderCode}</strong><div><QRCodeSVG value={String(orderCode)} size={180} level="M" marginSize={1} title="Order code"/></div><p>{selected.delivery_type === "pickup" ? "Show this code at the kitchen." : "Share this code with your rider only when the order arrives."}</p></div>
    </section>
    {selected.delivery_type !== "pickup" && selected.rider_info && <section className="pepi-track-card pepi-rider-card"><h3>Your Rider</h3><div className="pepi-rider-info">{selected.rider_info.profile_image ? <img src={selected.rider_info.profile_image} alt=""/> : <span><Bike size={25}/></span>}<div><strong>{selected.rider_info.name || "Rider"}</strong><small>{selected.rider_info.vehicle_type || "Delivery rider"}</small></div></div><div className="pepi-rider-actions">{selected.rider_info.phone && <a aria-label="Call rider" href={`tel:${selected.rider_info.phone}`}><Phone size={18}/></a>}{selected.rider_info.user_id && <Link to={`/customer/messages?recipientId=${encodeURIComponent(selected.rider_info.user_id)}`}><MessageCircle size={18}/>Message Rider</Link>}</div></section>}
    {selected.vendor?.user_id && <Link className="pepi-message-store" to={`/customer/messages?recipientId=${encodeURIComponent(selected.vendor.user_id)}`}><MessageCircle size={20}/>Message Store</Link>}
    <section className="pepi-track-card pepi-progress-card"><h3>Order Progress</h3>{trackingError && <p role="alert">{trackingError}</p>}<div className="pepi-progress-list">{progressSteps.map(([status, label], index) => { const done = currentStep >= index; const current = currentStep === index; return <div className={`${done ? "done" : ""} ${current ? "current" : ""}`} key={status}><i>{done && <Check size={12}/>}</i><span><strong>{label}</strong>{current && <small>{statusMessages[selected.status]}</small>}</span></div>; })}</div>{timeline.length > 0 && <details><summary>View update history</summary>{timeline.map(update => <p key={update.id}><strong>{update.status.replaceAll("_", " ")}</strong> · {update.message} <small>{date(update.timestamp)}</small></p>)}</details>}</section>
    {selected.order_items && selected.order_items.length > 0 && <section className="pepi-track-card pepi-items-card"><h3>Order Items</h3>{selected.order_items.map(item => <div className="pepi-item-row" key={item.id}><span>{item.quantity}x</span><strong>{item.menu_item?.name || "Item"}</strong><b>{money((item.price ?? item.menu_item?.price ?? 0) * item.quantity)}</b></div>)}<div className="pepi-price-list"><p><span>Subtotal</span><strong>{money(subtotal)}</strong></p>{Boolean(selected.delivery_fee) && <p><span>Delivery Fee</span><strong>{money(selected.delivery_fee || 0)}</strong></p>}{Boolean(selected.discount_amount || selected.discount) && <p className="discount"><span>Discount</span><strong>-{money(selected.discount_amount || selected.discount || 0)}</strong></p>}<p className="total"><span>Total</span><strong>{money(selected.total_amount)}</strong></p></div>{selected.special_instructions && <p className="pepi-instructions"><strong>Instructions</strong><br/>{selected.special_instructions}</p>}</section>}
    {selected.status === "completed" && <section className="pepi-panel pepi-review-card"><h3>How was your order?</h3>{selected.rating ? <p>You rated this order {selected.rating} out of 5.</p> : <><div className="pepi-rating-row" aria-label="Rate this order">{[1,2,3,4,5].map(value => <button key={value} className={value <= rating ? "active" : ""} onClick={() => setRating(value)} aria-label={`${value} stars`}>★</button>)}</div><label>Share a little more<textarea value={review} onChange={event => setReview(event.target.value)} placeholder="Food quality, packaging, and service"/></label><button className="pepi-primary" disabled={!rating || reviewing} onClick={() => void submitReview()}>{reviewing ? "Submitting" : "Submit review"}</button></>}{reviewMessage && <p role="status">{reviewMessage}</p>}</section>}
    <Link className="pepi-order-help" to="/customer/support">Need help with this order?</Link>
  </div>;
  }
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Your picks</p><h2>Orders</h2></div><button onClick={() => { setLoading(true); void load(); }}>Refresh</button></div><div className="pepi-filter-row">{(["active", "completed", "cancelled"] as Tab[]).map(value => <button key={value} className={tab === value ? "selected" : ""} onClick={() => setTab(value)}>{value === "active" ? "Active" : value === "completed" ? "Completed" : "Cancelled"}</button>)}</div>{loading && <p role="status">Loading orders…</p>}{error && <p role="alert">{error} <button onClick={() => void load()}>Retry</button></p>}{!loading && !error && visible.length === 0 && <div className="pepi-panel"><p>No {tab} orders yet.</p><Link to="/customer/search">Explore meals</Link></div>}<div className="pepi-grid">{visible.map(order => <button className="pepi-info-card pepi-order-card" key={order.id} onClick={() => void openOrder(order)}><small>{date(order.created_at)}</small><h3>{order.restaurant_name}</h3><p>{order.items_count} item{order.items_count === 1 ? "" : "s"} · {money(order.total_amount)}</p><strong>{order.status.replaceAll("_", " ")}</strong><span>View details →</span></button>)}</div></>;
}
