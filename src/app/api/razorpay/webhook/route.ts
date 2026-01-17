import crypto from "crypto"
import { NextRequest, NextResponse } from "next/server"
import { supabase } from "@/lib/supabase"

function verifyWebhookSignature(rawBody: string, signature: string, secret: string) {
  const expected = crypto
    .createHmac("sha256", secret)
    .update(rawBody)
    .digest("hex")
  return expected === signature
}

export const config = {
  api: {
    bodyParser: false,
  },
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text()
    const signature = req.headers.get("x-razorpay-signature")
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET

    if (!signature || !secret) {
      return NextResponse.json({ error: "Webhook verification not configured" }, { status: 500 })
    }

    if (!verifyWebhookSignature(rawBody, signature, secret)) {
      return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 })
    }

    const event = JSON.parse(rawBody)
    const eventType: string | undefined = event?.event

    if (!supabase) {
      return NextResponse.json({ error: "Supabase not configured" }, { status: 500 })
    }

    if (eventType === "subscription.charged") {
      const subscription = event?.payload?.subscription?.entity
      const notes = subscription?.notes

      if (notes?.clerk_id) {
        const clerkId: string = notes.clerk_id
        const billingType: string | undefined = notes.billing_type

        const now = new Date()
        if (billingType === "monthly") {
          now.setMonth(now.getMonth() + 1)
        } else if (billingType === "yearly") {
          now.setFullYear(now.getFullYear() + 1)
        }

        await supabase
          .from("users")
          .update({
            is_premium: true,
            document_limit: 99999,
            plan_expires_at: now.toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq("clerk_id", clerkId)
      }
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error("Razorpay webhook error:", error)
    return NextResponse.json(
      { error: "Failed to process webhook" },
      { status: 500 },
    )
  }
}

