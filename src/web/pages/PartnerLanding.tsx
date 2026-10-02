import { useLayoutEffect, useRef } from "react";
import { ArrowRight, Bell, CalendarDays, Check, ChevronRight, Home, Info, Map, MessageSquare, Settings, ShoppingBag, UserRound } from "lucide-react";
import { Link } from "react-router-dom";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import logo from "../../assets/Logo SVG 1.png";
import { StoreBadges } from "../components/StoreBadges";
import { readStoredUser, roleHome } from "../auth/roleRouting";
import "./PartnerLanding.css";

gsap.registerPlugin(ScrollTrigger);

type Role = "vendor" | "rider";

const content = {
  vendor: {
    heading: "More orders. Clearer operations.",
    intro: "Run your menu, follow every order, and keep an eye on your earnings from one place.",
    action: "List your kitchen",
    signin: "Vendor sign in",
    signup: "/signup?role=vendor",
    login: "/signin?role=vendor",
    sections: [
      ["Your day at a glance", "See new orders, current sales, and kitchen availability without piecing the day together."],
      ["A menu you can change yourself", "Update meals, prices, descriptions, add-ons, images, and availability whenever you need to."],
      ["Know what you have earned", "Follow transactions, commissions, and payout requests with a clear history behind every amount."],
    ],
  },
  rider: {
    heading: "Move through your city on your terms.",
    intro: "See available deliveries, follow the route, and track what you earn as you go.",
    action: "Start riding",
    signin: "Rider sign in",
    signup: "/signup?role=rider",
    login: "/signin?role=rider",
    sections: [
      ["See the delivery before you accept", "Review the pickup, destination, and delivery details before deciding what works for you."],
      ["The route stays with you", "Move from pickup to arrival and delivery with each next action clearly shown."],
      ["Your earnings, in view", "Check completed trips, transaction history, balance, and withdrawals from one place."],
    ],
  },
} as const;

function RiderTabs({ active = "home" }: { active?: "home" | "orders" | "map" }) {
  return <div className="rider-mock-tabs"><span className={active === "home" ? "active" : ""}><Home/>Home</span><span><MessageSquare/>Chat</span><span className={active === "orders" ? "active" : ""}><ShoppingBag/>Orders</span><span className={active === "map" ? "active" : ""}><Map/>Map</span><span><UserRound/>Account</span></div>;
}

function RiderDashboardMock() {
  return <div className="rider-dashboard-mock">
    <header><strong>My Dashboard</strong><Bell/><i>4</i></header>
    <div className="rider-active"><strong>Active Status</strong><span><i/></span></div>
    <div className="rider-period"><b><CalendarDays/>Today</b><small>Earnings, orders, and distance match this period</small></div>
    <div className="rider-stats">
      <div><i><CalendarDays/></i><span><small>Earnings</small><strong>₦ 0</strong></span><ChevronRight/></div>
      <div><i><Info/></i><span><small>Orders</small><strong>0 <em>orders</em></strong></span><ChevronRight/></div>
      <div><span><small>Distance (completed)</small><strong>0.00 <em>KM</em></strong><b>Sum of route distances on completed deliveries</b><u/></span><ChevronRight/></div>
    </div>
    <button className="rider-settings" aria-label="Settings"><Settings/></button><RiderTabs/>
  </div>;
}

function PartnerProduct({ role, index = 0 }: { role: Role; index?: number }) {
  return <div className={`partner-product ${role} state-${index}`} aria-label={`Pepi ${role} app product view`}>
    <div className="pp-status"><span>10:34</span><i/><span>LTE · 40</span></div>
    {role === "rider" && index === 0 ? <RiderDashboardMock/> : <><div className="pp-head"><img src={logo} alt=""/><span>{role === "vendor" ? "Kitchen open" : "Online"}</span></div><div className="pp-title"><small>{role === "vendor" ? "Good afternoon" : "Ready for your next trip?"}</small><strong>{index === 2 ? "Your earnings" : role === "vendor" ? "Today's orders" : "Available deliveries"}</strong></div>{index === 2 ? <><div className="pp-balance"><small>Available balance</small><strong>₦24,800</strong><span>View transactions</span></div><div className="pp-chart"><i/><i/><i/><i/><i/><i/></div>{role === "rider" && <RiderTabs/>}</> : role === "vendor" ? <div className="pp-list"><article><b>New</b><div><strong>Jollof bowl</strong><small>2 items · ₦8,600</small></div><span>12:48</span></article><article><b>Prep</b><div><strong>Pasta special</strong><small>1 item · ₦5,200</small></div><span>12:36</span></article><article><b>Ready</b><div><strong>Grill combo</strong><small>3 items · ₦12,400</small></div><span>12:21</span></article></div> : <><div className="pp-map"><i/><b/><span/></div><div className="pp-delivery"><small>New delivery</small><strong>Marina to Ikoyi</strong><span>4.8 km · ₦2,100</span><button>View delivery</button></div><RiderTabs active="orders"/></>}</>}
  </div>;
}

export default function PartnerLanding({ role }: { role: Role }) {
  const root = useRef<HTMLDivElement>(null);
  const page = content[role];
  const storedUser = readStoredUser();
  const dashboard = localStorage.getItem("authToken") && storedUser ? roleHome(storedUser.role) : "";
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      gsap.timeline({ defaults: { ease: "power3.out" } }).from(".pl-header", { y: -20, opacity: 0 }).from(".pl-hero h1 span", { yPercent: 110, stagger: .08, duration: .85 }, "-=.1").from(".pl-hero [data-enter]", { y: 25, opacity: 0, stagger: .08 }, "-=.45").from(".pl-stage>*", { y: 48, rotate: 4, opacity: 0, stagger: .12, duration: .8 }, "-=.55");
      gsap.utils.toArray<HTMLElement>("[data-partner-reveal]").forEach(element => gsap.from(element, { y: 40, opacity: 0, duration: .75, scrollTrigger: { trigger: element, start: "top 88%", once: true } }));
    }, root);
    return () => context.revert();
  }, [role]);
  return <div className={`partner-page ${role}`} ref={root}>
    <header className="pl-header"><Link to="/"><img src={logo} alt="PickEAT PickIT"/></Link><nav><Link to="/">Order food</Link><Link className={role === "vendor" ? "active" : ""} to="/vendors">For vendors</Link><Link className={role === "rider" ? "active" : ""} to="/riders">For riders</Link></nav><div className="pl-header-actions">{dashboard ? <><span className="pl-auth-name">Hi, {storedUser?.firstname || "there"}</span><Link className="pl-button" to={dashboard}>Dashboard <ArrowRight/></Link></> : <><Link className="pl-header-signin" to={page.login}>{page.signin}</Link><Link className="pl-button" to={page.signup}>{page.action} <ArrowRight/></Link></>}</div></header>
    <main><section className="pl-hero"><div><h1>{page.heading.split(" ").map((word, index) => <span key={`${word}-${index}`}>{word}&nbsp;</span>)}</h1><p data-enter>{page.intro}</p><div className="pl-actions" data-enter><Link className="pl-button" to={page.signup}>{page.action} <ArrowRight/></Link><Link className="pl-secondary" to={page.login}>{page.signin}</Link></div></div><div className="pl-stage"><div className="pl-main-device"><PartnerProduct role={role}/></div><div className="pl-small-device"><PartnerProduct role={role} index={2}/></div><div className="pl-live-card"><i/><div><small>{role === "vendor" ? "Order ready" : "Pickup confirmed"}</small><strong>{role === "vendor" ? "Rider arriving soon" : "Head to the customer"}</strong></div></div></div></section>
      <section className="pl-intro" data-partner-reveal><h2>{role === "vendor" ? "Everything your kitchen needs for a busy day." : "A clear view from request to drop-off."}</h2><p>{role === "vendor" ? "Pepi keeps the work close to the order, so your team knows what came in, what is cooking, and what is ready." : "Pepi gives each delivery a simple sequence, with the information you need before and after you accept."}</p></section>
      <section className="pl-features">{page.sections.map((section, index) => <article key={section[0]} data-partner-reveal><div className="pl-copy"><span>0{index + 1}</span><h2>{section[0]}</h2><p>{section[1]}</p></div><div className="pl-product-wrap"><PartnerProduct role={role} index={index}/></div></article>)}</section>
      {role === "rider" && <section className="pl-requirements" data-partner-reveal><div><h2>What you need to get started.</h2><p>Have these details ready so your application can move forward without avoidable delays.</p></div><ul><li><Check/>Your personal and contact details</li><li><Check/>A valid identity document</li><li><Check/>Your guarantor's information</li><li><Check/>Bank details for withdrawals</li></ul></section>}
      <section className="pl-final" data-partner-reveal><h2>{role === "vendor" ? "Ready to put your kitchen on Pepi?" : "Ready for your first delivery?"}</h2><p>{role === "vendor" ? "Start with your kitchen details. You can build your menu once your account is ready." : "Create your rider account and complete the details needed for review."}</p><Link className="pl-button dark" to={page.signup}>{page.action} <ArrowRight/></Link><StoreBadges role={role}/></section>
    </main><footer className="pl-footer"><div className="pl-footer-lead"><Link to="/"><img src={logo} alt="PickEAT PickIT"/></Link><p>Food, kitchens, and deliveries working better together.</p></div><div><strong>Explore Pepi</strong><Link to="/">Order food</Link><Link to="/vendors">For vendors</Link><Link to="/riders">For riders</Link></div><div><strong>Get started</strong><Link to={page.signup}>{page.action}</Link><Link to={page.login}>{page.signin}</Link><Link to="/signin">Get support</Link></div><div><strong>Company</strong><Link to="/about">About</Link><Link to="/careers">Careers</Link><Link to="/privacy">Privacy</Link><Link to="/terms">Terms</Link></div><div className="pl-footer-bottom"><span>© {new Date().getFullYear()} PickEAT PickIT</span><Link to="/account-deletion">Manage your data</Link></div></footer>
  </div>;
}
