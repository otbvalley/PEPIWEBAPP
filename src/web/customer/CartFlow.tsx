import { useState, useEffect, useCallback, type FormEvent } from "react";
import { Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { getCart, saveCart } from "./cart";
import type { SavedAddress } from "./Addresses";
import "./OrderFlowExperience.css";

export function CustomerCart() {
  const [lines, setLines] = useState(getCart);
  function change(id: string, quantity: number) { const next = lines.map(line => line.id === id ? { ...line, quantity } : line).filter(line => line.quantity > 0); setLines(next); saveCart(next); }
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  return <><div className="pepi-page-heading"><div><p className="pepi-eyebrow">Your picks</p><h2>Cart</h2></div></div>{lines.length ? <><div className="pepi-panel">{lines.map(line => <div className="pepi-cart-row" key={line.id}><div><strong>{line.name}</strong><small>₦{line.price.toLocaleString("en-NG")}</small>{line.addons?.map(addon => <small key={addon.addon_menu_item_id}>+ {addon.name || "Add-on"}</small>)}{line.specialInstructions && <small>{line.specialInstructions}</small>}{line.scheduledAt && <small>Scheduled {new Date(line.scheduledAt).toLocaleString("en-NG")}</small>}</div><div className="pepi-quantity"><button aria-label={`Remove one ${line.name}`} onClick={() => change(line.id, line.quantity - 1)}>−</button><span>{line.quantity}</span><button aria-label={`Add one ${line.name}`} onClick={() => change(line.id, line.quantity + 1)}>+</button></div></div>)}</div><div className="pepi-panel"><p>Subtotal <strong>₦{subtotal.toLocaleString("en-NG")}</strong></p><small>Delivery fee and final total are calculated at checkout.</small><Link className="pepi-primary" to="/customer/checkout">Continue to checkout</Link></div></> : <div className="pepi-panel"><p>Your cart is empty.</p><Link to="/customer/search">Explore meals</Link></div>}</>;
}
export function CustomerCheckout() {
  const [lines] = useState(getCart);
  const vendorId = lines[0]?.vendor_id;
  const [address, setAddress] = useState(""); const [promoCode, setPromoCode] = useState(""); const [instructions, setInstructions] = useState(""); const [scheduledTime, setScheduledTime] = useState(() => lines.find(line => line.scheduledAt)?.scheduledAt?.slice(0, 16) || ""); const [deliveryType, setDeliveryType] = useState<"delivery" | "pickup">("delivery"); const [paymentMethod, setPaymentMethod] = useState<"online" | "wallet" | "cod">("online"); const [error, setError] = useState(""); const [loading, setLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null); const [vendor, setVendor] = useState<{ business_name?: string; business_address?: string; accept_cod?: boolean; is_open?: boolean; temporarily_closed?: boolean } | null>(null); const [walletBalance, setWalletBalance] = useState(0);
  useEffect(() => { api.get<SavedAddress[]>("/customer/addresses").then(({ data }) => { setSavedAddresses(data); const preferred = data.find(item => item.is_default) || data[0]; if (preferred) { setSelectedAddress(preferred); setAddress(preferred.address); } }).catch(() => {}); if (vendorId) api.get(`/vendors/${vendorId}`).then(({ data }) => setVendor(data)).catch(() => {}); api.get<{ balance: number }>("/payments/wallet/balance").then(({ data }) => setWalletBalance(Number(data.balance || 0))).catch(() => {}); }, [vendorId]);
  const [quote, setQuote] = useState<{ subtotal: number; customer_total: number; total_delivery_fee: number; additional_fees: number; discount: number; configured_fees: { code: string; name: string; amount: number }[] } | null>(null);
  const [quotedInput, setQuotedInput] = useState("");
  const subtotal = lines.reduce((sum, line) => sum + line.price * line.quantity, 0);
  const checkoutAddress = deliveryType === "pickup" ? vendor?.business_address || "Customer pickup at vendor" : address.trim();
  const currentInput = `${checkoutAddress}|${promoCode.trim().toUpperCase()}|${subtotal}|${deliveryType}`;
  const calculateQuote = useCallback(async () => {
    if (!lines.length || (deliveryType === "delivery" && !address.trim())) return;
    setLoading(true); setError("");
    try {
      const { data } = await api.post("/system/delivery-quote", { vendor_id: lines[0].vendor_id, customer_address: checkoutAddress, subtotal, order_items: lines.map(line => ({ menu_item_id: line.originalId || line.id, quantity: line.quantity, addons: line.addons || [] })), promo_code: promoCode.trim() || null, delivery_type: deliveryType });
      setQuote(data); setQuotedInput(currentInput);
    } catch (err) { setQuote(null); setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Could not calculate delivery. Please check your address."); }
    finally { setLoading(false); }
  }, [address, checkoutAddress, currentInput, deliveryType, lines, promoCode, subtotal]);
  useEffect(() => {
    if (!lines.length || (deliveryType === "delivery" && !address.trim())) return;
    const timer = window.setTimeout(() => void calculateQuote(), 350);
    return () => window.clearTimeout(timer);
  }, [address, calculateQuote, deliveryType, lines.length]);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!lines.length || !quote || quotedInput !== currentInput) return; if (scheduledTime && new Date(scheduledTime).getTime() <= Date.now()) { setError("Choose a future date and time for a scheduled order."); return; } if (paymentMethod === "wallet" && walletBalance < quote.customer_total) { setError("Your wallet balance is not enough for this order."); return; } if (paymentMethod === "cod" && vendor?.accept_cod === false) { setError("This kitchen does not accept cash on delivery."); return; } setLoading(true); setError("");
    try {
      const user = JSON.parse(localStorage.getItem("userData") || "{}");
      const items = lines.map(line => ({ menu_item_id: line.originalId || line.id, quantity: line.quantity, price: line.price, addons: line.addons || [] }));
      const combinedInstructions = [instructions.trim(), selectedAddress?.delivery_instructions, ...lines.map(line => line.specialInstructions ? `${line.name}: ${line.specialInstructions}` : "")].filter(Boolean).join("\n");
      const common = { user_id: user.id, vendor_id: lines[0].vendor_id, restaurant_name: vendor?.business_name || lines[0].vendor_name || "Kitchen", customer_phone: user.phone, delivery_address: checkoutAddress, apartment: selectedAddress?.apartment, landmark: selectedAddress?.building_name, delivery_latitude: selectedAddress?.latitude ? Number(selectedAddress.latitude) : undefined, delivery_longitude: selectedAddress?.longitude ? Number(selectedAddress.longitude) : undefined, delivery_type: deliveryType, promo_code: promoCode.trim() || undefined, scheduled_time: scheduledTime ? new Date(scheduledTime).toISOString() : undefined, special_instructions: combinedInstructions || undefined, total_price: subtotal, total_amount: quote.customer_total, delivery_fee: quote.total_delivery_fee, additional_fees: quote.additional_fees, discount_amount: quote.discount, items_count: lines.reduce((sum, line) => sum + line.quantity, 0), items };
      if (paymentMethod !== "online") {
        const { data } = await api.post<{ id: string }>("/orders/", { ...common, payment_method: paymentMethod });
        saveCart([]); window.location.assign(`/customer/orders?orderId=${encodeURIComponent(data.id)}`); return;
      }
      const { data } = await api.post("/payments/initialize", {
        amount: quote.customer_total, vendor_id: lines[0].vendor_id, customer_email: user.email,
        customer_name: `${user.firstname || ""} ${user.lastname || ""}`.trim(), customer_phone: user.phone,
        delivery_address: checkoutAddress, delivery_type: deliveryType, promo_code: promoCode.trim() || undefined,
        callback_url: `${window.location.origin}/customer/payment-verify`,
        metadata: { order_items: items, promo_code: promoCode.trim() || undefined, delivery_type: deliveryType, apartment: common.apartment, landmark: common.landmark, delivery_latitude: common.delivery_latitude, delivery_longitude: common.delivery_longitude, special_instructions: common.special_instructions, scheduled_time: common.scheduled_time },
      });
      if (!data.authorization_url) throw new Error("Payment could not be started.");
      window.location.assign(data.authorization_url);
    } catch (err) { setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Payment could not be started. Please try again."); setLoading(false); }
  }
  return <>
    <div className="pepi-page-heading"><div><p className="pepi-eyebrow">Almost there</p><h2>Checkout</h2></div></div>
    <div className="pepi-panel"><p>{lines.length} item{lines.length === 1 ? "" : "s"} · Estimated subtotal ₦{subtotal.toLocaleString("en-NG")}</p><small>Final amount, fees, and discounts are calculated by Pepi.</small></div>
    <form className="pepi-checkout-form pepi-panel" onSubmit={submit}>
      <fieldset><legend>How would you like your order?</legend><div className="pepi-filter-row"><button type="button" className={deliveryType === "delivery" ? "selected" : ""} onClick={() => { setDeliveryType("delivery"); setQuote(null); }}>Delivery</button><button type="button" className={deliveryType === "pickup" ? "selected" : ""} onClick={() => { setDeliveryType("pickup"); setQuote(null); }}>Pickup</button></div></fieldset>
      {deliveryType === "delivery" && <>{savedAddresses.length > 0 && <label>Saved addresses<select value={selectedAddress?.id || ""} onChange={event => { const selected = savedAddresses.find(item => item.id === event.target.value) || null; setSelectedAddress(selected); if (selected) setAddress(selected.address); setQuote(null); }}><option value="">Choose an address</option>{savedAddresses.map(item => <option value={item.id} key={item.id}>{item.address_name || "Address"} · {item.address}</option>)}</select></label>}<label>Delivery address<textarea value={address} onChange={e => { setAddress(e.target.value); setSelectedAddress(null); setQuote(null); }} required placeholder="Enter your full delivery address" /></label><Link to="/customer/addresses">Manage saved addresses</Link></>}
      {deliveryType === "pickup" && <div className="pepi-inline-notice">Pickup from {vendor?.business_address || "the kitchen address shown after confirmation"}. No rider or delivery fee is required.</div>}
      <label>Special instructions<textarea value={instructions} onChange={event => setInstructions(event.target.value)} placeholder="Allergies, preparation notes, or delivery guidance" /></label>
      <label>Schedule for later (optional)<input type="datetime-local" value={scheduledTime} min={new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)} onChange={event => setScheduledTime(event.target.value)} /></label>
      <label>Promo code (optional)<input value={promoCode} onChange={e => setPromoCode(e.target.value)} /></label>
      <fieldset><legend>Payment method</legend><div className="pepi-filter-row"><button type="button" className={paymentMethod === "online" ? "selected" : ""} onClick={() => setPaymentMethod("online")}>Pay online</button><button type="button" className={paymentMethod === "wallet" ? "selected" : ""} onClick={() => setPaymentMethod("wallet")}>Wallet · ₦{walletBalance.toLocaleString("en-NG")}</button><button type="button" className={paymentMethod === "cod" ? "selected" : ""} onClick={() => setPaymentMethod("cod")}>Cash on delivery</button></div></fieldset>
      <button type="button" onClick={() => void calculateQuote()} disabled={loading || (deliveryType === "delivery" && !address.trim()) || !lines.length}>{loading ? "Calculating total" : quote && quotedInput === currentInput ? "Recalculate total" : `Calculate ${deliveryType === "delivery" ? "delivery and " : ""}total`}</button>
      {quote && quotedInput === currentInput && <div className="pepi-quote">
        <p>Subtotal <strong>₦{Number(quote.subtotal).toLocaleString("en-NG")}</strong></p>
        <p>Delivery <strong>₦{Number(quote.total_delivery_fee).toLocaleString("en-NG")}</strong></p>
        {quote.configured_fees.map(fee => <p key={fee.code}>{fee.name} <strong>₦{Number(fee.amount).toLocaleString("en-NG")}</strong></p>)}
        {Number(quote.discount) > 0 && <p>Discount <strong>−₦{Number(quote.discount).toLocaleString("en-NG")}</strong></p>}
        <p>Total <strong>₦{Number(quote.customer_total).toLocaleString("en-NG")}</strong></p>
      </div>}
      {error && <p role="alert" className="pepi-form-error">{error}</p>}
      <button className="pepi-primary" disabled={loading || !lines.length || !quote || quotedInput !== currentInput}>{loading ? "Placing order" : paymentMethod === "online" ? "Continue to secure payment" : "Place order"}</button>
    </form>
  </>;
}
export function CustomerPaymentVerify() {
  const [params] = useSearchParams(); const reference = params.get("reference") || params.get("trxref");
  const [state, setState] = useState<"checking" | "success" | "failed">("checking");
  const [message, setMessage] = useState("");
  const [orderId, setOrderId] = useState("");
  useEffect(() => {
    if (!reference) { setState("failed"); return; }
    const confirmedReference = reference;
    let active = true;
    async function complete() {
      try {
        await api.post(`/payments/verify/${encodeURIComponent(confirmedReference)}`);
        const recover = () => api.get<{ order_id: string | null; draft: Record<string, unknown> | null }>(`/payments/order-draft/${encodeURIComponent(confirmedReference)}`);
        let { data } = await recover();
        if (!data.order_id && data.draft) {
          try {
            const created = await api.post<{ id: string }>("/orders/", data.draft);
            data = { ...data, order_id: created.data.id };
          } catch (orderError) {
            const latest = await recover();
            if (!latest.data.order_id) throw orderError;
            data = latest.data;
          }
        }
        if (!data.order_id) throw new Error("Payment verified, but order details could not be recovered. Contact support with the reference below.");
        if (active) { saveCart([]); setOrderId(data.order_id); setState("success"); }
      } catch (error) {
        if (active) { setMessage((error as { response?: { data?: { detail?: string } }; message?: string }).response?.data?.detail || (error as Error).message || "Payment verification failed."); setState("failed"); }
      }
    }
    complete();
    return () => { active = false; };
  }, [reference]);
  return <div className="pepi-panel" role="status">{state === "checking" ? <p>Verifying your payment and placing your order…</p> : state === "success" ? <><h2>Order placed</h2><p>Your order is on its way to the kitchen.</p><p>Order ID: {orderId}</p><Link to="/customer/orders">View orders</Link></> : <><h2>We couldn't complete your order</h2><p>{message}</p><p>Payment reference: {reference || "unavailable"}</p>{reference && <button onClick={() => window.location.reload()}>Retry placing order</button>}<Link to="/customer/support">Contact support</Link></>}</div>;
}
