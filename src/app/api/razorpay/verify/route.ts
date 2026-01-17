import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@clerk/nextjs/server"
import { supabase } from "@/lib/supabase"

type PlanType = "basic" | "pro" | "elite"

function verifySignature({
  signature,
  payload,
  secret,
}: {
  signature: string
  payload: string
  secret: string
}) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(payload)
    .digest("hex")
  return expected === signature
}

export async function POST(req: NextRequest) {
  try {
    const { userId: clerkId } = await auth()

    if (!clerkId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await req.json()

    const plan: PlanType = body?.plan
    const paymentId: string | undefined = body?.razorpay_payment_id
    const orderId: string | undefined = body?.razorpay_order_id
    const subscriptionId: string | undefined = body?.razorpay_subscription_id
    const signature: string | undefined = body?.razorpay_signature

    if (!plan || !["basic", "pro", "elite"].includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 })
    }

    const secret = process.env.RAZORPAY_KEY_SECRET
    if (!secret) {
      return NextResponse.json(
        { error: "Razorpay secret not configured" },
        { status: 500 },
      )
    }

    if (!paymentId || !signature) {
      return NextResponse.json(
        { error: "Missing Razorpay payment details" },
        { status: 400 },
      )
    }

    let payload: string | null = null

    if (plan === "basic") {
      if (!orderId) {
        return NextResponse.json(
          { error: "Order id required for basic plan" },
          { status: 400 },
        )
      }
      payload = `${orderId}|${paymentId}`
    } else {
      if (!subscriptionId) {
        return NextResponse.json(
          { error: "Subscription id required for recurring plans" },
          { status: 400 },
        )
      }
      payload = `${subscriptionId}|${paymentId}`
    }

    if (!verifySignature({ signature, payload, secret })) {
      return NextResponse.json(
        { error: "Invalid Razorpay signature" },
        { status: 400 },
      )
    }

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("clerk_id", clerkId)
      .single()

    if (userError || !userData) {
      return NextResponse.json({ error: "User not found in database" }, { status: 404 })
    }

    let documentLimit = 0
    let planName = ""
    let planExpiresAt: string | null = null

    if (plan === "basic") {
      planName = "Basic"
      documentLimit = 1
      planExpiresAt = null
    } else if (plan === "pro") {
      planName = "Pro"
      documentLimit = 99999
      const expiry = new Date()
      expiry.setMonth(expiry.getMonth() + 1)
      planExpiresAt = expiry.toISOString()
    } else {
      planName = "Elite"
      documentLimit = 99999
      const expiry = new Date()
      expiry.setFullYear(expiry.getFullYear() + 1)
      planExpiresAt = expiry.toISOString()
    }

    const { error: updateError } = await supabase
      .from("users")
      .update({
        is_premium: true,
        plan_name: planName,
        document_limit: documentLimit,
        plan_expires_at: planExpiresAt,
        updated_at: new Date().toISOString(),
      })
      .eq("clerk_id", clerkId)

    if (updateError) {
      console.error("Failed to update user after payment:", updateError)
      return NextResponse.json(
        { error: "Payment verified but failed to update user" },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error("Razorpay verify error:", error)
    return NextResponse.json(
      { error: "Failed to verify payment" },
      { status: 500 },
    )
  }
}

