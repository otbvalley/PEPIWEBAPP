import { ArrowLeft, ArrowRight, Search } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import "./NotFound.css";

export default function NotFound() {
  return <div className="not-found-page">
    <header className="nf-header"><Link to="/"><img src={logo} alt="PickEAT PickIT"/></Link><Link to="/signin">Sign in</Link></header>
    <main><div className="nf-copy"><span>404</span><h1>This page is not on the menu.</h1><p>The link may have moved, or the address may not be quite right. There is still plenty to find nearby.</p><div><Link className="nf-primary" to="/"><ArrowLeft/> Back to home</Link><Link className="nf-secondary" to="/signup?role=customer">Find food <ArrowRight/></Link></div></div><div className="nf-scene" aria-hidden="true"><div className="nf-plate"><i/><i/><i/><i/></div><div className="nf-search"><Search/><span>Searching nearby kitchens</span></div><div className="nf-route"><i/><b/></div></div></main>
    <footer><span>Need a different way in?</span><nav><Link to="/vendors">For vendors</Link><Link to="/riders">For riders</Link><Link to="/about">About Pepi</Link><Link to="/signin">Support</Link></nav></footer>
  </div>;
}
