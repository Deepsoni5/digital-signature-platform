"use client"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X, Rocket, ShieldCheck, CheckCircle2, Crown, Gem, Zap, Sparkles, ArrowUpCircle, LayoutDashboard } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect, useCallback } from "react"
import { cn } from "@/lib/utils"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
  useUser,
} from '@clerk/nextjs'
import { supabase } from "@/lib/supabase"
import { toast } from "sonner"

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isPremium, setIsPremium] = useState(false)
  const [planName, setPlanName] = useState("Free")
  const [docLimit, setDocLimit] = useState(0)
  const [docCount, setDocCount] = useState(0)
  const { user } = useUser()

  const fetchData = useCallback(async () => {
    if (!user || !supabase) return
    try {
      const { data: userData } = await supabase
        .from("users")
        .select("id, is_premium, plan_name, document_limit")
        .eq("clerk_id", user.id)
        .single()

      if (userData) {
        setIsPremium(userData.is_premium)
        setPlanName(userData.plan_name || "Free")
        setDocLimit(userData.document_limit || 0)

        const { count } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userData.id)

        setDocCount(count || 0)
      }
    } catch (e) {
      console.error("Dashboard check skipped: Supabase not reachable.")
    }
  }, [user])

  useEffect(() => {
    setMounted(true)
    fetchData()
  }, [fetchData])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
    { name: "Pricing", href: "/pricing" },
    { name: "Dashboard", href: "/dashboard" },
    { name: "e-Sign", href: "/esign" },
  ]

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="relative h-16 w-56 shrink-0">
          <Link href="/" className="absolute left-0 top-1/2 -translate-y-1/2 z-10 transition-all hover:scale-105 active:scale-95">
            <img
              src="/e_logo.png"
              alt="ESignVia Logo"
              className="h-28 w-auto object-contain drop-shadow-sm"
            />
          </Link>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navLinks.map((link) => {
            if (link.href === "/dashboard") {
              return (
                <SignedIn key={link.href}>
                  <Link
                    href={link.href}
                    onClick={(e) => {
                      if (planName === "Free" || planName === "free") {
                        e.preventDefault();
                        toast.error("Upgrade Required", {
                          description: "The Dashboard is a premium feature. Please upgrade to any paid plan to access it.",
                        });
                        router.push("/pricing");
                      }
                    }}
                    className={cn(
                      "text-sm font-medium transition-colors hover:text-primary",
                      pathname === link.href ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {link.name}
                  </Link>
                </SignedIn>
              )
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === link.href ? "text-primary" : "text-muted-foreground"
                )}
              >
                {link.name}
              </Link>
            )
          })}
          <div className="flex items-center gap-4">
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="rounded-full"
              >
                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
              </Button>
            )}
            <div className="flex items-center gap-4">
              <SignedOut>
                <Button variant="ghost" className="rounded-full" asChild>
                  <Link href="/sign-in">Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <UserButton
                  appearance={{
                    elements: {
                      userButtonAvatarBox: "h-9 w-9",
                      userButtonPopoverFooter: { display: "none" }
                    }
                  }}
                >
                  <UserButton.MenuItems>
                    <UserButton.Action
                      label={
                        planName === "Elite"
                          ? "Elite Plan • Renews yearly automatically"
                          : planName === "Pro"
                          ? "Pro Plan • Renews monthly automatically"
                          : planName === "Basic"
                          ? "Basic Plan • One-time payment"
                          : `${planName} Plan`
                      }
                      labelIcon={
                        planName === "Elite" ? <Crown className="h-4 w-4 text-amber-500" /> :
                          planName === "Pro" ? <Gem className="h-4 w-4 text-indigo-500" /> :
                            planName === "Basic" ? <Zap className="h-4 w-4 text-emerald-500" /> :
                              <Rocket className="h-4 w-4 text-slate-500" />
                      }
                      onClick={() => { }}
                    />
                    <UserButton.Action
                      label={(planName === "Pro" || planName === "Elite") ? "Unlimited Signs" : `${docLimit} Signs Left`}
                      labelIcon={<CheckCircle2 className={cn("h-4 w-4", (planName === "Pro" || planName === "Elite") ? "text-emerald-500" : (docLimit > 0 ? "text-blue-500" : "text-rose-500"))} />}
                      onClick={() => { }}
                    />
                    <UserButton.Action
                      label="My Dashboard"
                      labelIcon={<LayoutDashboard className="h-4 w-4 text-indigo-600" />}
                      onClick={() => {
                        if (planName === "Free") {
                          toast.error("Upgrade Required", {
                            description: "Please upgrade to a paid plan to view your document history.",
                          });
                          router.push("/pricing");
                        } else {
                          router.push("/dashboard");
                        }
                      }}
                    />
                    <UserButton.Action
                      label="Upgrade Plan"
                      labelIcon={<ArrowUpCircle className="h-4 w-4 text-indigo-600" />}
                      onClick={() => router.push("/pricing")}
                    />
                  </UserButton.MenuItems>
                </UserButton>
              </SignedIn>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/esign">Start Signing</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="rounded-full"
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </Button>
          )}

          <SignedIn>
            <div className="mr-1 mt-1">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-8 w-8",
                    userButtonPopoverFooter: { display: "none" }
                  }
                }}
              >
                <UserButton.MenuItems>
                  <UserButton.Action
                    label={
                      planName === "Elite"
                        ? "Elite Plan • Renews yearly automatically"
                        : planName === "Pro"
                        ? "Pro Plan • Renews monthly automatically"
                        : planName === "Basic"
                        ? "Basic Plan • One-time payment"
                        : `${planName} Plan`
                    }
                    labelIcon={
                      planName === "Elite" ? <Crown className="h-4 w-4 text-amber-500" /> :
                        planName === "Pro" ? <Gem className="h-4 w-4 text-indigo-500" /> :
                          planName === "Basic" ? <Zap className="h-4 w-4 text-emerald-500" /> :
                            <Rocket className="h-4 w-4 text-slate-500" />
                    }
                    onClick={() => { }}
                  />
                  <UserButton.Action
                    label={(planName === "Pro" || planName === "Elite") ? "Unlimited Signs" : `${docLimit} Signs Left`}
                    labelIcon={<CheckCircle2 className={cn("h-4 w-4", (planName === "Pro" || planName === "Elite") ? "text-emerald-500" : (docLimit > 0 ? "text-blue-500" : "text-rose-500"))} />}
                    onClick={() => { }}
                  />
                  <UserButton.Action
                    label="My Dashboard"
                    labelIcon={<LayoutDashboard className="h-4 w-4 text-indigo-600" />}
                    onClick={() => {
                      setIsMenuOpen(false);
                      if (planName === "Free") {
                        toast.error("Upgrade Required", {
                          description: "Please upgrade to a paid plan to view your document history.",
                        });
                        router.push("/pricing");
                      } else {
                        router.push("/dashboard");
                      }
                    }}
                  />
                  <UserButton.Action
                    label="Upgrade Plan"
                    labelIcon={<ArrowUpCircle className="h-4 w-4 text-indigo-600" />}
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/pricing");
                    }}
                  />
                </UserButton.MenuItems>
              </UserButton>
            </div>
          </SignedIn>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-full"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div className="border-b bg-background p-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => {
              if (link.href === "/dashboard") {
                return (
                  <SignedIn key={link.href}>
                    <Link
                      href={link.href}
                      onClick={(e) => {
                        setIsMenuOpen(false);
                        if (planName === "Free") {
                          e.preventDefault();
                          toast.error("Upgrade Required", {
                            description: "The Dashboard is a premium feature. Please upgrade to any paid plan to access it.",
                          });
                          router.push("/pricing");
                        }
                      }}
                      className={cn(
                        "text-base font-medium transition-colors hover:text-primary",
                        pathname === link.href ? "text-primary" : "text-muted-foreground"
                      )}
                    >
                      {link.name}
                    </Link>
                  </SignedIn>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "text-base font-medium transition-colors hover:text-primary",
                    pathname === link.href ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {link.name}
                </Link>
              )
            })}
            <div className="flex flex-col gap-3 py-2 border-t mt-2">
              <SignedOut>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">Account</span>
                  <UserButton
                    appearance={{
                      elements: {
                        footer: { display: "none" },
                        userButtonPopoverFooter: { display: "none" }
                      }
                    }}
                  >
                    <UserButton.MenuItems>
                      <UserButton.Action
                        label={
                          planName === "Elite"
                            ? "Elite Plan • Renews yearly automatically"
                            : planName === "Pro"
                            ? "Pro Plan • Renews monthly automatically"
                            : planName === "Basic"
                            ? "Basic Plan • One-time payment"
                            : `${planName} Plan`
                        }
                        labelIcon={
                          planName === "Elite" ? <Crown className="h-4 w-4 text-amber-500" /> :
                            planName === "Pro" ? <Gem className="h-4 w-4 text-indigo-500" /> :
                              planName === "Basic" ? <Zap className="h-4 w-4 text-emerald-500" /> :
                                <Rocket className="h-4 w-4 text-slate-500" />
                        }
                        onClick={() => { }}
                      />
                      <UserButton.Action
                        label={(planName === "Pro" || planName === "Elite") ? "Unlimited Signs" : `${docLimit} Signs Left`}
                        labelIcon={<CheckCircle2 className={cn("h-4 w-4", (planName === "Pro" || planName === "Elite") ? "text-emerald-500" : (docLimit > 0 ? "text-blue-500" : "text-rose-500"))} />}
                        onClick={() => { }}
                      />
                      <UserButton.Action
                        label="My Dashboard"
                        labelIcon={<LayoutDashboard className="h-4 w-4 text-indigo-600" />}
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (planName === "Free") {
                            toast.error("Upgrade Required", {
                              description: "Please upgrade to a paid plan to view your document history.",
                            });
                            router.push("/pricing");
                          } else {
                            router.push("/dashboard");
                          }
                        }}
                      />
                      <UserButton.Action
                        label="Upgrade Plan"
                        labelIcon={<ArrowUpCircle className="h-4 w-4 text-indigo-600" />}
                        onClick={() => {
                          setIsMenuOpen(false);
                          router.push("/pricing");
                        }}
                      />
                    </UserButton.MenuItems>
                  </UserButton>
                </div>
              </SignedIn>
            </div>
            <Button asChild className="w-full rounded-full">
              <Link href="/esign" onClick={() => setIsMenuOpen(false)}>
                Start Signing
              </Link>
            </Button>
          </div>
        </div>
      )}
    </nav>
  )
}
