import { useEffect, useState, type FormEvent } from "react";
import api from "../../services/api";

export type SavedAddress = {
  id: string;
  address: string;
  address_name?: string;
  address_type?: string;
  delivery_instructions?: string;
  apartment?: string;
  building_name?: string;
  building_type?: string;
  delivery_option?: string;
  latitude?: string;
  longitude?: string;
  is_default: boolean;
};

export default function CustomerAddresses() {
  const [items, setItems] = useState<SavedAddress[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [instructions, setInstructions] = useState("");
  const [apartment, setApartment] = useState("");
  const [buildingName, setBuildingName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function load() {
    try {
      const { data } = await api.get<SavedAddress[]>("/customer/addresses");
      setItems(data);
      setError("");
    } catch { setError("Could not load addresses."); }
  }
  useEffect(() => { void load(); }, []);

  function startEdit(item: SavedAddress) {
    setEditingId(item.id);
    setName(item.address_name || "");
    setAddress(item.address);
    setInstructions(item.delivery_instructions || "");
    setApartment(item.apartment || "");
    setBuildingName(item.building_name || "");
    setLatitude(item.latitude || ""); setLongitude(item.longitude || "");
    window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
  }
  function resetForm() { setEditingId(null); setName(""); setAddress(""); setInstructions(""); setApartment(""); setBuildingName(""); setLatitude(""); setLongitude(""); }
  async function save(event: FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    const payload = { address_name: name.trim() || "Other", address: address.trim(), apartment: apartment.trim() || null, building_name: buildingName.trim() || null, delivery_instructions: instructions.trim() || null, latitude: latitude || null, longitude: longitude || null };
    try {
      if (editingId) await api.patch(`/customer/addresses/${editingId}`, payload);
      else await api.post("/customer/addresses", { ...payload, is_default: items.length === 0 });
      resetForm(); await load();
    } catch (err) { setError((err as { response?: { data?: { detail?: string } } }).response?.data?.detail || "Could not save address. Please try again."); }
    finally { setBusy(false); }
  }
  async function makeDefault(item: SavedAddress) {
    setError("");
    try { await api.patch(`/customer/addresses/${item.id}`, { is_default: true }); await load(); }
    catch { setError("Could not set default address."); }
  }
  async function remove(item: SavedAddress) {
    if (!window.confirm(`Delete ${item.address_name || "this address"}?`)) return;
    setError("");
    try { await api.delete(`/customer/addresses/${item.id}`); if (editingId === item.id) resetForm(); await load(); }
    catch { setError("Could not delete address."); }
  }
  return <>
    <div className="pepi-page-heading"><div><p className="pepi-eyebrow">Delivery</p><h2>Saved addresses</h2></div></div>
    {error && <p role="alert" className="pepi-form-error">{error}</p>}
    <div className="pepi-panel">{items.length ? items.map(item => <div className="pepi-cart-row" key={item.id}>
      <div><strong>{item.address_name || "Address"}{item.is_default ? " · Default" : ""}</strong><small>{item.address}</small>{(item.apartment || item.building_name) && <small>{[item.apartment, item.building_name].filter(Boolean).join(" · ")}</small>}{item.delivery_instructions && <small>{item.delivery_instructions}</small>}</div>
      <div><button onClick={() => startEdit(item)}>Edit</button><button disabled={item.is_default} onClick={() => void makeDefault(item)}>Set default</button><button onClick={() => void remove(item)}>Delete</button></div>
    </div>) : <p>No saved addresses yet.</p>}</div>
    <form className="pepi-panel pepi-checkout-form" onSubmit={save}>
      <h3>{editingId ? "Edit address" : "Add an address"}</h3>
      <label>Name<input value={name} onChange={event => setName(event.target.value)} placeholder="Home or Office" /></label>
      <label>Full address<textarea value={address} onChange={event => setAddress(event.target.value)} required /></label>
      <button type="button" className="pepi-secondary-action" onClick={() => navigator.geolocation?.getCurrentPosition(position => { setLatitude(String(position.coords.latitude)); setLongitude(String(position.coords.longitude)); }, () => setError("Allow location access, then try again."), { enableHighAccuracy: true })}>{latitude && longitude ? "Location attached" : "Use my current location"}</button>
      <label>Apartment, suite, or floor<input value={apartment} onChange={event => setApartment(event.target.value)} /></label>
      <label>Building or landmark<input value={buildingName} onChange={event => setBuildingName(event.target.value)} /></label>
      <label>Delivery instructions (optional)<textarea value={instructions} onChange={event => setInstructions(event.target.value)} /></label>
      <div className="pepi-form-actions"><button className="pepi-primary" disabled={busy}>{busy ? "Saving…" : editingId ? "Save changes" : "Save address"}</button>{editingId && <button type="button" onClick={resetForm}>Cancel</button>}</div>
    </form>
  </>;
}
