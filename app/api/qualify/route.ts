import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
const SYSTEM_PROMPT = `You are Qualivex, a cautious B2B sales qualification analyst. Evaluate only evidence in the enquiry. Never invent budget, authority, need, or timeline. Do not make decisions about protected traits. Return ONLY valid JSON with keys score (integer 0-100), status (qualified|nurture|new), signals (array of short evidence-based strings), recommendation (one short next step), summary (2 sentences max). Score: explicit business need 0-25, budget/ability to pay 0-20, decision authority 0-20, urgency/timeline 0-15, fit and specificity 0-20. Missing information must not be assumed. A score >=70 is qualified, 40-69 nurture, below 40 new.`;
function rules(message:string){
 const t=message.toLowerCase(),signals:string[]=[];let score=15;
 const checks:[RegExp,number,string][]=[[/\b(budget|₹|inr|\$|usd|spend)\b/,18,"Budget mentioned"],[/\b(need|looking for|want|seeking|interested|require)\b/,15,"Clear need"],[/\b(urgent|asap|this week|immediately|soon|deadline)\b/,14,"Time-sensitive"],[/\b(founder|owner|ceo|director|decision maker)\b/,12,"Decision-maker signal"],[/\b(appointment|meeting|call|demo|consultation)\b/,12,"Meeting intent"],[/\b(agency|business|company|team|enterprise|startup)\b/,8,"Business context"]];
 for(const [p,n,label] of checks)if(p.test(t)){score+=n;signals.push(label);}score=Math.min(score,98);
 const status=score>=70?"qualified":score>=40?"nurture":"new";
 return {score,status,signals,recommendation:score>=70?"Offer a discovery call and validate decision process.":score>=40?"Ask about budget, timeline and decision authority.":"Request the desired outcome and business context.",summary:score>=70?"Strong buying signals are present. Validate fit and agree on a next step.":score>=40?"Some intent is present, but key details are missing. Ask targeted follow-up questions.":"There is not enough buying context to prioritise this enquiry yet."};
}
export async function POST(request:Request){
 try{
  const supabase=await createClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return NextResponse.json({error:"Sign in to qualify leads."},{status:401});
  const {data:membership,error:memberError}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1).maybeSingle();if(memberError)throw memberError;if(!membership)return NextResponse.json({error:"Create a workspace first."},{status:409});
  const {count,error:quotaError}=await supabase.from("qualification_events").select("id",{count:"exact",head:true}).eq("workspace_id",membership.workspace_id).gte("created_at",new Date(Date.now()-60*60*1000).toISOString());
  if(quotaError)throw quotaError;if((count??0)>=50)return NextResponse.json({error:"Workspace qualification limit reached for this hour. Try again later."},{status:429});
  const body=await request.json();const message=typeof body.message==="string"?body.message.trim().slice(0,5000):"";if(message.length<10)return NextResponse.json({error:"Enter at least 10 characters of enquiry context."},{status:400});
  let result=rules(message),model="rules-v1";
  if(process.env.OPENAI_API_KEY){
   const response=await fetch("https://api.openai.com/v1/chat/completions",{method:"POST",headers:{"Authorization":`Bearer ${process.env.OPENAI_API_KEY}`,"Content-Type":"application/json"},body:JSON.stringify({model:process.env.OPENAI_MODEL||"gpt-4.1-mini",temperature:0.1,response_format:{type:"json_object"},messages:[{role:"system",content:SYSTEM_PROMPT},{role:"user",content:message}]}) ,signal:AbortSignal.timeout(20000)});
   if(!response.ok)throw new Error("AI provider request failed. Check the server-side API key and model configuration.");
   const data=await response.json();const parsed=JSON.parse(data.choices?.[0]?.message?.content||"{}");
   const score=Math.max(0,Math.min(100,Math.round(Number(parsed.score))));if(!Number.isFinite(score))throw new Error("AI provider returned an invalid score.");
   const status=score>=70?"qualified":score>=40?"nurture":"new";
   result={score,status,signals:Array.isArray(parsed.signals)?parsed.signals.filter((x:any)=>typeof x==="string").slice(0,8):[],recommendation:String(parsed.recommendation||"Review this lead").slice(0,300),summary:String(parsed.summary||"Review the enquiry before contacting the prospect.").slice(0,500)};
   model=process.env.OPENAI_MODEL||"gpt-4.1-mini";
  }
  const {data:event,error}=await supabase.from("qualification_events").insert({workspace_id:membership.workspace_id,created_by:user.id,score:result.score,status:result.status,signals:result.signals,recommendation:result.recommendation,model}).select("id,score,status,signals,recommendation,created_at").single();if(error)throw error;
  return NextResponse.json({...event,summary:result.summary,mode:model==="rules-v1"?"rules":"llm",notice:model==="rules-v1"?"Rules-based assessment. Add OPENAI_API_KEY in Vercel to enable LLM reasoning.":"AI-generated assessment; review before taking action."});
 }catch(e:any){return NextResponse.json({error:e.message||"Qualification service unavailable"},{status:500});}
}