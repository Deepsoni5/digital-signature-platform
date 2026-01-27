import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "admin@esignvia.com";

export async function GET(req: NextRequest) {
  try {
    // Auth Check (Similar to layout)
    const user = await currentUser();
    const isClerkAdmin = user?.emailAddresses[0]?.emailAddress === ADMIN_EMAIL;
    
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("admin_session");
    let isCustomAdmin = false;

    if (adminSession?.value) {
        const { data: { user: supabaseUser } } = await supabase.auth.getUser(adminSession.value);
        if (supabaseUser && supabaseUser.email === ADMIN_EMAIL) {
            isCustomAdmin = true;
        }
    }

    if (!isClerkAdmin && !isCustomAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 });
    }

    // Parallel fetch for stats
    const [
      { count: totalUsers },
      { count: totalDocuments },
      { count: proUsers },
      { count: eliteUsers },
      { count: basicUsers },
      { count: totalMessages },
      { count: pendingMessages },
      { data: recentActivity },
      { data: recentDocuments }
    ] = await Promise.all([
      supabase.from("users").select("*", { count: "exact", head: true }),
      supabase.from("documents").select("*", { count: "exact", head: true }),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Pro"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Elite"),
      supabase.from("users").select("*", { count: "exact", head: true }).eq("plan_name", "Basic"),
      supabase.from("contact_submissions").select("*", { count: "exact", head: true }),
      supabase.from("contact_submissions").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("document_audit_logs").select("*").order("created_at", { ascending: false }).limit(5),
      supabase.from("documents").select("*, users(full_name, email)").order("created_at", { ascending: false }).limit(5)
    ]);

    return NextResponse.json({
      totalUsers: totalUsers || 0,
      totalDocuments: totalDocuments || 0,
      totalMessages: totalMessages || 0,
      pendingMessages: pendingMessages || 0,
      plans: {
        pro: proUsers || 0,
        elite: eliteUsers || 0,
        basic: basicUsers || 0,
        free: (totalUsers || 0) - ((proUsers || 0) + (eliteUsers || 0) + (basicUsers || 0))
      },
      recentActivity: recentActivity || [],
      recentDocuments: recentDocuments || []
    });

  } catch (error) {
    console.error("Admin stats error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
