import * as React from "react"
import { Link, useLocation } from "wouter"
import { ShoppingCart, Menu as MenuIcon, X } from "lucide-react"
import { useCart } from "@/hooks/use-cart"
import { cn } from "@/lib/utils"
import craftPizzaLogo from "@assets/fulllogo_1784708745176.jpg"

export function Navbar() {
  const [location] = useLocation()
  const { count } = useCart()
  const [isMobileOpen, setIsMobileOpen] = React.useState(false)

  const links = [
    { href: "/", label: "Strona główna" },
    { href: "/menu", label: "Menu" },
    { href: "/gallery", label: "Galeria" },
    { href: "/contact", label: "Kontakt" },
  ]

  React.useEffect(() => {
    setIsMobileOpen(false)
  }, [location])

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img
            src={craftPizzaLogo}
            alt="Craft Pizza"
            className="h-11 w-auto object-contain mix-blend-multiply dark:mix-blend-screen"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location === link.href ? "text-primary" : "text-foreground/80"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/order"
            className="relative flex items-center gap-2 text-foreground/80 hover:text-primary transition-colors"
          >
            <ShoppingCart className="h-5 w-5" />
            <span className="sr-only">Koszyk</span>
            {count > 0 && (
              <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                {count}
              </span>
            )}
          </Link>

          <button
            className="md:hidden p-2 text-foreground/80 hover:text-primary"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
          >
            {isMobileOpen ? <X className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {isMobileOpen && (
        <div className="md:hidden border-t border-border/40 bg-background p-4 absolute top-16 left-0 w-full shadow-lg">
          <nav className="flex flex-col gap-4">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-lg font-medium transition-colors",
                  location === link.href ? "text-primary" : "text-foreground/80"
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/order"
              className="text-lg font-medium text-primary mt-2 pt-4 border-t border-border/40"
            >
              Zamów teraz
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
