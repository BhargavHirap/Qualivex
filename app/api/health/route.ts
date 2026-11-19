import { NextResponse } from "next/server";
export async function GET(){
 const configured=Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
 return NextResponse.json({service:"Qualivex API",status:"operational",version:"0.2.0",databaseConfigured:configured,aiProvider:process.env.OPENAI_API_KEY?"openai": "rules-only",timestamp:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}});
}