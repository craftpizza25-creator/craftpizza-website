import { useState } from "react"
import { useGetMenuCategories, useGetMenuItems, getGetMenuItemsQueryKey } from "@workspace/api-client-react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Plus, Minus, ShoppingCart, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { Link } from "wouter"

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} zł`
}

const BOX_FEE = 2.00 // Opakowanie kartonowe

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>("Wszystkie")

  const { data: categories, isLoading: categoriesLoading } = useGetMenuCategories()

  const params = activeCategory === "Wszystkie" ? undefined : { category: activeCategory }

  const { data: menuItems, isLoading: itemsLoading } = useGetMenuItems(
    params,
    { query: { queryKey: getGetMenuItemsQueryKey(params) } }
  )

  const { addItem, updateQuantity, items, count, total } = useCart()
  const hasPizza = items.some(i => i.category === "Pizzas")

  const getItemQty = (id: number) =>
    items.find((i) => i.menuItemId === id)?.quantity ?? 0

  return (
    <div className="min-h-screen bg-secondary text-secondary-foreground pt-8 pb-32">
      {/* Header */}
      <div className="container mx-auto px-4 text-center max-w-3xl mb-12">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-secondary-foreground mb-6">
          Nasze menu
        </h1>
        <p className="font-sans text-lg text-secondary-foreground/60">
          Ręcznie rozciągane ciasto, pomidory San Marzano DOP i mozzarella fior di latte.
          Wszystko przygotowywane codziennie z oryginalnych włoskich składników.
        </p>
      </div>

      <div className="container mx-auto px-4">
        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <button
            onClick={() => setActiveCategory("Wszystkie")}
            className={cn(
              "px-6 py-2 text-sm font-medium transition-all rounded-full border",
              activeCategory === "Wszystkie"
                ? "bg-secondary-foreground text-secondary border-secondary-foreground"
                : "bg-transparent text-secondary-foreground/70 border-secondary-foreground/20 hover:border-secondary-foreground/50 hover:text-secondary-foreground"
            )}
          >
            Wszystkie
          </button>
          {!categoriesLoading && categories?.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={cn(
                "px-6 py-2 text-sm font-medium transition-all rounded-full border",
                activeCategory === cat.name
                  ? "bg-secondary-foreground text-secondary border-secondary-foreground"
                  : "bg-transparent text-secondary-foreground/70 border-secondary-foreground/20 hover:border-secondary-foreground/50 hover:text-secondary-foreground"
              )}
            >
              {cat.name} <span className="ml-1 opacity-50">({cat.count})</span>
            </button>
          ))}
        </div>

        {/* Menu Grid */}
        {itemsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse flex gap-4 p-4 border border-secondary-foreground/10 rounded-lg">
                <div className="w-24 h-24 bg-secondary-foreground/10 rounded-md shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-5 bg-secondary-foreground/10 w-3/4 rounded" />
                  <div className="h-4 bg-secondary-foreground/10 w-full rounded" />
                  <div className="h-4 bg-secondary-foreground/10 w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-24 text-secondary-foreground/50">
            <p className="text-xl font-serif">Brak pozycji w tej kategorii.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 lg:gap-x-12">
            {menuItems?.map((item) => {
              const qty = getItemQty(item.id)
              return (
                <div
                  key={item.id}
                  className="group flex flex-col sm:flex-row gap-4 p-4 sm:p-0 rounded-xl sm:rounded-none bg-secondary-foreground/5 sm:bg-transparent border border-secondary-foreground/10 sm:border-none shadow-sm sm:shadow-none hover:bg-secondary-foreground/5 sm:hover:bg-secondary-foreground/5 sm:-mx-4 sm:px-4 sm:py-4 transition-colors"
                >
                  {/* Image */}
                  {item.imageUrl ? (
                    <div className="w-full sm:w-28 h-48 sm:h-28 shrink-0 overflow-hidden rounded-md sm:rounded-sm bg-secondary-foreground/10 relative">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      {!item.isAvailable && (
                        <div className="absolute inset-0 bg-secondary/80 backdrop-blur-sm flex items-center justify-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">Wyczerpane</span>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full sm:w-28 h-48 sm:h-28 shrink-0 rounded-md sm:rounded-sm bg-secondary-foreground/10 flex items-center justify-center">
                      <span className="font-serif text-secondary-foreground/40">CP</span>
                    </div>
                  )}

                  {/* Content */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-serif text-xl font-semibold text-secondary-foreground flex items-center gap-2">
                          {item.name}
                          {item.isFeatured && (
                            <span className="text-[10px] uppercase tracking-wider bg-primary/20 text-primary px-2 py-0.5 rounded-sm font-sans font-bold">
                              Polecane
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-primary font-medium mt-1">{formatPrice(item.price)}</p>
                      </div>

                      {/* Cart control: "+" when not in cart, "− qty +" when in cart */}
                      {qty === 0 ? (
                        <button
                          disabled={!item.isAvailable}
                          onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, category: item.category })}
                          className="shrink-0 h-9 w-9 rounded-full border border-secondary-foreground/30 bg-transparent text-secondary-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                          aria-label={`Dodaj ${item.name} do koszyka`}
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      ) : (
                        <div className="shrink-0 flex items-center gap-1 bg-primary rounded-full px-1 py-1">
                          <button
                            onClick={() => updateQuantity(item.id, qty - 1)}
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
                            aria-label="Zmniejsz ilość"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="w-5 text-center text-sm font-bold text-primary-foreground select-none">
                            {qty}
                          </span>
                          <button
                            onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price, category: item.category })}
                            className="h-7 w-7 rounded-full flex items-center justify-center hover:bg-primary-foreground/20 text-primary-foreground transition-colors"
                            aria-label="Zwiększ ilość"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-secondary-foreground/60 leading-relaxed line-clamp-2 sm:line-clamp-none">
                      {item.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Sticky cart bar ─────────────────────────────────────────────────── */}
      {count > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 pointer-events-none">
          <div className="container mx-auto max-w-2xl pointer-events-auto">
            <Link href="/order">
              <div className="flex items-center justify-between bg-primary text-primary-foreground rounded-2xl px-5 py-4 shadow-2xl shadow-black/40 cursor-pointer hover:bg-primary/90 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <ShoppingCart className="h-5 w-5" />
                    <span className="absolute -top-2 -right-2 h-4 w-4 rounded-full bg-primary-foreground text-primary text-[10px] font-bold flex items-center justify-center">
                      {count}
                    </span>
                  </div>
                  <span className="font-semibold">
                    {count === 1 ? "1 pozycja" : `${count} pozycje`}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-bold text-lg">{formatPrice(total + (hasPizza ? BOX_FEE : 0))}</span>
                    {hasPizza && (
                      <span className="block text-[11px] text-primary-foreground/60">w tym opakowanie 2,00 zł</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 bg-primary-foreground/20 rounded-xl px-3 py-1.5 text-sm font-semibold">
                    Zamów <ArrowRight className="h-3.5 w-3.5 ml-1" />
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
