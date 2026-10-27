import { useEffect, useState } from "react";
import { Megaphone, X } from "lucide-react";
import api from "../../services/api";

type Banner = { id: string; title: string; message: string; background_color?: string; text_color?: string };

export default function BroadcastBanner({ appName }: { appName: "customer" | "vendor" }) {
  const [banner, setBanner] = useState<Banner | null>(null);

  useEffect(() => {
    let active = true;
    api.get<Banner | null>(`/system/broadcast-banner/${appName}`)
      .then(({ data }) => {
        if (!active || !data || sessionStorage.getItem(`pepi-banner-${data.id}`)) return;
        setBanner(data);
      })
      .catch(() => undefined);
    return () => { active = false; };
  }, [appName]);

  if (!banner) return null;
  return <section className="pepi-broadcast-banner" style={{ backgroundColor: banner.background_color || undefined, color: banner.text_color || undefined }}>
    <span><Megaphone size={19}/></span>
    <div><strong>{banner.title}</strong><p>{banner.message}</p></div>
    <button type="button" aria-label="Dismiss announcement" onClick={() => { sessionStorage.setItem(`pepi-banner-${banner.id}`, "dismissed"); setBanner(null); }}><X size={17}/></button>
  </section>;
}
