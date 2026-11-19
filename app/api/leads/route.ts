import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
export async function GET(request:Request){
 try{const supabase=await createClient();const {data:{user},error:a}=await supabase.auth.getUser();if(a||!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:membership,error:m}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1).maybeSingle();if(m)throw m;if(!membership)return NextResponse.json({leads:[],workspace:null});
 const url=new URL(request.url);const search=url.searchParams.get("q")?.slice(0,100);const status=url.searchParams.get("status");
 let q=supabase.from("leads").select("*").eq("workspace_id",membership.workspace_id).order("created_at",{ascending:false}).limit(100);
 if(search)q=q.or(`full_name.ilike.%${search.replace(/[%_]/g,"") }%,company.ilike.%${search.replace(/[%_]/g,"")}%,email.ilike.%${search.replace(/[%_]/g,"")}%`);
 if(status&&["new","qualified","nurture","disqualified","contacted","won","lost"].includes(status))q=q.eq("status",status);
 const {data,error}=await q;if(error)throw error;return NextResponse.json({leads:data,workspace:membership.workspace_id});
 }catch(e:any){return NextResponse.json({error:e.message||"Could not load leads"},{status:500});}
}
export async function POST(request:Request){
 try{const supabase=await createClient();const {data:{user},error:a}=await supabase.auth.getUser();if(a||!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data:membership,error:m}=await supabase.from("workspace_members").select("workspace_id").eq("user_id",user.id).limit(1).maybeSingle();if(m)throw m;if(!membership)return NextResponse.json({error:"Create a workspace before adding leads."},{status:409});
 const b=await request.json();const full_name=typeof b.full_name==="string"?b.full_name.trim():"";const email=typeof b.email==="string"?b.email.trim().toLowerCase():"";
 if(full_name.length<1||full_name.length>120||email.length>254||!/^\S+@\S+\.\S+$/.test(email))return NextResponse.json({error:"Enter a valid name and email address."},{status:400});
 const {data,error}=await supabase.from("leads").insert({workspace_id:membership.workspace_id,created_by:user.id,full_name,email,company:String(b.company||"").slice(0,160),phone:String(b.phone||"").slice(0,40),source:String(b.source||"manual").slice(0,80),status:"new",budget:String(b.budget||"").slice(0,160),need:String(b.need||"").slice(0,1000),notes:String(b.notes||"").slice(0,5000)}).select("*").single();if(error)throw error;return NextResponse.json({lead:data},{status:201});
 }catch(e:any){return NextResponse.json({error:e.message||"Could not create lead"},{status:500});}
}