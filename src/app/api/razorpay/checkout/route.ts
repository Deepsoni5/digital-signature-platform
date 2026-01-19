import Razorpay from "razorpay";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

type PlanType = "basic" | "pro" | "elite";

function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error("Razorpay environment variables are missing");
  }

  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const plan: PlanType = body?.plan;

    if (!plan || !["basic", "pro", "elite"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase not configured" },
        { status: 500 }
      );
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id, email, full_name")
      .eq("clerk_id", clerkId)
      .single();

    if (userError || !userData) {
      return NextResponse.json(
        { error: "User not found in database" },
        { status: 404 }
      );
    }

    const razorpay = getRazorpayClient();

    if (plan === "basic") {
      const amount = 99 * 100;

      const order = await razorpay.orders.create({
        amount,
        currency: "INR",
        receipt: `b_${userData.id.substring(0, 8)}_${Date.now()}`,
        notes: {
          clerk_id: clerkId,
          user_id: userData.id,
          plan_name: "Basic",
          billing_type: "one_time",
        },
      });

      return NextResponse.json({
        keyId: process.env.RAZORPAY_KEY_ID,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        plan: "basic",
        customer: {
          name: userData.full_name,
          email: userData.email,
        },
      });
    }

    const isPro = plan === "pro";
    const planId = isPro
      ? process.env.RAZORPAY_PRO_PLAN_ID
      : process.env.RAZORPAY_ELITE_PLAN_ID;

    if (!planId) {
      return NextResponse.json(
        { error: `Razorpay plan id missing for ${plan} plan` },
        { status: 500 }
      );
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: isPro ? 120 : 10,
      notes: {
        clerk_id: clerkId,
        user_id: userData.id,
        plan_name: isPro ? "Pro" : "Elite",
        billing_type: isPro ? "monthly" : "yearly",
      },
    });

    return NextResponse.json({
      keyId: process.env.RAZORPAY_KEY_ID,
      subscriptionId: subscription.id,
      plan,
      customer: {
        name: userData.full_name,
        email: userData.email,
      },
    });
  } catch (error: any) {
    console.error("Razorpay checkout error:", error);
    return NextResponse.json(
      { error: "Failed to initiate payment" },
      { status: 500 }
    );
  }
}
