import * as React from "react"
import { Link } from "wouter"
import { ArrowRight, Clock, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useGetFeaturedMenuItems } from "@workspace/api-client-react"
import heroBg from "@assets/generated_images/hero-bg.jpg"
import margheritaImg from "@assets/generated_images/margherita.jpg"
import diningImg from "@assets/generated_images/dining.jpg"

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} zł`
}

export default function Home() {
  const { data: featuredItems, isLoading } = useGetFeaturedMenuItems()

  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative h-[85vh] min-h-[600px] w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img
            src={heroBg}
            alt="Wnętrze restauracji pizzerii"
            className="w-full h-full object-cover object-center scale-105 animate-in fade-in duration-1000 slide-in-from-bottom-4"
          />
          <div className="absolute inset-0 bg-black/60" />
        </div>

        <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center text-white">
          <span className="font-sans tracking-widest uppercase text-sm font-semibold text-primary mb-6 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-100 fill-mode-both">
            Od 2025 roku
          </span>
          <h1 className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold mb-6 max-w-4xl leading-tight text-balance animate-in slide-in-from-bottom-8 fade-in duration-700 delay-200 fill-mode-both">
            Włoski smak. <br /> Neapolitańska dusza.
          </h1>
          <p className="font-sans text-lg md:text-xl text-white/80 max-w-2xl mb-10 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-300 fill-mode-both">
            Oryginalne włoskie składniki, ręcznie rozciągane ciasto i autentyczne receptury prosto z Neapolu.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 animate-in slide-in-from-bottom-8 fade-in duration-700 delay-500 fill-mode-both">
            <Button asChild size="lg" className="text-base font-semibold px-8 h-14 rounded-none">
              <Link href="/order">Zamów na wynos</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="text-base font-semibold px-8 h-14 rounded-none bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Link href="/menu">Zobacz menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1 relative">
              <div className="aspect-[4/5] relative w-full max-w-md mx-auto lg:ml-0 overflow-hidden rounded-sm">
                <img
                  src={diningImg}
                  alt="Goście przy stole"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-8 -right-8 w-1/2 aspect-square border-8 border-background overflow-hidden rounded-sm hidden sm:block">
                <img
                  src={margheritaImg}
                  alt="Świeża pizza margherita"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            <div className="order-1 lg:order-2 space-y-6 max-w-xl mx-auto lg:mx-0">
              <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
                Włoskie składniki. Bez kompromisów.
              </h2>
              <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                Nie robimy „nowoczesnych interpretacji". Robimy pizzę tak, jak powinna być robiona — z mąki tipo 00, pomidorów San Marzano i mozzarelli fior di latte sprowadzanych bezpośrednio z Włoch.
              </p>
              <p className="font-sans text-lg text-muted-foreground leading-relaxed">
                Każdy składnik ma swoje pochodzenie. Oliwa z Sycylii, bazylia ze słońcem, sery dojrzewające we właściwych miejscach. Kiedy wchodzisz do Craft Pizza, wchodzisz do kuchni z prawdziwymi produktami.
              </p>
              <div className="pt-4 flex flex-col gap-4">
                <div className="flex items-center gap-3 text-foreground/80">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span>ul. Włoska 12, 00-001 Warszawa</span>
                </div>
                <div className="flex items-center gap-3 text-foreground/80">
                  <Clock className="h-5 w-5 text-primary" />
                  <span>Czynne wt–nd od 16:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Italian Ingredients Highlight */}
      <section className="py-16 bg-background border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <span className="font-sans tracking-widest uppercase text-xs font-bold text-primary mb-2 block">
              Prosto z Włoch
            </span>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">
              Tylko oryginalne włoskie składniki
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { name: "Pomidory San Marzano", desc: "DOP, z wulkanicznych gleb Kampanii" },
              { name: "Mąka Tipo 00", desc: "Zmielona metodą tradycyjną" },
              { name: "Mozzarella Fior di Latte", desc: "Świeża, rozrywana ręcznie" },
              { name: "Oliwa z Oliwek EVO", desc: "Extra vergine z Sycylii" },
            ].map((item) => (
              <div key={item.name} className="text-center p-6 border border-border rounded-sm hover:border-primary transition-colors">
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{item.name}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Menu */}
      <section className="py-24 bg-secondary text-secondary-foreground">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 border-b border-secondary-foreground/10 pb-6">
            <div>
              <span className="font-sans tracking-widest uppercase text-xs font-bold text-primary mb-2 block">
                Klasyki
              </span>
              <h2 className="font-serif text-4xl md:text-5xl font-bold">Nasze hity</h2>
            </div>
            <Link href="/menu" className="hidden sm:flex items-center gap-2 text-primary hover:text-primary/80 transition-colors font-medium">
              Pełne menu <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-4">
                  <div className="bg-secondary-foreground/10 h-64 w-full rounded-sm" />
                  <div className="h-6 bg-secondary-foreground/10 w-2/3 rounded-sm" />
                  <div className="h-4 bg-secondary-foreground/10 w-full rounded-sm" />
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-12">
              {featuredItems?.map((item) => (
                <Link key={item.id} href="/order" className="group block group">
                  <div className="relative aspect-square overflow-hidden rounded-sm mb-6 bg-secondary-foreground/5">
                    {item.imageUrl ? (
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary-foreground/30 font-serif text-xl bg-black/20">
                        Craft Pizza
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white font-medium border border-white px-6 py-2">
                        Zamów teraz
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-serif text-2xl font-semibold mb-2 group-hover:text-primary transition-colors">
                        {item.name}
                      </h3>
                      <p className="text-secondary-foreground/70 font-sans text-sm line-clamp-2">
                        {item.description}
                      </p>
                    </div>
                    <span className="font-sans font-medium text-lg shrink-0">
                      {formatPrice(item.price)}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="mt-10 sm:hidden">
            <Button asChild variant="outline" className="w-full border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10 h-12 rounded-none">
              <Link href="/menu">Pełne menu</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-primary text-primary-foreground text-center">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-serif text-4xl md:text-6xl font-bold mb-6">
            Poczuj smak Włoch
          </h2>
          <p className="text-lg md:text-xl text-primary-foreground/90 mb-10 font-sans">
            Niezależnie czy jesz u nas, czy zabierasz na wynos — gwarantujemy te same, oryginalne włoskie składniki i niezmienną jakość.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 text-base font-semibold px-8 h-14 rounded-none">
              <Link href="/order">Zamów online</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10 text-base font-semibold px-8 h-14 rounded-none">
              <Link href="/contact">Zarezerwuj stolik</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  )
}
