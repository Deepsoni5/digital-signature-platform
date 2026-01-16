"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"
import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import {
  SignedIn,
  SignedOut,
  SignInButton,
  UserButton,
} from '@clerk/nextjs'

export function Navbar() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  useEffect(() => setMounted(true), [])

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Contact", href: "/contact" },
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
          {navLinks.map((link) => (
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
          ))}
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
                      userButtonAvatarBox: "h-9 w-9"
                    }
                  }}
                />
              </SignedIn>
            </div>
            <Button asChild className="rounded-full">
              <Link href="/esign">Start Signing</Link>
            </Button>
          </div>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="flex items-center gap-4 md:hidden">
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
            {navLinks.map((link) => (
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
            ))}
            <div className="flex flex-col gap-3 py-2 border-t mt-2">
              <SignedOut>
                <Button variant="outline" className="w-full rounded-xl" asChild>
                  <Link href="/sign-in" onClick={() => setIsMenuOpen(false)}>Sign In</Link>
                </Button>
              </SignedOut>
              <SignedIn>
                <div className="flex items-center justify-between px-2">
                  <span className="text-sm font-medium text-muted-foreground">Account</span>
                  <UserButton />
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
