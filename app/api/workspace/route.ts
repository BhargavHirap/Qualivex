import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
function slugify(value:string){return value.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"").slice(0,50)||"workspace";}
export async function GET(){
 try{const supabase=await createClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const {data,error}=await supabase.from("workspace_members").select("role,workspace:workspaces(id,name,slug,created_at)").eq("user_id",user.id).limit(1).maybeSingle();if(error)throw error;return NextResponse.json({workspace:data?.workspace??null,role:data?.role??null});}
 catch(e:any){return NextResponse.json({error:e.message||"Workspace service unavailable"},{status:500});}
}
export async function POST(request:Request){
 try{const supabase=await createClient();const {data:{user},error:authError}=await supabase.auth.getUser();if(authError||!user)return NextResponse.json({error:"Unauthorized"},{status:401});
 const body=await request.json();const name=typeof body.name==="string"?body.name.trim():"";if(name.length<2||name.length>80)return NextResponse.json({error:"Workspace name must be 2–80 characters."},{status:400});
 const slug=slugify(name)+"-"+user.id.slice(0,6);const {data:workspace,error}=await supabase.rpc("create_workspace",{workspace_name:name,workspace_slug:slug}).single();if(error)throw error;
 return NextResponse.json({workspace,role:"owner"},{status:201});
 }catch(e:any){return NextResponse.json({error:e.message||"Could not create workspace"},{status:500});}
}