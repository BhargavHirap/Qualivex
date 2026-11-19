"use client";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Bot, CalendarCheck, Check, ChevronRight, CircleDot, MessageSquareText, ShieldCheck, Sparkles, Target, Workflow } from "lucide-react";
const features = [
  {icon:MessageSquareText,title:"Respond in seconds",copy:"Turn every enquiry into a real conversation, even when your team is offline."},
  {icon:Target,title:"Qualify with intent",copy:"Understand fit, budget, urgency and decision-making power before your team steps in."},
  {icon:CalendarCheck,title:"Book the next step",copy:"Move qualified prospects towards a meeting without the back-and-forth."}
];
export default function Home(){
 return <main className="shell">
  <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
   <Link href="/" className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-[#c3f477] text-[#10150b] grid place-items-center font-extrabold">Q</span><span className="font-bold tracking-tight text-xl">qualivex<span className="accent">.</span></span></Link>
   <div className="hidden md:flex items-center gap-8 text-sm muted"><a href="#product">Product</a><a href="#workflow">How it works</a><a href="#security">Security</a></div>
   <Link href="/login" className="btn-ghost text-sm flex items-center gap-2">Sign in <ArrowUpRight size={15}/></Link>
  </nav>
  <section className="max-w-7xl mx-auto px-6 pt-20 pb-24 grid lg:grid-cols-[1.05fr_.95fr] gap-16 items-center">
   <div><div className="inline-flex items-center gap-2 rounded-full border border-[#c3f477]/20 bg-[#c3f477]/[.06] px-3 py-1.5 text-xs text-[#c3f477] mb-7"><Sparkles size={13}/> AI-powered sales workflow</div>
    <h1 className="font-[Manrope] text-5xl md:text-7xl leading-[1.04] tracking-[-.055em] font-extrabold max-w-2xl">Less chasing.<br/><span className="accent">More closing.</span></h1>
    <p className="muted text-lg leading-8 mt-7 max-w-xl">Qualivex helps service businesses respond to enquiries, qualify the right prospects and turn conversations into booked meetings.</p>
    <div className="flex flex-wrap gap-3 mt-9"><Link href="/login" className="btn-primary inline-flex items-center gap-2">Get started <ArrowRight size={17}/></Link><a href="#product" className="btn-ghost">See how it works</a></div>
    <div className="flex items-center gap-5 mt-12 text-xs muted"><span className="flex items-center gap-2"><CircleDot size={13} className="accent"/> Built for service teams</span><span className="flex items-center gap-2"><ShieldCheck size={14}/> Human handoff included</span></div>
   </div>
   <div className="relative"><div className="absolute -inset-8 bg-[#b5ed6a]/[.07] blur-3xl rounded-full"/><div className="glass rounded-2xl p-5 md:p-6 relative shadow-2xl">
    <div className="flex justify-between items-center border-b border-white/[.07] pb-4"><div><div className="text-sm font-semibold">Lead overview</div><div className="muted text-xs mt-1">Product preview</div></div><span className="text-[10px] rounded-full px-2.5 py-1 bg-[#c3f477]/10 text-[#c3f477]">PRODUCT PREVIEW</span></div>
    <div className="grid grid-cols-3 gap-3 py-5">{[["Lead records","—","+18.4%"],["Qualified","—","50.0%"],["Meetings","—","+12.8%"]].map(([a,b,c])=><div key={a} className="bg-white/[.035] rounded-xl p-3"><div className="muted text-[11px]">{a}</div><div className="text-2xl font-bold mt-2">{b}</div><div className="text-[10px] accent mt-1">{c}</div></div>)}</div>
    <div className="bg-[#0b1016] rounded-xl p-4"><div className="flex items-center gap-2 text-xs font-semibold mb-4"><span className="w-7 h-7 rounded-lg bg-[#c3f477]/10 grid place-items-center text-[#c3f477]"><Bot size={15}/></span> Qualivex assistant <span className="ml-auto text-[10px] muted">ACTIVE</span></div>
     <div className="max-w-[85%] bg-white/[.06] rounded-xl rounded-tl-sm p-3 text-xs leading-5 text-slate-300">Hi! Thanks for reaching out. What are you looking to improve in your business right now?</div>
     <div className="ml-auto mt-3 max-w-[80%] bg-[#c3f477] text-[#17200d] rounded-xl rounded-tr-sm p-3 text-xs leading-5">We need more qualified appointments for our agency.</div>
     <div className="mt-3 flex items-center gap-2 text-[11px] muted"><span className="w-1.5 h-1.5 rounded-full bg-[#c3f477]"/> Intent detected · Sales growth</div>
    </div>
    <div className="flex items-center justify-between mt-4 text-xs muted"><span className="flex items-center gap-2"><Check size={13} className="accent"/> Lead captured</span><span className="flex items-center gap-2"><Check size={13} className="accent"/> Follow-up ready</span></div>
   </div></div>
  </section>
  <section id="product" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/[.06]"><div className="max-w-xl"><div className="accent text-xs uppercase tracking-[.2em] font-bold">One connected workflow</div><h2 className="font-[Manrope] text-3xl md:text-4xl font-bold tracking-tight mt-4">From first hello to a qualified meeting.</h2><p className="muted leading-7 mt-4">A practical sales layer that keeps your pipeline moving while your people focus on the conversations that matter.</p></div>
   <div className="grid md:grid-cols-3 gap-4 mt-12">{features.map((f,i)=><div key={f.title} className="glass rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-[#c3f477]/10 text-[#c3f477] grid place-items-center"><f.icon size={19}/></div><div className="muted text-xs mt-7">0{i+1}</div><h3 className="font-semibold text-lg mt-2">{f.title}</h3><p className="muted text-sm leading-6 mt-3">{f.copy}</p></div>)}</div>
  </section>
  <section id="workflow" className="max-w-7xl mx-auto px-6 py-20"><div className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"><div><div className="accent text-xs uppercase tracking-[.2em] font-bold">Start with the demo</div><h2 className="font-[Manrope] text-3xl font-bold mt-4">See your pipeline in motion.</h2><p className="muted mt-3 max-w-lg leading-7">Create a secure workspace, add real leads, and run qualification on your own enquiries.</p></div><Link href="/login" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">Open workspace <ChevronRight size={17}/></Link></div></section>
  <footer id="security" className="max-w-7xl mx-auto px-6 py-8 border-t border-white/[.06] flex flex-col sm:flex-row gap-3 justify-between text-xs muted"><span>© 2026 Qualivex. Built for better conversations.</span><span>Secure workspace · Your data stays yours.</span></footer>
 </main>
}