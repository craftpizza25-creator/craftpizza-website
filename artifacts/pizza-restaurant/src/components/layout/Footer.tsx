import { Link } from "wouter"
import craftPizzaLogo from "@assets/fulllogo_1784708745176.jpg"

export function Footer() {
  return (
    <footer className="bg-secondary text-secondary-foreground mt-auto">
      <div className="container mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <img
                src={craftPizzaLogo}
                alt="Craft Pizza"
                className="h-14 w-auto object-contain"
              />
            </Link>
            <p className="mt-4 text-secondary-foreground/70 max-w-sm font-sans">
              Autentyczna pizza neapolitańska z oryginalnymi włoskimi składnikami.
              Craft Pizza — jakość i pasja od 2025 roku.
            </p>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Odwiedź nas</h4>
            <address className="not-italic text-sm text-secondary-foreground/70 space-y-2">
              <p>ul. Włoska 12</p>
              <p>00-001 Warszawa</p>
              <p className="mt-4">
                <strong>Wt – Nd:</strong> 16:00 – 23:00
              </p>
              <p><strong>Pon:</strong> Nieczynne</p>
            </address>
          </div>

          <div>
            <h4 className="font-serif text-lg font-semibold mb-4">Nawigacja</h4>
            <nav className="flex flex-col gap-2 text-sm text-secondary-foreground/70">
              <Link href="/menu" className="hover:text-primary transition-colors w-fit">Nasze menu</Link>
              <Link href="/order" className="hover:text-primary transition-colors w-fit">Zamów online</Link>
              <Link href="/gallery" className="hover:text-primary transition-colors w-fit">Galeria</Link>
              <Link href="/contact" className="hover:text-primary transition-colors w-fit">Kontakt</Link>
            </nav>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-secondary-foreground/10 text-center text-sm text-secondary-foreground/50">
          <p>&copy; {new Date().getFullYear()} Craft Pizza. Wszelkie prawa zastrzeżone.</p>
        </div>
      </div>
    </footer>
  )
}
