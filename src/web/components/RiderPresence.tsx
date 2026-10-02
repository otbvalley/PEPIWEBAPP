import { useEffect, useState } from "react";
import api from "../../services/api";

export default function RiderPresence() {
  const [active, setActive] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let mounted = true;
    api.get("/riders/dashboard-stats").then(({ data }) => { if (mounted) setActive(Boolean(data.is_active) && ["approved", "accepted"].includes(data.status)); }).catch(() => {});
    const onAvailability = (event: Event) => setActive(Boolean((event as CustomEvent<boolean>).detail));
    window.addEventListener("pepi-rider-availability", onAvailability);
    return () => { mounted = false; window.removeEventListener("pepi-rider-availability", onAvailability); };
  }, []);
  useEffect(() => {
    if (!active) { setError(""); return; }
    if (!navigator.geolocation) { setError("Location is not available in this browser. Delivery tracking is paused."); return; }
    let lastSent = 0;
    const watch = navigator.geolocation.watchPosition(position => {
      setError("");
      if (Date.now() - lastSent < 15000) return;
      lastSent = Date.now();
      api.post("/riders/location", { latitude: position.coords.latitude, longitude: position.coords.longitude }).catch(() => setError("Location update failed. Trying again when your position changes."));
    }, () => setError("Allow location access to share your position during deliveries."), { enableHighAccuracy: true, maximumAge: 30000 });
    api.post("/riders/heartbeat").catch(() => {});
    const heartbeat = window.setInterval(() => api.post("/riders/heartbeat").catch(() => {}), 60000);
    return () => { navigator.geolocation.clearWatch(watch); window.clearInterval(heartbeat); };
  }, [active]);
  return error ? <div className="pepi-location-alert" role="alert">{error}</div> : null;
}
