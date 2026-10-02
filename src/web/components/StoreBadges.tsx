import "./StoreBadges.css";

type AppRole = "customer" | "vendor" | "rider";

const appNames: Record<AppRole, string> = {
  customer: "PickEAT PickIT",
  vendor: "PickEAT PickIT Vendor",
  rider: "PickEAT PickIT Rider",
};

const configuredUrls: Record<AppRole, { apple?: string; google?: string }> = {
  customer: { apple: import.meta.env.VITE_CUSTOMER_APP_STORE_URL, google: import.meta.env.VITE_CUSTOMER_PLAY_STORE_URL },
  vendor: { apple: import.meta.env.VITE_VENDOR_APP_STORE_URL, google: import.meta.env.VITE_VENDOR_PLAY_STORE_URL },
  rider: { apple: import.meta.env.VITE_RIDER_APP_STORE_URL, google: import.meta.env.VITE_RIDER_PLAY_STORE_URL },
};

function storeUrl(role: AppRole, store: "apple" | "google") {
  const configured = configuredUrls[role][store]?.trim();
  if (configured) return configured;
  const name = encodeURIComponent(appNames[role]);
  return store === "apple" ? `https://apps.apple.com/us/search?term=${name}` : `https://play.google.com/store/search?q=${name}&c=apps`;
}

export function StoreBadges({ role = "customer", compact = false }: { role?: AppRole; compact?: boolean }) {
  return <div className={`store-badges${compact ? " compact" : ""}`} aria-label={`Download ${appNames[role]}`}>
    <a href={storeUrl(role, "apple")} target="_blank" rel="noopener noreferrer" aria-label={`Download ${appNames[role]} on the App Store`}><AppleStoreIcon/><span><small>Download on the</small><strong>App Store</strong></span></a>
    <a href={storeUrl(role, "google")} target="_blank" rel="noopener noreferrer" aria-label={`Get ${appNames[role]} on Google Play`}><GooglePlayIcon/><span><small>Get it on</small><strong>Google Play</strong></span></a>
  </div>;
}

function AppleStoreIcon() {
  return <svg viewBox="0 0 384 512" aria-hidden="true" className="store-logo apple-logo"><path fill="currentColor" d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5 4 299.7 8.8 326.8 18.4 355c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-92.2ZM260.7 104.5c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3Z"/></svg>;
}

function GooglePlayIcon() {
  return <svg viewBox="0 0 28 31" aria-hidden="true" className="store-logo play-logo"><path fill="#00d7fe" d="M1.3 1.1A2.5 2.5 0 0 0 .5 3v25c0 .8.3 1.5.8 1.9l14-14.4-14-14.4Z"/><path fill="#ffce00" d="m20 10.7-4.7 4.8 4.7 4.8 5.7-3.2c1.6-.9 1.6-2.3 0-3.2L20 10.7Z"/><path fill="#ff3a44" d="m1.3 29.9 18.7-9.6-4.7-4.8-14 14.4Z"/><path fill="#00f076" d="M1.3 1.1 15.3 15.5l4.7-4.8L1.3 1.1Z"/></svg>;
}
