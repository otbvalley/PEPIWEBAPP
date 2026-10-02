import { useEffect, useLayoutEffect, useRef, useState } from "react";
import type { FormEvent } from "react";
import { ArrowRight, Bell, Home, MapPin, Menu, MessageCircle, Search, ShoppingBag, ShoppingCart, Star, Store, UserRound, Utensils, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../../assets/Logo SVG 1.png";
import { publicApi } from "../../services/api";
import { StoreBadges } from "../components/StoreBadges";
import { readStoredUser, roleHome } from "../auth/roleRouting";
import "./Landing.css";

gsap.registerPlugin(ScrollTrigger);

type PublicKitchen = { id: string; business_name: string; business_category?: string; logo_url?: string; rating?: string | number; min_preparation_time?: number };
type PublicMeal = { id: string; vendor_id: string; name: string; category?: string; price: number; image_url?: string; vendor?: { business_name?: string } };
type PublicHome = { categories: string[]; top_items: PublicMeal[]; all_kitchens: PublicKitchen[] };

function Phone({ tracking = false }: { tracking?: boolean }) {
  return <div className={`land-phone ${tracking ? "tracking" : ""}`} aria-label={tracking ? "Pepi live order tracking" : "Pepi customer app home"}>
    <div className="phone-status"><span>10:34</span><i /><span className="phone-signal"><b/><b/><b/> LTE <em>40</em></span></div>
    {tracking ? <><div className="map"><span className="road one"/><span className="road two"/><svg viewBox="0 0 240 360" aria-hidden="true"><path d="M38 290 C70 215 105 270 125 185 S176 135 204 68"/></svg><b className="pin start"/><b className="pin end"/></div><div className="track-card"><span>KA</span><div><small>Your rider is on the way</small><strong>12 minutes away</strong></div></div></> : <div className="phone-screen">
      <div className="phone-top"><span>AT</span><strong>Welcome, Andrew</strong><div><i><MessageCircle/><b>1</b></i><i><Bell/><b>8</b></i></div></div>
      <div className="phone-search"><Search/><span>Search for available foods</span><b>Filter⌄</b></div>
      <div className="phone-filters"><b>✓ All</b><span>Main</span></div>
      <div className="phone-mini-promo"><img src="/cartoon-jollof-meal.png" alt=""/></div>
      <div className="phone-food"><strong>Rice</strong><small><i/> Chicken Republic</small></div>
      <div className="phone-heading"><strong>Special offers for you</strong><small>View more</small></div>
      <div className="phone-offer"><div><small>Today’s pick</small><strong>Jollof, chicken<br/>and plantain</strong></div><img src="/cartoon-jollof-meal.png" alt=""/></div>
      <strong className="phone-section-label">Featured Vendors</strong>
      <div className="phone-heading kitchen-title"><strong>Kitchens near you</strong></div>
      <div className="phone-kitchen-search"><Search/>Search kitchens</div>
      <div className="phone-tabs"><b><Home/>Home</b><span><ShoppingBag/>Order</span><span><ShoppingCart/>Cart</span><span><UserRound/>Account</span></div>
    </div>}
  </div>;
}

function Dish({ tone = "rice" }: { tone?: string }) { return <span className={`dish dish-${tone}`} aria-hidden="true"/>; }

function Browser() {
  return <div className="land-browser" aria-label="Pepi desktop food marketplace">
    <div className="browser-bar"><i/><i/><i/><span>pickeatpickit.com/customer/home</span></div>
    <div className="browser-body"><aside><img src={logo} alt=""/><b>Home</b><span>Search</span><span>Orders</span><span>Wallet</span></aside><div className="browser-main"><small>Good afternoon</small><h3>What would you like to eat?</h3><div className="browser-search">Search kitchens and meals</div><div className="browser-meals"><Dish tone="rice"/><Dish tone="pasta"/><Dish tone="grill"/></div></div></div>
  </div>;
}

export default function Landing() {
  const root = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [address, setAddress] = useState("");
  const [home, setHome] = useState<PublicHome | null>(null);
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [mealResults, setMealResults] = useState<PublicMeal[]>([]);
  const [kitchenResults, setKitchenResults] = useState<PublicKitchen[]>([]);
  const storedUser = readStoredUser();
  const dashboard = localStorage.getItem("authToken") && storedUser ? roleHome(storedUser.role) : "";

  useEffect(() => {
    let active = true;
    publicApi.get<PublicHome>("/public/home").then(({ data }) => { if (active) setHome(data); }).catch(() => undefined);
    return () => { active = false; };
  }, []);

  useEffect(() => {
    const value = query.trim();
    if (!value) { setMealResults([]); setKitchenResults([]); setSearchError(""); setSearching(false); return; }
    let active = true;
    const timer = window.setTimeout(() => {
      setSearching(true); setSearchError("");
      Promise.all([
        publicApi.get<PublicMeal[]>("/public/meals", { params: { search: value, limit: 8, offset: 0 } }),
        publicApi.get<{ items: PublicKitchen[] }>("/public/kitchens", { params: { search: value, limit: 4, offset: 0 } }),
      ]).then(([meals, kitchens]) => { if (active) { setMealResults(meals.data); setKitchenResults(kitchens.data.items); } })
        .catch(() => { if (active) setSearchError("Search is unavailable right now. Please try again."); })
        .finally(() => { if (active) setSearching(false); });
    }, 300);
    return () => { active = false; window.clearTimeout(timer); };
  }, [query]);

  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } })
        .from(".land-header", { y: -24, opacity: 0, duration: .55 })
        .from("[data-line]", { yPercent: 110, stagger: .08, duration: .9 }, "-=.2")
        .from("[data-intro]", { y: 24, opacity: 0, stagger: .08, duration: .65 }, "-=.55")
        .from("[data-device]", { y: 52, rotate: 5, opacity: 0, stagger: .1, duration: .95 }, "-=.7");
      gsap.to(".hero-track", { y: 10, x: -5, duration: 5.4, repeat: -1, yoyo: true, ease: "sine.inOut" });
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => gsap.from(element, { y: 42, opacity: 0, duration: .8, ease: "power3.out", scrollTrigger: { trigger: element, start: "top 88%", once: true } }));
      gsap.fromTo(".category-track", { xPercent: 3 }, { xPercent: -4, ease: "none", scrollTrigger: { trigger: ".categories", start: "top bottom", end: "bottom top", scrub: 1 } });
    }, root);
    return () => context.revert();
  }, []);

  const submit = (event: FormEvent) => { event.preventDefault(); navigate(`/signup?role=customer${address.trim() ? `&address=${encodeURIComponent(address.trim())}` : ""}`); };

  return <div className="landing" ref={root}>
    <a className="skip" href="#main-content">Skip to content</a>
    <header className="land-header">
      <Link to="/" className="land-logo"><img src={logo} alt="PickEAT PickIT"/></Link>
      <nav className="land-nav"><a href="#discover">Order food</a><Link to="/vendors">For vendors</Link><Link to="/riders">For riders</Link><Link to="/about">About</Link></nav>
      <div className="header-actions">{dashboard ? <><span className="land-user-greeting">Hi, {storedUser?.firstname || "there"}</span><Link className="land-button primary" to={dashboard}>Dashboard <ArrowRight/></Link></> : <><Link to="/signin">Sign in</Link><Link className="land-button primary" to="/signup?role=customer">Get started <ArrowRight/></Link></>}<button aria-label="Toggle navigation" aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button></div>
      {menu && <nav className="mobile-nav"><a href="#discover" onClick={() => setMenu(false)}>Order food</a><Link to="/vendors">For vendors</Link><Link to="/riders">For riders</Link><Link to="/about">About Pepi</Link>{dashboard ? <Link className="mobile-dashboard-link" to={dashboard}>Open dashboard <ArrowRight/></Link> : <Link to="/signin">Sign in</Link>}</nav>}
    </header>
    <main id="main-content">
      <section className="land-hero">
        <div className="hero-copy"><h1><span><i data-line>Food you want,</i></span><span><i data-line>right where</i></span><span><i data-line>you <em>are.</em></i></span></h1><p data-intro>Find nearby kitchens, order your favourites, and follow every step to your door.</p>
          <form className="location-form" onSubmit={submit} data-intro><MapPin/><label><span className="sr-only">Delivery address</span><input value={address} onChange={e => setAddress(e.target.value)} placeholder="What is your delivery address?"/></label><button>Find food <ArrowRight/></button></form>
          <button className="use-location" data-intro onClick={() => navigate("/signup?role=customer")}>Use my current location</button>
        </div>
        <div className="hero-scene"><div className="hero-browser" data-device><Browser/></div><div className="hero-phone" data-device><Phone/></div><div className="hero-track" data-device><Phone tracking/></div><div className="order-chip" data-device><i/><div><small>Order confirmed</small><strong>Lola's Kitchen</strong></div></div></div>
      </section>

      <section className="land-section discover" id="discover" data-reveal><div className="section-heading"><h2>Your next favourite kitchen is close by.</h2><Link to="/signup?role=customer">See kitchens near you <ArrowRight/></Link></div><label className="public-search"><Search/><span className="sr-only">Search meals and kitchens</span><input value={query} onChange={event => setQuery(event.target.value)} placeholder="Search real meals and kitchens"/>{query && <button type="button" onClick={() => setQuery("")} aria-label="Clear search"><X/></button>}</label>{searching && <p className="public-search-status" role="status">Searching available menus...</p>}{searchError && <p className="public-search-error" role="alert">{searchError}</p>}{query.trim() && !searching && !searchError && <div className="public-results"><div className="public-result-group"><h3>Kitchens</h3><div className="kitchen-grid compact">{kitchenResults.map(kitchen => <PublicKitchenCard kitchen={kitchen} key={kitchen.id}/>)}</div>{!kitchenResults.length && <p>No matching kitchens are open.</p>}</div><div className="public-result-group"><h3>Meals</h3><div className="public-meal-grid">{mealResults.map(meal => <PublicMealCard meal={meal} key={meal.id}/>)}</div>{!mealResults.length && <p>No matching meals are available.</p>}</div></div>}{!query.trim() && <><div className="kitchen-grid">{(home?.all_kitchens || []).slice(0, 4).map(kitchen => <PublicKitchenCard kitchen={kitchen} key={kitchen.id}/>)}</div>{home && home.all_kitchens.length === 0 && <p className="public-empty">No kitchens are open right now. Please check again soon.</p>}<div className="public-result-group featured-meals"><div className="section-heading small"><h2>Meals available now.</h2><Link to="/signup?role=customer">Start an order <ArrowRight/></Link></div><div className="public-meal-grid">{(home?.top_items || []).slice(0, 8).map(meal => <PublicMealCard meal={meal} key={meal.id}/>)}</div></div></>}</section>

      {(home?.categories?.length || 0) > 0 && <section className="land-section categories"><div className="section-heading" data-reveal><h2>Browse by appetite.</h2><p>Start with what sounds good. We will help with the rest.</p></div><div className="category-viewport"><div className="category-track">{home!.categories.slice(0, 10).map((name, index) => <Link to={`/signup?role=customer&category=${encodeURIComponent(name)}`} className={`category c${index % 6}`} key={name}><Dish tone={["sun","rice","pasta","grill","leaf","tomato"][index % 6]}/><strong>{name}</strong></Link>)}</div></div></section>}

      <section className="land-section journey"><div className="section-heading" data-reveal><h2>From craving to doorstep.</h2><p>Three clear moments. One order you can follow from start to finish.</p></div><div className="journey-grid">
        <article data-reveal><b>01</b><div className="step-visual"><Phone/></div><h3>Choose what looks good</h3><p>Browse nearby kitchens and see every meal in context before you decide.</p></article>
        <article data-reveal><b>02</b><div className="cart-mock"><Dish tone="rice"/><div><strong>Jollof bowl</strong><small>Extra plantain</small></div><b>₦5,400</b><button>Place order</button></div><h3>Make it yours</h3><p>Add the extras you want, confirm your address, and choose how to pay.</p></article>
        <article data-reveal><b>03</b><div className="step-visual track"><Phone tracking/></div><h3>Watch it come to you</h3><p>See when the kitchen starts, when your rider collects it, and when to meet them.</p></article>
      </div></section>

      <section className="land-section product-world"><div data-reveal><h2>Pepi goes where your appetite goes.</h2><p>Order on your phone or desktop, then keep track from whichever screen is closest.</p><Link className="land-button primary" to="/signup?role=customer">Start an order <ArrowRight/></Link><StoreBadges role="customer"/></div><div className="world-stage"><Browser/><div className="world-phone"><Phone/></div><div className="world-note"><span>PAID</span><strong>Your order is being prepared</strong><small>We will tell you when it leaves the kitchen.</small></div></div></section>

      <section className="land-section partner-section"><div className="section-heading" data-reveal><h2>Built for the whole delivery.</h2><p>Good service starts before an order is placed and continues until it arrives.</p></div><div className="partner-grid">
        <Link className="partner-card" to="/vendors" data-reveal><div className="partner-ui vendor-ui"><i/>New order<div><strong>2x Jollof bowl</strong><small>Pickup in 24 minutes</small></div></div><div><h3>Grow your kitchen with Pepi</h3><p>Manage your menu, orders, availability, and earnings in one clear workspace.</p><span>Explore Pepi for vendors <ArrowRight/></span></div></Link>
        <Link className="partner-card" to="/riders" data-reveal><div className="partner-ui rider-ui"><div className="route"><i/><b/></div><small>Next pickup</small><strong>8 minutes away</strong></div><div><h3>Make every trip count</h3><p>Find available deliveries, follow the route, and keep your earnings in view.</p><span>Explore Pepi for riders <ArrowRight/></span></div></Link>
      </div></section>

      <section className="land-section trust" data-reveal><div><h2>You should never have to guess what happens next.</h2><p>Order updates, payment status, and support conversations stay connected to the same delivery.</p></div><div className="timeline"><div className="done"><i/><span><strong>Order confirmed</strong><small>2:14 PM</small></span></div><div className="done"><i/><span><strong>Kitchen is preparing your meal</strong><small>2:18 PM</small></span></div><div className="active"><i/><span><strong>Rider is heading to the kitchen</strong><small>Live update</small></span></div><div><i/><span><strong>Delivered to you</strong><small>Coming next</small></span></div></div></section>

      <section className="final-cta" data-reveal><div><h2>What are you in the mood for?</h2><p>Tell us where you are and we will show you what is cooking nearby.</p><div><Link className="land-button dark" to="/signup?role=customer">Find food near me <ArrowRight/></Link><Link className="land-button light" to="/signup?role=customer">Create an account</Link></div><StoreBadges role="customer" compact/></div><div className="final-phone"><Phone/></div></section>
    </main>
    <footer className="land-footer">
      <div className="footer-lead"><div><h2>Good food should feel close.</h2><p>Find your next meal, build your kitchen, or make deliveries with Pepi.</p></div><Link to="/signup?role=customer">Find food near you <ArrowRight/></Link></div>
      <div className="footer-brand"><img src={logo} alt="PickEAT PickIT"/><p>Local food, clear delivery, and a better way to bring everyone together.</p><StoreBadges role="customer" compact/><span>Serving communities one order at a time.</span></div>
      <div><strong>Customers</strong><Link to="/signup?role=customer">Find food</Link><Link to="/signin?role=customer">Sign in</Link><Link to="/customer/orders">Track an order</Link><Link to="/customer/support">Get support</Link></div>
      <div><strong>Partners</strong><Link to="/vendors">For vendors</Link><Link to="/signup?role=vendor">List your kitchen</Link><Link to="/riders">For riders</Link><Link to="/signup?role=rider">Start riding</Link></div>
      <div><strong>Company</strong><Link to="/about">About Pepi</Link><Link to="/careers">Careers</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/account-deletion">Account deletion</Link></div>
      <div className="footer-bottom"><span>© {new Date().getFullYear()} PickEAT PickIT</span><nav><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link><Link to="/account-deletion">Manage your data</Link></nav><span>Made for good food and the people who move it.</span></div>
    </footer>
  </div>;
}

function PublicKitchenCard({ kitchen }: { kitchen: PublicKitchen }) {
  return <Link to={`/signup?role=customer&kitchen=${encodeURIComponent(kitchen.id)}`} className="kitchen"><div className="kitchen-art">{kitchen.logo_url ? <img src={kitchen.logo_url} alt={kitchen.business_name} loading="lazy"/> : <Store aria-hidden="true"/>}</div><div className="kitchen-meta"><div><h3>{kitchen.business_name}</h3><p>{kitchen.business_category || `${kitchen.min_preparation_time || 15} min preparation`}</p></div><span><Star/> {Number(kitchen.rating || 0) > 0 ? kitchen.rating : "New"}</span></div></Link>;
}

function PublicMealCard({ meal }: { meal: PublicMeal }) {
  return <Link to={`/signup?role=customer&meal=${encodeURIComponent(meal.id)}`} className="public-meal"><div>{meal.image_url ? <img src={meal.image_url} alt={meal.name} loading="lazy"/> : <Utensils aria-hidden="true"/>}</div><span><small>{meal.vendor?.business_name || meal.category || "Available now"}</small><strong>{meal.name}</strong><b>₦{Number(meal.price || 0).toLocaleString("en-NG")}</b></span></Link>;
}
