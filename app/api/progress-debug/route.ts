import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase/server";

export async function GET() {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({}, { status: 404 });
  }
  const supabase = getSupabaseServer();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ cloudHasFixedIncome: false });
  const { data } = await supabase.from("user_progress").select("completion").eq("user_id", user.id).single();
  const completion = (data?.completion ?? {}) as Record<string, Record<string, boolean>>;
  const m3 = completion["ops-m3-completion-v1"] ?? {};
  return NextResponse.json({
    cloudHasFixedIncome: Boolean(m3["fixed-income-bond-markets-cash-flows-discount-bonds"]),
  });
}
