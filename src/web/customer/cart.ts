export type CartLine = { id: string; originalId?: string; vendor_id: string; vendor_name?: string; name: string; price: number; quantity: number; image_url?: string; addons?: { addon_menu_item_id: string; quantity: number; name?: string; price?: number }[]; specialInstructions?: string; scheduledAt?: string };
const CART_KEY = "pepiWebCart";
export function getCart(): CartLine[] {
  try { const lines = JSON.parse(sessionStorage.getItem(CART_KEY) || "[]"); return Array.isArray(lines) ? lines : []; } catch { return []; }
}
export function saveCart(lines: CartLine[]) { sessionStorage.setItem(CART_KEY, JSON.stringify(lines)); window.dispatchEvent(new Event("pepi-cart-change")); }
export function addToCart(line: CartLine) {
  const lines = getCart();
  if (lines.length && lines[0].vendor_id !== line.vendor_id) return false;
  const customized = Boolean(line.addons?.length || line.specialInstructions || line.scheduledAt);
  if (customized) line = { ...line, originalId: line.originalId || line.id, id: `${line.id}-${Date.now()}` };
  const existing = customized ? undefined : lines.find(item => item.id === line.id);
  if (existing) existing.quantity += 1; else lines.push(line);
  saveCart(lines); return true;
}
