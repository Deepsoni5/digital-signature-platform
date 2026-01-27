import { NextRequest, NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";
import { cookies } from "next/headers";

const ADMIN_EMAIL = "admin@esignvia.com";

export async function GET(req: NextRequest) {
  try {
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

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const offset = (page - 1) * limit;

    let query = supabase
      .from("users")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (search) {
      query = query.or(`email.ilike.%${search}%,full_name.ilike.%${search}%`);
    }

    const { data, count, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      users: data, // Matching the expected key in the client component
      totalPages: Math.ceil((count || 0) / limit),
      total: count
    });
  } catch (error) {
    console.error("Users fetch error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
