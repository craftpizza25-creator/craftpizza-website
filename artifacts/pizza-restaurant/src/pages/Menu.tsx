import { useState } from "react"
import { useGetMenuCategories, useGetMenuItems, getGetMenuItemsQueryKey } from "@workspace/api-client-react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} zł`
}

export default function Menu() {
  const [activeCategory, setActiveCategory] = useState<string>("Wszystkie")

  const { data: categories, isLoading: categoriesLoading } = useGetMenuCategories()

  const params = activeCategory === "Wszystkie" ? undefined : { category: activeCategory }

  const { data: menuItems, isLoading: itemsLoading } = useGetMenuItems(
    params,
    { query: { queryKey: getGetMenuItemsQueryKey(params) } }
  )

  const { addItem } = useCart()

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      {/* Header */}
      <div className="container mx-auto px-4 text-center max-w-3xl mb-12">
        <h1 className="font-serif text-5xl md:text-6xl font-bold text-foreground mb-6">
          Nasze menu
        </h1>
        <p className="font-sans text-lg text-muted-foreground">
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
                ? "bg-foreground text-background border-foreground"
                : "bg-transparent text-foreground/70 border-border hover:border-foreground/30 hover:text-foreground"
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
                  ? "bg-foreground text-background border-foreground"
                  : "bg-transparent text-foreground/70 border-border hover:border-foreground/30 hover:text-foreground"
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
              <div key={i} className="animate-pulse flex gap-4 p-4 border border-border/50 rounded-lg">
                <div className="w-24 h-24 bg-muted rounded-md shrink-0" />
                <div className="space-y-3 flex-1">
                  <div className="h-5 bg-muted w-3/4 rounded" />
                  <div className="h-4 bg-muted w-full rounded" />
                  <div className="h-4 bg-muted w-1/2 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : menuItems?.length === 0 ? (
          <div className="text-center py-24 text-muted-foreground">
            <p className="text-xl font-serif">Brak pozycji w tej kategorii.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10 lg:gap-x-12">
            {menuItems?.map((item) => (
              <div
                key={item.id}
                className="group flex flex-col sm:flex-row gap-4 p-4 sm:p-0 rounded-xl sm:rounded-none bg-card sm:bg-transparent border border-border sm:border-none shadow-sm sm:shadow-none hover:bg-card sm:hover:bg-card sm:-mx-4 sm:px-4 sm:py-4 transition-colors"
              >
                {/* Image */}
                {item.imageUrl ? (
                  <div className="w-full sm:w-28 h-48 sm:h-28 shrink-0 overflow-hidden rounded-md sm:rounded-sm bg-muted relative">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-full h-full object-cover transition-transform group-hover:scale-110"
                    />
                    {!item.isAvailable && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                        <span className="text-xs font-bold uppercase tracking-wider text-foreground">Wyczerpane</span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full sm:w-28 h-48 sm:h-28 shrink-0 rounded-md sm:rounded-sm bg-muted flex items-center justify-center">
                    <span className="font-serif text-muted-foreground">CP</span>
                  </div>
                )}

                {/* Content */}
                <div className="flex-1 flex flex-col justify-center">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="font-serif text-xl font-semibold flex items-center gap-2">
                        {item.name}
                        {item.isFeatured && (
                          <span className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-0.5 rounded-sm font-sans font-bold">
                            Polecane
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-primary font-medium mt-1">{formatPrice(item.price)}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="shrink-0 h-8 w-8 rounded-full border-border bg-background hover:bg-primary hover:text-primary-foreground hover:border-primary disabled:opacity-50 transition-colors"
                      disabled={!item.isAvailable}
                      onClick={() => addItem({ menuItemId: item.id, name: item.name, price: item.price })}
                    >
                      <Plus className="h-4 w-4" />
                      <span className="sr-only">Dodaj {item.name} do koszyka</span>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 sm:line-clamp-none">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
