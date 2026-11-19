import Link from "next/link";
import { ArrowRight,ArrowUpRight,BarChart3,CalendarCheck,CheckCircle2,Globe2,LockKeyhole,MessageSquareText,Network,ShieldCheck,Sparkles,Target,Zap } from "lucide-react";
const pillars=[
 {icon:MessageSquareText,title:"Capture every signal",copy:"Bring enquiries from your website and connected channels into one accountable pipeline."},
 {icon:Target,title:"Qualify with evidence",copy:"Score fit, intent, budget and urgency. Keep the reason behind every recommendation visible."},
 {icon:CalendarCheck,title:"Move to the next action",copy:"Turn a qualified opportunity into a clear owner, follow-up and meeting—not another forgotten CRM row."}
];
const principles=[
 ["Evidence, not vibes","Show why a prospect was prioritised and what information is still missing."],
 ["Human-controlled automation","Let teams approve messages, bookings and high-impact actions before they happen."],
 ["Revenue, not vanity metrics","Measure qualified, attended and won opportunities—not just chatbot conversations."]
];
export default function Home(){
 return <main className="shell">
  <nav className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
   <Link href="/" className="flex items-center gap-3"><span className="w-9 h-9 rounded-xl bg-[#c3f477] text-[#10150b] grid place-items-center font-extrabold">Q</span><span className="font-bold tracking-tight text-xl">qualivex<span className="accent">.</span></span></Link>
   <div className="hidden md:flex items-center gap-8 text-sm muted"><a href="#platform">Platform</a><a href="#principles">Principles</a><a href="#security">Security</a></div>
   <Link href="/login" className="btn-ghost text-sm flex items-center gap-2">Sign in <ArrowUpRight size={15}/></Link>
  </nav>
  <section className="max-w-7xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.05fr_.95fr] gap-16 items-center">
   <div><div className="inline-flex items-center gap-2 rounded-full border border-[#c3f477]/20 bg-[#c3f477]/[.06] px-3 py-1.5 text-xs text-[#c3f477] mb-7"><Sparkles size={13}/> The revenue workflow for modern teams</div>
    <h1 className="font-[Manrope] text-5xl md:text-7xl leading-[1.04] tracking-[-.055em] font-extrabold max-w-2xl">Turn every<br/><span className="accent">enquiry into</span><br/>a next step.</h1>
    <p className="muted text-lg leading-8 mt-7 max-w-xl">Qualivex connects lead capture, explainable qualification and sales follow-through in one secure workspace—so your team knows who to contact, why, and what to do next.</p>
    <div className="flex flex-wrap gap-3 mt-9"><Link href="/login" className="btn-primary inline-flex items-center gap-2">Create workspace <ArrowRight size={17}/></Link><a href="#platform" className="btn-ghost">Explore the platform</a></div>
    <div className="flex flex-wrap items-center gap-5 mt-12 text-xs muted"><span className="flex items-center gap-2"><ShieldCheck size={14}/> Workspace-level data isolation</span><span className="flex items-center gap-2"><LockKeyhole size={14}/> Secure sign-in</span></div>
   </div>
   <div className="relative"><div className="absolute -inset-8 bg-[#b5ed6a]/[.07] blur-3xl rounded-full"/><div className="glass rounded-2xl p-6 md:p-7 relative shadow-2xl">
    <div className="flex items-center justify-between border-b border-white/[.07] pb-5"><div><div className="text-sm font-semibold">The lead-to-revenue loop</div><div className="muted text-xs mt-1">A connected operating workflow</div></div><span className="text-[10px] rounded-full px-2.5 py-1 bg-[#c3f477]/10 text-[#c3f477]">QUALIVEX</span></div>
    <div className="space-y-3 py-6">{[{n:"01",title:"New enquiry",detail:"A prospect reaches your business",icon:MessageSquareText},{n:"02",title:"Evidence-based qualification",detail:"Fit, intent and missing details are assessed",icon:Target},{n:"03",title:"Human-approved next step",detail:"Assign, follow up or offer a meeting",icon:CheckCircle2},{n:"04",title:"Outcome recorded",detail:"Track attended and won opportunities",icon:BarChart3}].map((x,i)=><div key={x.n} className="flex items-center gap-4 rounded-xl bg-[#0b1016] p-4"><div className="text-[10px] muted">{x.n}</div><div className="w-9 h-9 rounded-lg bg-[#c3f477]/10 text-[#c3f477] grid place-items-center"><x.icon size={17}/></div><div className="min-w-0"><div className="text-xs font-semibold">{x.title}</div><div className="text-[10px] muted mt-1">{x.detail}</div></div>{i<3&&<ArrowRight size={14} className="ml-auto muted"/>}</div>)}</div>
    <div className="flex items-center justify-between text-[10px] muted border-t border-white/[.07] pt-4"><span className="flex items-center gap-2"><Globe2 size={13}/> Built for connected teams</span><span className="flex items-center gap-2"><Zap size={13} className="accent"/> Automation with control</span></div>
   </div></div>
  </section>
  <section id="platform" className="max-w-7xl mx-auto px-6 py-20 border-t border-white/[.06]"><div className="max-w-2xl"><div className="accent text-xs uppercase tracking-[.2em] font-bold">One connected workflow</div><h2 className="font-[Manrope] text-3xl md:text-4xl font-bold tracking-tight mt-4">Less tool-hopping. More accountable selling.</h2><p className="muted leading-7 mt-4">Start with a secure lead workspace and add intelligence and connected channels as your process matures.</p></div>
   <div className="grid md:grid-cols-3 gap-4 mt-12">{pillars.map((f,i)=><div key={f.title} className="glass rounded-2xl p-6"><div className="w-10 h-10 rounded-xl bg-[#c3f477]/10 text-[#c3f477] grid place-items-center"><f.icon size={19}/></div><div className="muted text-xs mt-7">0{i+1}</div><h3 className="font-semibold text-lg mt-2">{f.title}</h3><p className="muted text-sm leading-6 mt-3">{f.copy}</p></div>)}</div>
  </section>
  <section id="principles" className="max-w-7xl mx-auto px-6 py-20 grid lg:grid-cols-2 gap-14 items-start"><div><div className="accent text-xs uppercase tracking-[.2em] font-bold">Built on trust</div><h2 className="font-[Manrope] text-3xl md:text-4xl font-bold tracking-tight mt-4">Automation should earn trust before it earns autonomy.</h2><p className="muted leading-7 mt-4">AI can be confidently wrong. Qualivex is designed to show evidence, surface uncertainty and keep people in control of customer-facing decisions.</p></div><div className="space-y-3">{principles.map(([title,copy])=><div key={title} className="glass rounded-xl p-5"><div className="flex items-center gap-3"><CheckCircle2 size={17} className="accent"/><h3 className="font-semibold text-sm">{title}</h3></div><p className="muted text-xs leading-6 mt-3 pl-7">{copy}</p></div>)}</div></section>
  <section id="security" className="max-w-7xl mx-auto px-6 py-10"><div className="glass rounded-3xl p-8 md:p-12 flex flex-col md:flex-row md:items-center justify-between gap-8"><div><div className="accent text-xs uppercase tracking-[.2em] font-bold">Start with your own data</div><h2 className="font-[Manrope] text-3xl font-bold mt-4">Build a pipeline your team can trust.</h2><p className="muted mt-3 max-w-lg leading-7">Create your workspace, save real leads and test qualification against your own criteria. Connected channels are enabled only after their credentials and permissions are configured.</p></div><Link href="/login" className="btn-primary inline-flex items-center gap-2 whitespace-nowrap">Create your workspace <ArrowRight size={17}/></Link></div></section>
  <footer className="max-w-7xl mx-auto px-6 py-8 mt-12 border-t border-white/[.06] flex flex-col sm:flex-row gap-3 justify-between text-xs muted"><span>© 2026 Qualivex. Built for better conversations.</span><span>Evidence-first · Human-controlled · Workspace-secure</span></footer>
 </main>
}