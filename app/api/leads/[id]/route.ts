import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
const allowed=["new","qualified","nurture","disqualified","contacted","won","lost"];
export async function PATCH(request:Request,{params}:{params:{id:string}}){
 try{const supabase=await createClient();const {data:{user},error:a}=await supabase.auth.getUser();if(a||!user)return NextResponse.json({error:"Unauthorized"},{status:401});const b=await request.json();const patch:any={};
 if(typeof b.status==="string"&&allowed.includes(b.status))patch.status=b.status;
 if(typeof b.notes==="string")patch.notes=b.notes.slice(0,5000);
 if(typeof b.score==="number"&&Number.isInteger(b.score)&&b.score>=0&&b.score<=100)patch.score=b.score;
 if(!Object.keys(patch).length)return NextResponse.json({error:"No valid fields supplied."},{status:400});
 const {data,error}=await supabase.from("leads").update(patch).eq("id",params.id).select("*").single();if(error)throw error;return NextResponse.json({lead:data});
 }catch(e:any){return NextResponse.json({error:e.message||"Could not update lead"},{status:500});}
}
export async function DELETE(_request:Request,{params}:{params:{id:string}}){
 try{const supabase=await createClient();const {data:{user},error:a}=await supabase.auth.getUser();if(a||!user)return NextResponse.json({error:"Unauthorized"},{status:401});const {error}=await supabase.from("leads").delete().eq("id",params.id);if(error)throw error;return NextResponse.json({ok:true});}
 catch(e:any){return NextResponse.json({error:e.message||"Could not delete lead"},{status:500});}
}