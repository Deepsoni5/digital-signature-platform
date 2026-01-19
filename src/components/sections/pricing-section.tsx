"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type PlanKey = "free" | "basic" | "pro" | "elite";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

async function loadRazorpayScript() {
  if (typeof window === "undefined") return false;
  if (window.Razorpay) return true;

  return new Promise<boolean>((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function PricingSection() {
  const router = useRouter();
  const { user } = useUser();
  const [loadingPlan, setLoadingPlan] = useState<PlanKey | null>(null);

  const handlePlanClick = async (planKey: PlanKey) => {
    if (planKey === "free") {
      if (!user) {
        toast.info("Sign up to get started", {
          description:
            "Create a free account to access the e-signature editor and explore our platform.",
        });
        router.push("/sign-up");
      } else {
        router.push("/esign");
      }
      return;
    }

    if (!user) {
      toast.error("Authentication Required", {
        description:
          "Please sign up or log in to purchase a plan and unlock premium features.",
      });
      router.push("/sign-up");
      return;
    }

    try {
      setLoadingPlan(planKey);

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded || !window.Razorpay) {
        toast.error("Payment unavailable", {
          description: "Razorpay SDK failed to load. Please try again.",
        });
        return;
      }

      const response = await fetch("/api/razorpay/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          plan: planKey,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => null);
        toast.error("Unable to start payment", {
          description: data?.error || "Please try again later.",
        });
        return;
      }

      const data = await response.json();

      const options: any = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency || "INR",
        name: "ESignVia",
        description:
          planKey === "basic"
            ? "Basic Plan (one-time)"
            : planKey === "pro"
              ? "Pro Plan (monthly subscription)"
              : "Elite Plan (yearly subscription)",
        prefill: {
          name: data.customer?.name || user.fullName || undefined,
          email:
            data.customer?.email ||
            user.primaryEmailAddress?.emailAddress ||
            undefined,

        },
        notes: {
          plan: planKey,
        },
        theme: {
          color: "#4f46e5",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                plan: planKey,
                ...response,
              }),
            });

            if (!verifyRes.ok) {
              const verifyData = await verifyRes.json().catch(() => null);
              toast.error("Payment verification failed", {
                description:
                  verifyData?.error ||
                  "Please contact support if you were charged.",
              });
              return;
            }

            toast.success("Plan activated successfully", {
              description:
                planKey === "basic"
                  ? "Your Basic plan is now active."
                  : planKey === "pro"
                    ? "Your Pro subscription is now active."
                    : "Your Elite subscription is now active.",
            });

            if (planKey === "basic") {
              router.push("/");
            } else {
              router.push("/dashboard");
            }
          } catch (err) {
            toast.error("Something went wrong", {
              description: "Please contact support if you were charged.",
            });
          }
        },
      };

      if (planKey === "basic" && data.orderId) {
        options.order_id = data.orderId;
      }

      if ((planKey === "pro" || planKey === "elite") && data.subscriptionId) {
        options.subscription_id = data.subscriptionId;
      }

      const rz = new window.Razorpay(options);
      rz.open();
    } catch (error) {
      toast.error("Payment failed", {
        description: "Please try again in a few moments.",
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  return (
    <section
      id="pricing"
      className="py-24 relative overflow-hidden bg-white dark:bg-slate-950"
    >
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-500/5 rounded-full blur-[100px] -z-10" />
      <div className="container mx-auto px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="text-center mb-16">
            <h2 className="text-sm font-bold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 mb-4 items-center justify-center flex gap-2">
              <Rocket className="h-4 w-4" /> Simple Pricing
            </h2>
            <h3 className="text-4xl font-extrabold tracking-tight sm:text-6xl text-slate-900 dark:text-white">
              Pick the plan that <br />
              <span className="text-indigo-600 dark:text-indigo-400">
                works for you.
              </span>
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                key: "free" as PlanKey,
                name: "Free",
                price: "0",
                period: "",
                desc: "Explore the interface",
                features: [
                  "View-only access",
                  "Account Setup",
                  "Email Support",
                ],
                button: "Get Started",
                highlight: false,
              },
              {
                key: "basic" as PlanKey,
                name: "Basic",
                price: "99",
                period: "one-time",
                desc: "Perfect for single use",
                features: [
                  "1 Signed Document",
                  "Standard Support",
                  "Basic Editor Tools",
                  "History Access",
                ],
                button: "Buy Now",
                highlight: false,
              },
              {
                key: "pro" as PlanKey,
                name: "Pro",
                price: "999",
                originalPrice: "1,199",
                period: "/ month",
                desc: "Our most popular choice",
                features: [
                  "Unlimited Documents",
                  "Priority 24/7 Support",
                  "Advanced Editor",
                  "Dashboard View",
                  "Premium Storage",
                  "History Access",
                ],
                button: "Go Pro",
                highlight: true,
              },
              {
                key: "elite" as PlanKey,
                name: "Elite",
                price: "9,999",
                originalPrice: "12,999",
                period: "/ year",
                desc: "Best for heavy users",
                features: [
                  "Unlimited Documents",
                  "Priority 24/7 Support",
                  "Early Beta Access",
                  "Yearly Savings",
                  "Dashboard View",
                  "History Access",
                ],
                button: "Join Elite",
                highlight: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={cn(
                  "relative flex flex-col p-8 rounded-[2.5rem] border transition-all duration-500 hover:scale-[1.02]",
                  plan.highlight
                    ? "bg-slate-900 dark:bg-slate-900/40 text-white border-indigo-500 shadow-2xl shadow-indigo-500/20"
                    : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:border-indigo-500/50"
                )}
              >
                {plan.highlight && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-indigo-600 to-violet-600 rounded-full text-xs font-bold uppercase tracking-widest text-white whitespace-nowrap shadow-lg">
                    Recommended
                  </div>
                )}
                <div className="mb-8">
                  <h4
                    className={cn(
                      "text-xl font-bold mb-2",
                      plan.highlight ? "text-indigo-400" : "text-indigo-600"
                    )}
                  >
                    {plan.name}
                  </h4>
                  <p
                    className={cn(
                      "text-sm",
                      plan.highlight ? "text-slate-400" : "text-slate-500"
                    )}
                  >
                    {plan.desc}
                  </p>
                </div>

                <div className="mb-8 font-sans">
                  {plan.originalPrice && (
                    <div className="flex items-center gap-3 mb-1">
                      <span
                        className={cn(
                          "text-base font-medium line-through decoration-rose-500/50 decoration-2",
                          plan.highlight ? "text-slate-500" : "text-slate-400"
                        )}
                      >
                        ₹{plan.originalPrice}
                      </span>
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider shadow-sm",
                          plan.highlight
                            ? "bg-indigo-500/20 text-indigo-300 border border-indigo-500/30"
                            : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        )}
                      >
                        {Math.round(
                          (1 -
                            parseInt(plan.price.replace(/,/g, "")) /
                            parseInt(
                              (plan.originalPrice || "1").replace(/,/g, "")
                            )) *
                          100
                        )}
                        % OFF
                      </span>
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold opacity-80">₹</span>
                    <span className="text-6xl font-black tracking-tighter">
                      {plan.price}
                    </span>
                    <span
                      className={cn(
                        "text-sm font-medium ml-1 opacity-70",
                        plan.highlight ? "text-slate-400" : "text-slate-500"
                      )}
                    >
                      {plan.period}
                    </span>
                  </div>
                </div>

                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3 text-sm">
                      <CheckCircle2
                        className={cn(
                          "h-5 w-5 shrink-0 mt-0.5",
                          plan.highlight
                            ? "text-emerald-400"
                            : "text-indigo-600"
                        )}
                      />
                      <span
                        className={
                          plan.highlight
                            ? "text-slate-300"
                            : "text-slate-600 dark:text-slate-400"
                        }
                      >
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={cn(
                    "w-full h-14 rounded-2xl font-bold transition-all",
                    plan.highlight
                      ? "bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-500/30"
                      : "bg-slate-100 dark:bg-slate-800 hover:bg-indigo-600 hover:text-white text-slate-900 dark:text-white"
                  )}
                  disabled={loadingPlan === plan.key}
                  onClick={() => handlePlanClick(plan.key)}
                >
                  {loadingPlan === plan.key ? "Processing..." : plan.button}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
