import type { ReactNode } from "react";
import { ArrowLeft, Check, ShieldCheck } from "lucide-react";
import { Link } from "react-router-dom";
import logo from "../../assets/Logo SVG 1.png";
import "./AuthShell.css";

export function AuthShell({ children, title, copy, step, total = 4, mode = "default" }: { children: ReactNode; title: string; copy: string; step?: number; total?: number; mode?: "default" | "login" }) {
  return <div className={`auth-refresh ${mode}`}><aside><Link to="/" className="auth-back"><ArrowLeft/> Back to Pepi</Link><div className="auth-story"><img src={logo} alt="PickEAT PickIT"/><h2>Good food brings everyone closer.</h2><p>Order from nearby kitchens, grow your food business, or make deliveries with a platform built for each role.</p><div><span><Check/>Clear order updates</span><span><Check/>Secure account access</span><span><Check/>Support when you need it</span></div></div><small><ShieldCheck/>Your details are protected and used only to run your Pepi account.</small></aside><main><div className="auth-mobile-brand"><Link to="/"><img src={logo} alt="PickEAT PickIT"/></Link></div>{step && <div className="auth-progress" aria-label={`Step ${step} of ${total}`}><span>Step {step} of {total}</span><div>{Array.from({ length: total }, (_, index) => <i className={index < step ? "active" : ""} key={index}/>)}</div></div>}<header><h1>{title}</h1><p>{copy}</p></header>{children}</main></div>;
}

export function AuthField({ label, children, hint }: { label: string; children: ReactNode; hint?: string }) {
  return <label className="auth-field"><span>{label}</span>{children}{hint && <small>{hint}</small>}</label>;
}
