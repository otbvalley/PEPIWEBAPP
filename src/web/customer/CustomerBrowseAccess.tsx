import { ShoppingCart, UserRound } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import { decodeJwtToken } from "../../services/backendAuthService";
import ProtectedWorkspace from "../auth/ProtectedWorkspace";
import { getCart } from "./cart";
import "./CustomerBrowseAccess.css";

export default function CustomerBrowseAccess() {
  const token = localStorage.getItem("authToken");
  const claims = token ? decodeJwtToken(token) : null;
  const authenticated = Boolean(claims?.role === "customer" && claims.exp * 1000 > Date.now());
  if (authenticated) return <ProtectedWorkspace role="customer"/>;

  const cartCount = getCart().reduce((sum, item) => sum + item.quantity, 0);
  return <div className="guest-marketplace">
    <header>
      <Link to="/" className="guest-marketplace-logo"><img src={logo} alt="PickEAT PickIT"/></Link>
      <nav><Link to="/customer/search">Browse meals</Link><Link to="/vendors">For vendors</Link><Link to="/riders">For riders</Link></nav>
      <div><Link className="guest-cart" to="/customer/cart" aria-label={`Cart with ${cartCount} items`}><ShoppingCart/>{cartCount > 0 && <b>{cartCount > 99 ? "99+" : cartCount}</b>}</Link><Link className="guest-signin" to="/signin?role=customer"><UserRound/> Sign in</Link></div>
    </header>
    <main><Outlet/></main>
  </div>;
}
