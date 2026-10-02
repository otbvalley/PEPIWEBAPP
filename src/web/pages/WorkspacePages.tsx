import { useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowRight, Bike, CheckCircle2, ChevronRight, Clock3, Compass, MapPin, PackageCheck, Search, ShoppingBag, Star, Store, TrendingUp, Truck, Utensils, WalletCards } from "lucide-react";
import api from "../../services/api";
import { addToCart } from "../customer/cart";
import { readStoredUser } from "../auth/roleRouting";
import "./WorkspaceExperience.css";

type Meal = { id: string; vendor_id: string; name: string; price: number; image_url?: string; category?: string; description?: string; has_addons?: boolean; addons?: { id: string; name: string; price: number }[]; vendor?: { business_name?: string } };
type Kitchen = { id: string; business_name: string; logo_url?: string; rating?: number | string; min_preparation_time?: number };
type HomeSection = { key: string; title: string; items: Meal[] };
type HomeData = { categories: string[]; top_items: Meal[]; all_kitchens: Kitchen[]; sections?: HomeSection[] };
type CustomerHomeOrder = { id: string; status: string; restaurant_name?: string; total_amount?: number; created_at?: string; items_count?: number; estimated_delivery_time?: string };

function useLoad<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    api.get<T>(url).then(({ data: result }) => { if (active) setData(result); })
      .catch(() => { if (active) setError("We couldn't load this right now. Please try again."); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url, attempt]);
  return { data, loading, error, retry: () => setAttempt(value => value + 1) };
}
function LoadState({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <div className="pepi-loading-grid" role="status" aria-label="Loading content"><span/><span/><span/></div>;
  if (error) return <div className="pepi-state-card" role="alert"><div><strong>Something did not load</strong><p>{error}</p></div><button onClick={retry}>Try again</button></div>;
  return null;
}
function MealCard({ item }: { item: Meal }) {
  return <Link to={`/customer/kitchen/${item.vendor_id}`} className="pepi-product-card">
    <div className="pepi-product-image">{item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy" /> : <span className="pepi-image-fallback"><Utensils size={28}/></span>}<span className="pepi-product-action"><ArrowRight size={15}/></span></div>
    <div><small>{item.vendor?.business_name || item.category || "Freshly prepared"}</small><h3>{item.name}</h3><strong>₦{Number(item.price).toLocaleString("en-NG")}</strong></div>
  </Link>;
}
export function CustomerHome() {
  const { data, loading, error, retry } = useLoad<HomeData>("/customer/home/v2");
  const { data: orders, loading: ordersLoading, error: ordersError, retry: retryOrders } = useLoad<CustomerHomeOrder[]>("/orders/");
  const categories = data?.categories?.slice(0, 8) || [];
  const activeStatuses = new Set(["scheduled", "pending", "accepted", "preparing", "ready", "picked_up"]);
  const activeOrders = (orders || []).filter(order => activeStatuses.has(order.status));
  const latestOrder = activeOrders[0] || orders?.[0];
  const discoverySections = data?.sections?.length
    ? data.sections
    : data?.top_items?.length ? [{ key: "popular", title: "Popular right now", items: data.top_items }] : [];
  return <div className="pepi-workspace-page pepi-customer-dashboard">
    <section className="pepi-customer-hero">
      <div><span className="pepi-hero-kicker"><MapPin size={15}/> Delivery near you</span><h2>Good food, right when you want it.</h2><p>Find trusted kitchens nearby and get your order moving in a few taps.</p><Link to="/customer/search" className="pepi-search-cta"><Search size={19}/><span>Search meals and kitchens</span><ArrowRight size={17}/></Link></div>
      <div className="pepi-hero-visual" aria-hidden="true"><span><Utensils size={42}/></span><i/><b/></div>
    </section>
    <LoadState loading={loading || ordersLoading} error={error || ordersError} retry={() => { retry(); retryOrders(); }}/>
    {data && <>
      {latestOrder && <section className="pepi-dashboard-card pepi-orders-preview"><div className="pepi-card-heading"><div><h3>{activeOrders.length ? "Your active order" : "Your latest order"}</h3><p>{activeOrders.length ? "Track your food from the kitchen to your door" : "Order details from your account"}</p></div><Link to="/customer/orders">View all <ChevronRight size={15}/></Link></div><Link to={`/customer/orders?orderId=${encodeURIComponent(latestOrder.id)}`} className="pepi-operation-row"><span className="pepi-order-avatar"><ShoppingBag size={17}/></span><span className="pepi-operation-copy"><strong>{latestOrder.restaurant_name || "Your order"}</strong><small>#{latestOrder.id.slice(0, 8).toUpperCase()} · {latestOrder.items_count || 0} item{latestOrder.items_count === 1 ? "" : "s"}{latestOrder.estimated_delivery_time ? ` · ${latestOrder.estimated_delivery_time}` : ""}</small></span><span className={`pepi-status-badge status-${latestOrder.status}`}>{friendlyStatus(latestOrder.status)}</span><strong>{formatMoney(latestOrder.total_amount)}</strong></Link></section>}
      {categories.length > 0 && <section className="pepi-dashboard-section pepi-category-section"><div className="pepi-section-heading"><div><h2>Browse by category</h2><p>Start with what sounds good</p></div></div><div className="pepi-category-row">{categories.map((name, index) => <Link to={`/customer/search?category=${encodeURIComponent(name)}`} key={name}><span>{index % 2 ? <Store size={19}/> : <Utensils size={19}/>}</span>{name}</Link>)}</div></section>}
      <section className="pepi-dashboard-section"><div className="pepi-section-heading"><div><h2>Kitchens near you</h2><p>Open kitchens ready to prepare your order</p></div><Link to="/customer/search">View all <ChevronRight size={16}/></Link></div><div className="pepi-kitchen-rail">{data.all_kitchens.slice(0, 6).map(k => <Link className="pepi-kitchen-card" to={`/customer/kitchen/${k.id}`} key={k.id}><div className="pepi-kitchen-image">{k.logo_url ? <img src={k.logo_url} alt="" loading="lazy"/> : <Store size={30}/>}<span>Open</span></div><div><h3>{k.business_name}</h3><p><span><Star size={13} fill="currentColor"/> {k.rating || "New"}</span><span><Clock3 size={13}/> {k.min_preparation_time || 15} min</span></p></div></Link>)}</div>{data.all_kitchens.length === 0 && <EmptyState title="No kitchens are open" text="Check back shortly for kitchens near you."/>}</section>
      {discoverySections.map(section => <section className="pepi-dashboard-section" key={section.key}><div className="pepi-section-heading"><div><h2>{section.title}</h2><p>{section.key === "order_again" ? "From your completed orders" : "Based on real orders and available menus"}</p></div><Link to="/customer/search">See more <ChevronRight size={16}/></Link></div><div className="pepi-product-grid">{section.items.slice(0, 8).map(item => <MealCard key={item.id} item={item}/>)}</div></section>)}
      {discoverySections.length === 0 && <section className="pepi-dashboard-section"><EmptyState title="Meals are coming soon" text="New menu items will appear here as kitchens open."/></section>}
    </>}
  </div>;
}
export function CustomerSearch() {
  const [query, setQuery] = useState(""); const [category, setCategory] = useState("All");
  const [categories, setCategories] = useState<string[]>(["All"]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [offset, setOffset] = useState(0); const [hasMore, setHasMore] = useState(false);
  const [kitchens, setKitchens] = useState<Kitchen[]>([]);
  const [kitchenOffset, setKitchenOffset] = useState(0); const [moreKitchens, setMoreKitchens] = useState(false);
  const [kitchenError, setKitchenError] = useState("");
  const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [attempt, setAttempt] = useState(0);
  useEffect(() => { api.get<string[]>("/menu/categories").then(({ data }) => setCategories(["All", ...data])).catch(() => {}); }, []);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      setLoading(true); setError("");
      api.get<Meal[]>("/menu/", { params: { customer_visible_only: true, item_type: "meal", limit: 24, offset, ...(query.trim() ? { search: query.trim() } : {}), ...(category !== "All" ? { category } : {}) } })
        .then(({ data }) => { if (active) { setMeals(previous => offset ? [...previous, ...data] : data); setHasMore(data.length === 24); } })
        .catch(() => { if (active) setError("We couldn't load meals. Please try again."); })
        .finally(() => { if (active) setLoading(false); });
    }, query ? 300 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, category, offset, attempt]);
  useEffect(() => {
    let active = true;
    const timer = window.setTimeout(() => {
      api.get<{ items: Kitchen[]; has_more: boolean }>("/customer/home/kitchens", { params: { search: query.trim(), limit: 12, offset: kitchenOffset } })
        .then(({ data }) => { if (active) { setKitchens(previous => kitchenOffset ? [...previous, ...data.items] : data.items); setMoreKitchens(data.has_more); setKitchenError(""); } })
        .catch(() => { if (active) setKitchenError("Could not load kitchens."); });
    }, query ? 300 : 0);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query, kitchenOffset, attempt]);
  const updateQuery = (value: string) => { setQuery(value); setOffset(0); setKitchenOffset(0); setMeals([]); setKitchens([]); };
  const updateCategory = (value: string) => { setCategory(value); setOffset(0); setMeals([]); };
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Discover</p><h2>Find your next meal</h2></div></div><label className="pepi-search-label">Search meals and kitchens<input value={query} onChange={e => updateQuery(e.target.value)} placeholder="What are you craving?" /></label><section className="pepi-section"><h3>Kitchens</h3>{kitchenError && <p role="alert">{kitchenError} <button onClick={() => setAttempt(value => value + 1)}>Retry</button></p>}<div className="pepi-grid">{kitchens.map(kitchen => <Link className="pepi-info-card pepi-kitchen-card" to={`/customer/kitchen/${kitchen.id}`} key={kitchen.id}>{kitchen.logo_url && <img src={kitchen.logo_url} alt="" loading="lazy" />}<h3>{kitchen.business_name}</h3><p><Star size={14}/> {kitchen.rating || "New"} · {kitchen.min_preparation_time || 15} min</p></Link>)}</div>{moreKitchens && <button onClick={() => setKitchenOffset(value => value + 12)}>Load more kitchens</button>}</section><section className="pepi-section"><h3>Meals</h3><div className="pepi-filter-row">{categories.map(name => <button className={category === name ? "selected" : ""} key={name} onClick={() => updateCategory(name)}>{name}</button>)}</div><LoadState loading={loading && !meals.length} error={error} retry={() => setAttempt(value => value + 1)}/><div className="pepi-grid">{meals.map(item => <MealCard key={item.id} item={item}/>)}</div>{!loading && !error && meals.length === 0 && <p>No meals found. Try another search.</p>}{hasMore && <button onClick={() => setOffset(value => value + 24)} disabled={loading}>Load more meals</button>}</section></>;
}
export function CustomerKitchen() {
  const { id = "" } = useParams();
  const [notice, setNotice] = useState("");
  const [customizing, setCustomizing] = useState<Meal | null>(null); const [selectedAddons, setSelectedAddons] = useState<string[]>([]); const [itemInstructions, setItemInstructions] = useState(""); const [scheduledAt, setScheduledAt] = useState("");
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const { data: vendor, loading: vendorLoading, error: vendorError, retry: retryVendor } = useLoad<Kitchen>(`/vendors/${id}`);
  const { data: items, loading: itemsLoading, error: itemsError, retry: retryItems } = useLoad<Meal[]>(`/menu/?vendor_id=${id}&customer_visible_only=true&item_type=meal`);
  useEffect(() => { api.get<Meal[]>("/customer/meal-favorites").then(({ data }) => setFavoriteIds(data.map(item => item.id))).catch(() => undefined); }, []);
  const toggleFavorite = async (item: Meal) => { try { if (favoriteIds.includes(item.id)) { await api.delete(`/customer/meal-favorites/${item.id}`); setFavoriteIds(value => value.filter(id => id !== item.id)); } else { await api.post("/customer/meal-favorites", { menu_item_id: item.id }); setFavoriteIds(value => [...value, item.id]); } } catch (error) { setNotice((error as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Could not update favorites."); } };
  const addCustomized = () => { if (!customizing) return; const addons = (customizing.addons || []).filter(addon => selectedAddons.includes(addon.id)).map(addon => ({ addon_menu_item_id: addon.id, quantity: 1, name: addon.name, price: Number(addon.price) })); const added = addToCart({ id: customizing.id, originalId: customizing.id, vendor_id: id, vendor_name: vendor?.business_name, name: customizing.name, price: Number(customizing.price) + addons.reduce((sum, addon) => sum + Number(addon.price || 0), 0), quantity: 1, image_url: customizing.image_url, addons, specialInstructions: itemInstructions.trim() || undefined, scheduledAt: scheduledAt ? new Date(scheduledAt).toISOString() : undefined }); setNotice(added ? `${customizing.name} added to cart.` : "Your cart contains meals from another kitchen. Complete that order first."); setCustomizing(null); setSelectedAddons([]); setItemInstructions(""); setScheduledAt(""); };
  return <><Link to="/customer/search">← Back to search</Link><LoadState loading={vendorLoading || itemsLoading} error={vendorError || itemsError} retry={() => { retryVendor(); retryItems(); }}/>{vendor && <div className="pepi-page-heading"><div><p className="pepi-eyebrow">Kitchen</p><h2>{vendor.business_name}</h2><p><MapPin size={15}/> {vendor.min_preparation_time || 15} min preparation</p></div></div>}{notice && <div className="pepi-panel" role="status">{notice} <Link to="/customer/cart">View cart</Link></div>}{items && <div className="pepi-grid">{items.map(item => <div className="pepi-product-card" key={item.id}><div className="pepi-product-image">{item.image_url ? <img src={item.image_url} alt={item.name} loading="lazy"/> : <span className="pepi-image-fallback"><Utensils size={28}/></span>}<button className="pepi-product-favorite" aria-label={favoriteIds.includes(item.id) ? "Remove from favorites" : "Save to favorites"} onClick={() => void toggleFavorite(item)}><Star size={17} fill={favoriteIds.includes(item.id) ? "currentColor" : "none"}/></button></div><div><small>{item.category}</small><h3>{item.name}</h3><p>{item.description}</p><strong>₦{Number(item.price).toLocaleString("en-NG")}</strong><button className="pepi-primary" onClick={() => setCustomizing(item)}>Choose options</button></div></div>)}</div>}{customizing && <div className="pepi-dialog-backdrop" onMouseDown={() => setCustomizing(null)}><section className="pepi-dialog" onMouseDown={event => event.stopPropagation()}><h3>{customizing.name}</h3><p>Choose your extras and tell the kitchen how you want it prepared.</p>{Boolean(customizing.addons?.length) && <fieldset><legend>Add-ons</legend>{customizing.addons?.map(addon => <label key={addon.id}><input type="checkbox" checked={selectedAddons.includes(addon.id)} onChange={event => setSelectedAddons(current => event.target.checked ? [...current, addon.id] : current.filter(value => value !== addon.id))}/>{addon.name} · ₦{Number(addon.price).toLocaleString("en-NG")}</label>)}</fieldset>}<label>Special instructions<textarea value={itemInstructions} onChange={event => setItemInstructions(event.target.value)} placeholder="For example, mild spice or no onions"/></label><label>Schedule this meal (optional)<input type="datetime-local" min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)} value={scheduledAt} onChange={event => setScheduledAt(event.target.value)}/></label><div className="pepi-dialog-actions"><button onClick={() => setCustomizing(null)}>Cancel</button><button className="pepi-primary" onClick={addCustomized}>Add to cart</button></div></section></div>}</>;
}
type WorkspaceOrder = { id: string; status: string; customer_name?: string; restaurant_name?: string; total_amount?: number; created_at?: string; delivery_address?: string; items_count?: number };
type VendorStats = { total_orders: number; total_revenue: number; active_products: number; popular_items?: { id: string; name: string; image_url?: string; order_count: number }[]; reviews_summary?: { average_rating: number; total_reviews: number } };
export function VendorDashboard() {
  const { data, loading, error, retry } = useLoad<VendorStats>("/vendors/dashboard-stats");
  const { data: orders, loading: ordersLoading, error: ordersError, retry: retryOrders } = useLoad<WorkspaceOrder[]>("/orders/");
  const vendorId = readStoredUser()?.vendor_id;
  const { data: profile, loading: profileLoading, error: profileError, retry: retryProfile } = useLoad<{ is_open: boolean; status: string }>(vendorId ? `/vendors/${vendorId}` : "/vendors/dashboard-stats");
  const [open, setOpen] = useState<boolean | null>(null);
  const [availabilityError, setAvailabilityError] = useState("");
  const [updating, setUpdating] = useState(false);
  const isOpen = open ?? profile?.is_open ?? false;
  async function toggle() {
    setUpdating(true); setAvailabilityError("");
    try { const { data: result } = await api.patch<{ is_open: boolean }>("/vendors/availability", { is_open: !isOpen }); setOpen(result.is_open); }
    catch (err) { setAvailabilityError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Could not update kitchen availability."); }
    finally { setUpdating(false); }
  }
  const activeOrders = (orders || []).filter(order => ["scheduled", "pending", "accepted", "preparing", "ready"].includes(order.status));
  const pendingOrders = activeOrders.filter(order => ["scheduled", "pending"].includes(order.status));
  const maxPopular = Math.max(...(data?.popular_items || []).map(item => item.order_count), 1);
  return <div className="pepi-workspace-page">
    <div className="pepi-dashboard-heading"><div><h2>Keep your kitchen moving</h2><p>Orders, menu performance, and customer feedback in one view.</p></div><div className="pepi-heading-actions"><Link to="/vendor/orders" className="pepi-secondary-action">View orders</Link><Link to="/vendor/menu" className="pepi-primary inline">Manage menu <ArrowRight size={17}/></Link></div></div>
    <LoadState loading={loading || profileLoading || ordersLoading} error={error || profileError || ordersError} retry={() => { retry(); retryProfile(); retryOrders(); }}/>
    {data && profile && <>
      <section className={`pepi-availability-card ${isOpen ? "is-open" : ""}`}><div className="pepi-availability-main"><span className="pepi-status-orb"><Store size={22}/></span><div><span className="pepi-status-line"><i/>{isOpen ? "Accepting orders" : "Not accepting orders"}</span><h3>Your kitchen is {isOpen ? "open" : "closed"}</h3><p>{isOpen ? "Customers can discover your menu and place new orders." : "Open your kitchen when your team is ready for new orders."}</p></div></div><button className={isOpen ? "pepi-secondary-action" : "pepi-primary"} disabled={updating || (profile.status !== "approved" && !isOpen)} onClick={toggle}>{updating ? "Updating" : isOpen ? "Close kitchen" : "Open kitchen"}</button>{profile.status !== "approved" && <div className="pepi-inline-notice">Your kitchen is awaiting approval.</div>}{availabilityError && <div className="pepi-inline-error" role="alert">{availabilityError}</div>}</section>
      <div className="pepi-metric-grid"><Metric label="Total revenue" value={`₦${compactMoney(data.total_revenue)}`} detail="Completed order value" icon={<TrendingUp/>}/><Metric label="Total orders" value={String(data.total_orders)} detail={`${activeOrders.length} active now`} icon={<ShoppingBag/>}/><Metric label="Menu items" value={String(data.active_products)} detail="Available to customers" icon={<Utensils/>}/><Metric label="Customer rating" value={data.reviews_summary?.average_rating ? data.reviews_summary.average_rating.toFixed(1) : "0"} detail={`${data.reviews_summary?.total_reviews || 0} reviews`} icon={<Star/>}/></div>
      <div className="pepi-dashboard-columns">
        <section className="pepi-dashboard-card pepi-orders-preview"><div className="pepi-card-heading"><div><h3>Orders needing attention</h3><p>{pendingOrders.length ? `${pendingOrders.length} waiting for your response` : "You are caught up"}</p></div><Link to="/vendor/orders">View all <ChevronRight size={15}/></Link></div>{activeOrders.slice(0, 5).map(order => <Link to={`/vendor/orders/${order.id}`} className="pepi-operation-row" key={order.id}><span className="pepi-order-avatar">{(order.customer_name || "C")[0]}</span><span className="pepi-operation-copy"><strong>{order.customer_name || "Customer"}</strong><small>#{order.id.slice(0, 8).toUpperCase()} · {order.items_count || 0} items</small></span><span className={`pepi-status-badge status-${order.status}`}>{friendlyStatus(order.status)}</span><strong>{formatMoney(order.total_amount)}</strong></Link>)}{!activeOrders.length && <EmptyState title="No active orders" text="New orders will appear here immediately."/>}</section>
        <section className="pepi-dashboard-card"><div className="pepi-card-heading"><div><h3>Popular menu items</h3><p>Based on completed orders</p></div><Link to="/vendor/menu">Menu <ChevronRight size={15}/></Link></div><div className="pepi-ranking-list">{(data.popular_items || []).map((item, index) => <Link to="/vendor/menu" className="pepi-ranking-row" key={item.id}><span className="pepi-rank-number">{index + 1}</span><span className="pepi-ranking-image">{item.image_url ? <img src={item.image_url} alt=""/> : <Utensils size={18}/>}</span><span><strong>{item.name}</strong><i style={{ width: `${Math.max(10, item.order_count / maxPopular * 100)}%` }}/></span><b>{item.order_count}</b></Link>)}{!data.popular_items?.length && <EmptyState title="No sales data yet" text="Popular dishes will appear after your first orders."/>}</div></section>
      </div>
      <div className="pepi-quick-actions"><Link to="/vendor/menu"><Utensils size={19}/><span><strong>Add or edit a dish</strong><small>Keep your menu current</small></span><ChevronRight size={16}/></Link><Link to="/vendor/earnings"><WalletCards size={19}/><span><strong>Review earnings</strong><small>View payouts and activity</small></span><ChevronRight size={16}/></Link><Link to="/vendor/reviews"><Star size={19}/><span><strong>Customer feedback</strong><small>See what customers say</small></span><ChevronRight size={16}/></Link></div>
    </>}
  </div>;
}
type RiderStats = { today_earnings: number; today_orders: number; completedToday: number; inProgressToday?: number; total_distance?: number; distance_target?: number; average_rating?: number; total_deliveries?: number; is_active: boolean; status: string };
export function RiderDashboard() {
  const [period, setPeriod] = useState("today");
  const { data, loading, error, retry } = useLoad<RiderStats>(`/riders/dashboard-stats?period=${period}`);
  const { data: deliveries, loading: deliveriesLoading, error: deliveriesError, retry: retryDeliveries } = useLoad<WorkspaceOrder[]>("/riders/orders");
  const [updating, setUpdating] = useState(false); const [online, setOnline] = useState<boolean | null>(null); const [statusError, setStatusError] = useState("");
  const approved = data?.status === "approved" || data?.status === "accepted";
  const active = approved && (online ?? data?.is_active ?? false);
  async function toggle() { setUpdating(true); setStatusError(""); try { await api.patch("/riders/status", { is_active: !active }); setOnline(!active); window.dispatchEvent(new CustomEvent("pepi-rider-availability", { detail: !active })); } catch { setStatusError("Could not update availability. Please try again."); } finally { setUpdating(false); } }
  const target = Number(data?.distance_target || 20);
  const distance = Number(data?.total_distance || 0);
  const progress = Math.min(100, target ? distance / target * 100 : 0);
  const available = (deliveries || []).filter(order => ["pending", "scheduled"].includes(order.status));
  const current = (deliveries || []).find(order => ["accepted", "preparing", "ready", "picked_up"].includes(order.status));
  return <div className="pepi-workspace-page">
    <div className="pepi-dashboard-heading"><div><h2>{active ? "You are ready for deliveries" : "Ready when you are"}</h2><p>{active ? "You will see new delivery requests as they become available." : "Go online when you are ready to accept nearby deliveries."}</p></div><button className={`pepi-availability-toggle ${active ? "is-active" : ""}`} onClick={toggle} disabled={updating || loading || !approved}><span><i/></span>{updating ? "Updating" : active ? "Online" : "Go online"}</button></div>
    {data && !approved && <div className="pepi-inline-notice">Your rider account is awaiting approval.</div>}{statusError && <div className="pepi-inline-error" role="alert">{statusError}</div>}
    <LoadState loading={loading || deliveriesLoading} error={error || deliveriesError} retry={() => { retry(); retryDeliveries(); }}/>
    {data && <>
      <div className="pepi-period-row"><span>Performance</span><div>{[["today", "Today"], ["week", "7 days"], ["month", "Month"], ["all", "All time"]].map(([value, label]) => <button className={period === value ? "active" : ""} key={value} onClick={() => setPeriod(value)}>{label}</button>)}</div></div>
      <div className="pepi-metric-grid"><Metric label="Earnings" value={`₦${compactMoney(data.today_earnings)}`} detail="For selected period" icon={<WalletCards/>}/><Metric label="Orders" value={String(data.today_orders)} detail={`${data.completedToday} completed`} icon={<PackageCheck/>}/><Metric label="Distance" value={`${distance.toFixed(1)} km`} detail={`${target.toFixed(0)} km target`} icon={<Bike/>}/><Metric label="Rating" value={data.average_rating ? data.average_rating.toFixed(1) : "New"} detail={`${data.total_deliveries || 0} total deliveries`} icon={<Star/>}/></div>
      <div className="pepi-dashboard-columns">
        <section className="pepi-dashboard-card pepi-rider-focus"><div className="pepi-card-heading"><div><h3>{current ? "Current delivery" : "Delivery opportunities"}</h3><p>{current ? "Your next required action" : `${available.length} available nearby`}</p></div><Link to="/rider/deliveries">Open list <ChevronRight size={15}/></Link></div>{current ? <div className="pepi-current-delivery"><span className="pepi-route-icon"><Truck size={23}/></span><div><span className={`pepi-status-badge status-${current.status}`}>{friendlyStatus(current.status)}</span><h4>{current.restaurant_name || "Kitchen pickup"}</h4><p><MapPin size={14}/>{current.delivery_address || "Delivery address available in order details"}</p></div><Link className="pepi-primary inline" to="/rider/map">Open map</Link></div> : available.length ? available.slice(0, 3).map(order => <Link to="/rider/deliveries" className="pepi-operation-row" key={order.id}><span className="pepi-order-avatar"><MapPin size={16}/></span><span className="pepi-operation-copy"><strong>{order.restaurant_name || "Kitchen pickup"}</strong><small>{order.delivery_address || "Open delivery details"}</small></span><ChevronRight size={16}/></Link>) : <EmptyState title={active ? "Waiting for nearby deliveries" : "Go online to find deliveries"} text={active ? "New opportunities will appear here automatically." : "Your delivery list is ready when you are."}/>}</section>
        <section className="pepi-dashboard-card pepi-progress-card"><div className="pepi-card-heading"><div><h3>Distance progress</h3><p>Your target for this period</p></div><span>{Math.round(progress)}%</span></div><div className="pepi-progress-visual" style={{ "--progress": `${progress * 3.6}deg` } as CSSProperties}><div><Bike size={22}/><strong>{distance.toFixed(1)}</strong><small>of {target.toFixed(0)} km</small></div></div><div className="pepi-progress-copy"><CheckCircle2 size={17}/><span>{progress >= 100 ? "Target reached. Great work." : `${Math.max(0, target - distance).toFixed(1)} km left to reach your target.`}</span></div></section>
      </div>
      <div className="pepi-quick-actions"><Link to="/rider/deliveries"><PackageCheck size={19}/><span><strong>Find deliveries</strong><small>See available and active work</small></span><ChevronRight size={16}/></Link><Link to="/rider/map"><Compass size={19}/><span><strong>Open delivery map</strong><small>Review your active route</small></span><ChevronRight size={16}/></Link><Link to="/rider/earnings"><WalletCards size={19}/><span><strong>Review earnings</strong><small>See payouts and activity</small></span><ChevronRight size={16}/></Link></div>
    </>}
  </div>;
}
function Metric({ label, value, detail, icon }: { label: string; value: string; detail: string; icon: ReactNode }) { return <article className="pepi-metric-card"><div className="pepi-metric-icon">{icon}</div><div><span>{label}</span><strong>{value}</strong><small>{detail}</small></div></article>; }
function EmptyState({ title, text }: { title: string; text: string }) { return <div className="pepi-empty-state"><span><PackageCheck size={23}/></span><div><strong>{title}</strong><p>{text}</p></div></div>; }
function compactMoney(value: number | undefined) { return Intl.NumberFormat("en-NG", { notation: Number(value || 0) >= 100000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(Number(value || 0)); }
function formatMoney(value: number | undefined) { return `₦${Number(value || 0).toLocaleString("en-NG")}`; }
function friendlyStatus(value: string) { return value.replaceAll("_", " ").replace(/\b\w/g, letter => letter.toUpperCase()); }
