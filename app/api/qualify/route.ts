import { NextResponse } from "next/server";
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = typeof body.message === "string" ? body.message.trim().slice(0, 5000) : "";
    if (!message) return NextResponse.json({ error: "Please provide a lead message." }, { status: 400 });
    const text = message.toLowerCase();
    const signals: string[] = [];
    let score = 25;
    const checks: [RegExp, number, string][] = [
      [/\b(budget|₹|inr|\$|\busd\b|\bspend)\b/, 18, "Budget mentioned"],
      [/\b(need|looking for|want|seeking|interested|help us|require)\b/, 15, "Clear need"],
      [/\b(urgent|asap|this week|immediately|soon|deadline)\b/, 14, "Time-sensitive"],
      [/\b(founder|owner|ceo|director|head of|decision maker)\b/, 12, "Decision-maker signal"],
      [/\b(appointment|meeting|call|demo|consultation)\b/, 12, "Meeting intent"],
      [/\b(agency|business|company|team|enterprise|startup)\b/, 8, "Business context"]
    ];
    for (const [pattern, points, label] of checks) if (pattern.test(text)) { score += points; signals.push(label); }
    score = Math.min(score, 98);
    const status = score >= 70 ? "Qualified" : score >= 45 ? "Nurture" : "Needs review";
    const recommendation = score >= 70 ? "Book a discovery call" : score >= 45 ? "Ask 1–2 follow-up questions" : "Request more context";
    const summary = score >= 70
      ? "This enquiry shows strong buying signals. Confirm the prospect's goals, timeline and decision process, then offer a meeting."
      : score >= 45
      ? "There is some intent, but key qualification details are missing. Follow up to understand budget, urgency and who owns the decision."
      : "The enquiry has limited buying context. Ask what outcome they want and whether they have a budget or timeline in mind.";
    return NextResponse.json({ score, status, recommendation, summary, signals, mode: "rules-preview" });
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }
}