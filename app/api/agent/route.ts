import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type Fit = boolean | null;
type State = { service_fit:Fit; budget_fit:Fit; timeline_fit:Fit; is_decision_maker:Fit; collected_info:{name?:string|null;contact?:string|null;timeline?:string|null;budget_or_tier?:string|null;service?:string|null;timezone?:string|null}; missing_info:string[]; disqualify_reason:string|null };
const emptyState:State={service_fit:null,budget_fit:null,timeline_fit:null,is_decision_maker:null,collected_info:{},missing_info:["service","budget","timeline","decision_maker","name","contact"],disqualify_reason:null};
const clean=(v:unknown,n=500)=>typeof v==="string"?v.trim().slice(0,n):"";
function mergeState(old:State,next:Partial<State>):State {
 return {service_fit:next.service_fit??old.service_fit,budget_fit:next.budget_fit??old.budget_fit,timeline_fit:next.timeline_fit??old.timeline_fit,is_decision_maker:next.is_decision_maker??old.is_decision_maker,collected_info:{...old.collected_info,...(next.collected_info||{})},missing_info:Array.isArray(next.missing_info)?next.missing_info:old.missing_info,disqualify_reason:next.disqualify_reason??old.disqualify_reason};
}
function enforce(s:State):"IN_PROGRESS"|"QUALIFIED"|"DISQUALIFIED"|"HANDOFF_NEEDED" {
 if(s.disqualify_reason||[s.service_fit,s.budget_fit,s.timeline_fit,s.is_decision_maker].some(v=>v===false))return "DISQUALIFIED";
 const c=s.collected_info;
 return s.service_fit===true&&s.budget_fit===true&&s.timeline_fit===true&&s.is_decision_maker===true&&!!c.name&&!!c.contact?"QUALIFIED":"IN_PROGRESS";
}
function fallback(text:string,p:any,state:State){
 const t=text.toLowerCase();const next:Partial<State>={};
 if(/voice note|audio|image|photo|attachment|human|person|complaint/.test(t))return {reply_text:"Got it — I’m flagging this for the team so a person can follow up directly.",metadata:state,forced:"HANDOFF_NEEDED"};
 if(p.target_service&&t.includes(p.target_service.toLowerCase()))next.service_fit=true;
 if(/not interested|wrong service|job opening|free only/.test(t)){next.service_fit=false;next.disqualify_reason="Outside supported service scope";}
 if(/₹|\$|budget|lakh|lac|thousand|standard pricing|comfortable/.test(t))next.budget_fit=true;
 if(/next week|this week|within|asap|tomorrow|month|2-3 weeks|2–3 weeks|1\)/.test(t))next.timeline_fit=true;
 if(/myself|for me|i am the|owner|founder|director|decision maker|i decide/.test(t))next.is_decision_maker=true;
 const info:any={};const nm=text.match(/(?:i am|i'm|name is|this is)\s+([A-Z][a-z]{1,30})/i);if(nm)info.name=nm[1];
 const em=text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i);if(em)info.contact=em[0];
 const ph=text.match(/(?:\+?\d[\d\s-]{8,14}\d)/);if(ph)info.contact=ph[0].trim();
 next.collected_info={...state.collected_info,...info};
 const merged=mergeState(state,next);const missing:string[]=[];
 if(merged.service_fit===null)missing.push("service");if(merged.budget_fit===null)missing.push("budget");if(merged.timeline_fit===null)missing.push("timeline");if(merged.is_decision_maker===null)missing.push("decision_maker");if(!merged.collected_info.name)missing.push("name");if(!merged.collected_info.contact)missing.push("contact");merged.missing_info=missing;
 const qs:[string,string][]=[["service","Are you looking for "+(p.target_service||p.core_service||"our main service")+"?"],["budget","Would you be comfortable discussing options around "+(p.minimum_budget||"our standard pricing")+"?"],["timeline","When are you hoping to start — 1) within 2 weeks, 2) this month, or 3) later?"],["decision_maker","Are you the person making the decision, or coordinating with them?"],["name","What name should I use for your consultation?"],["contact","What email or phone number should the team use to confirm?"]];
 const q=qs.find(([k])=>missing.includes(k));const status=enforce(merged);
 let reply=q?q[1]:"Thanks — I have the details. Let me prepare the next step.";
 if(status==="DISQUALIFIED")reply="Thanks for clarifying. It may not be the right fit at this stage."+(p.alternative_resource_url?" You can find more information here: "+p.alternative_resource_url:"");
 if(status==="QUALIFIED")reply="You look like a fit. Choose a confirmed time using the booking link below.";
 return {reply_text:reply,metadata:merged,forced:status};
}
const SYSTEM="You are a friendly, concise intake coordinator. Ask ONE question at a time. Never invent pricing, availability, guarantees or facts. Use only approved FAQs. If a user sends media/voice, requests a human, complains, or asks for unsupported medical/legal/financial specifics, request human handoff. Return strict JSON: {reply_text:string,metadata:{service_fit:boolean|null,budget_fit:boolean|null,timeline_fit:boolean|null,is_decision_maker:boolean|null,collected_info:{name,contact,timeline,budget_or_tier,service,timezone},missing_info:string[],disqualify_reason:string|null}}. Mobile replies must be 1-2 short sentences, ideally under 250 characters. Never mark a criterion true without explicit evidence.";
export async function POST(req:Request){
 try{
  const supabase=await createClient();const {data:{user},error:auth}=await supabase.auth.getUser();if(auth||!user)return NextResponse.json({error:"Sign in to use the qualification assistant."},{status:401});
  const {data:member,error:me}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1).maybeSingle();if(me)throw me;if(!member)return NextResponse.json({error:"Create a workspace first."},{status:409});
  const body=await req.json();const text=clean(body.text,3000);if(!text)return NextResponse.json({error:"Message cannot be empty."},{status:400});
  const channel=["web","whatsapp","instagram_dm"].includes(body.channel)?body.channel:"web";
  let conversation:any=null;
  if(body.conversation_id){const {data,error}=await supabase.from("conversations").select("*").eq("id",clean(body.conversation_id,80)).eq("workspace_id",member.workspace_id).single();if(error)throw error;conversation=data;}
  else {const {data,error}=await supabase.from("conversations").insert({workspace_id:member.workspace_id,channel,status:"IN_PROGRESS",state:emptyState}).select("*").single();if(error)throw error;conversation=data;}
  const {data:p}=await supabase.from("qualification_profiles").select("*").eq("workspace_id",member.workspace_id).maybeSingle();
  const profile=p||{business_name:"your business",core_service:"",target_service:"",minimum_budget:"",timeline_window:"within 30 days",approved_faqs:"",alternative_resource_url:"",calendar_booking_url:"",timezone:"Asia/Kolkata"};
  const old=(conversation.state||emptyState) as State;
  const {error:ie}=await supabase.from("conversation_messages").insert({workspace_id:member.workspace_id,conversation_id:conversation.id,direction:"inbound",content:text,metadata:{channel}});if(ie)throw ie;
  const {data:history}=await supabase.from("conversation_messages").select("direction,content").eq("conversation_id",conversation.id).order("created_at",{ascending:false}).limit(10);
  let generated:any=null;
  if(process.env.GROQ_API_KEY){
   try{
    const resp=await fetch("https://api.groq.com/openai/v1/chat/completions",{method:"POST",headers:{"Authorization":"Bearer "+process.env.GROQ_API_KEY,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.GROQ_MODEL||"llama-3.3-70b-versatile",temperature:0.1,response_format:{type:"json_object"},messages:[{role:"system",content:SYSTEM+"\nBUSINESS: "+profile.business_name+"\nSERVICE: "+profile.core_service+"\nTARGET: "+profile.target_service+"\nBUDGET: "+profile.minimum_budget+"\nTIMELINE: "+profile.timeline_window+"\nAPPROVED FAQS: "+profile.approved_faqs+"\nTIMEZONE: "+profile.timezone},{role:"user",content:(history||[]).reverse().map((m:any)=>m.direction+": "+m.content).join("\n")}]}) ,signal:AbortSignal.timeout(15000)});
    if(resp.ok){const j=await resp.json();generated=JSON.parse(j.choices?.[0]?.message?.content||"{}");}
   }catch{}
  }
  const local=fallback(text,profile,old);
  const nextState=mergeState(old,generated?.metadata||local.metadata);
  if(local.forced==="HANDOFF_NEEDED"){
   const reply=local.reply_text;await supabase.from("conversations").update({status:"HANDOFF_NEEDED",state:nextState,last_message_at:new Date().toISOString()}).eq("id",conversation.id);
   await supabase.from("conversation_messages").insert({workspace_id:member.workspace_id,conversation_id:conversation.id,direction:"outbound",content:reply,metadata:{status:"HANDOFF_NEEDED"}});
   return NextResponse.json({conversation_id:conversation.id,reply_text:reply,status:"HANDOFF_NEEDED",state:nextState,mode:generated?"groq":"rules"});
  }
  const status=enforce(nextState);let reply=clean(generated?.reply_text,500)||local.reply_text;
  if(status==="QUALIFIED")reply=profile.calendar_booking_url?"You look like a fit. Choose a time here: "+profile.calendar_booking_url:"You look like a fit. The team will share the booking link shortly.";
  if(status==="DISQUALIFIED")reply=local.reply_text;
  await supabase.from("conversations").update({status,state:nextState,last_message_at:new Date().toISOString()}).eq("id",conversation.id);
  const {error:oe}=await supabase.from("conversation_messages").insert({workspace_id:member.workspace_id,conversation_id:conversation.id,direction:"outbound",content:reply,metadata:{status,mode:generated?"groq":"rules"}});if(oe)throw oe;
  return NextResponse.json({conversation_id:conversation.id,reply_text:reply,status,state:nextState,mode:generated?"groq":"rules",booking_url:status==="QUALIFIED"?profile.calendar_booking_url||null:null,notice:generated?"AI-assisted; qualification is independently enforced by server rules.":"Rules fallback active. Configure GROQ_API_KEY for conversational AI."});
 }catch(e:any){return NextResponse.json({error:e.message||"Assistant temporarily unavailable."},{status:500});}
}
