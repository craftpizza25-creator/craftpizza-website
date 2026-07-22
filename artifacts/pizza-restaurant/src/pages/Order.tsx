import * as React from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateOrder, OrderInputOrderType } from "@workspace/api-client-react"
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle2 } from "lucide-react"
import { Link } from "wouter"
import { cn } from "@/lib/utils"

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} zł`
}

export default function Order() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const [orderType, setOrderType] = React.useState<"pickup" | "delivery">("pickup")
  const [successOrderId, setSuccessOrderId] = React.useState<number | null>(null)

  const createOrder = useCreateOrder()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    createOrder.mutate({
      data: {
        customerName: formData.get("name") as string,
        customerEmail: formData.get("email") as string,
        customerPhone: formData.get("phone") as string,
        orderType: orderType as OrderInputOrderType,
        deliveryAddress: orderType === "delivery" ? formData.get("address") as string : undefined,
        specialInstructions: formData.get("instructions") as string || undefined,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity
        }))
      }
    }, {
      onSuccess: (data) => {
        setSuccessOrderId(data.id)
        clearCart()
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  if (successOrderId) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Zamówienie przyjęte!</h1>
          <p className="text-muted-foreground text-lg">
            Dziękujemy! Twoje zamówienie nr #{successOrderId} jest już w przygotowaniu.
          </p>
          <div className="p-6 bg-card border border-border rounded-xl">
            <p className="font-medium text-foreground mb-2">
              Szacowany czas {orderType === "pickup" ? "odbioru" : "dostawy"}:
            </p>
            <p className="text-3xl font-serif text-primary">25 – 35 min</p>
          </div>
          <Button asChild className="mt-8">
            <Link href="/">Wróć na stronę główną</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-8">
          Złóż zamówienie
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Main Checkout Form */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            {items.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <p className="text-xl text-muted-foreground mb-6 font-serif">Twój koszyk jest pusty.</p>
                <Button asChild>
                  <Link href="/menu">Przeglądaj menu</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8" id="checkout-form">
                {/* Order Type Toggle */}
                <div className="p-1 bg-secondary rounded-lg flex border border-border w-full max-w-sm">
                  <button
                    type="button"
                    onClick={() => setOrderType("pickup")}
                    className={cn(
                      "flex-1 py-3 text-sm font-semibold rounded-md transition-colors",
                      orderType === "pickup"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-secondary-foreground/60 hover:text-secondary-foreground"
                    )}
                  >
                    Odbiór osobisty
                  </button>
                  <button
                    type="button"
                    onClick={() => setOrderType("delivery")}
                    className={cn(
                      "flex-1 py-3 text-sm font-semibold rounded-md transition-colors",
                      orderType === "delivery"
                        ? "bg-background text-foreground shadow-sm"
                        : "text-secondary-foreground/60 hover:text-secondary-foreground"
                    )}
                  >
                    Dostawa
                  </button>
                </div>

                <div className="space-y-6 bg-card border border-border p-6 rounded-xl">
                  <h2 className="font-serif text-2xl font-semibold border-b border-border pb-4">Dane kontaktowe</h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="text-sm font-medium text-foreground">Imię i nazwisko *</label>
                      <Input id="name" name="name" required placeholder="Jan Kowalski" className="bg-background" />
                    </div>
                    <div className="space-y-2">
                      <label htmlFor="phone" className="text-sm font-medium text-foreground">Numer telefonu *</label>
                      <Input id="phone" name="phone" type="tel" required placeholder="+48 500 000 000" className="bg-background" />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label htmlFor="email" className="text-sm font-medium text-foreground">Adres e-mail *</label>
                      <Input id="email" name="email" type="email" required placeholder="jan@example.com" className="bg-background" />
                    </div>
                  </div>
                </div>

                {orderType === "delivery" && (
                  <div className="space-y-6 bg-card border border-border p-6 rounded-xl animate-in fade-in slide-in-from-top-4">
                    <h2 className="font-serif text-2xl font-semibold border-b border-border pb-4">Adres dostawy</h2>
                    <div className="space-y-2">
                      <label htmlFor="address" className="text-sm font-medium text-foreground">Pełny adres *</label>
                      <Textarea
                        id="address"
                        name="address"
                        required
                        placeholder="ul. Przykładowa 12 m. 3, 00-001 Warszawa"
                        className="bg-background min-h-[100px]"
                      />
                    </div>
                  </div>
                )}

                <div className="space-y-6 bg-card border border-border p-6 rounded-xl">
                  <h2 className="font-serif text-2xl font-semibold border-b border-border pb-4">Uwagi do zamówienia</h2>
                  <div className="space-y-2">
                    <label htmlFor="instructions" className="text-sm font-medium text-foreground">Dodatkowe informacje dla kuchni (opcjonalnie)</label>
                    <Textarea
                      id="instructions"
                      name="instructions"
                      placeholder="np. Bez cebuli, dodatkowe chili..."
                      className="bg-background min-h-[80px]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4">
                  <Link href="/menu" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Dodaj więcej
                  </Link>

                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 text-lg font-bold"
                    disabled={createOrder.isPending || items.length === 0}
                  >
                    {createOrder.isPending ? "Przetwarzanie..." : `Złóż zamówienie • ${formatPrice(total)}`}
                  </Button>
                </div>
              </form>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-xl sticky top-24 overflow-hidden">
              <div className="p-6 bg-secondary/30 border-b border-border">
                <h2 className="font-serif text-2xl font-semibold">Twoje zamówienie</h2>
              </div>

              <div className="p-6">
                {items.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Brak produktów</p>
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                      {items.map((item) => (
                        <div key={item.menuItemId} className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{item.name}</h4>
                            <p className="text-sm text-primary font-medium">{formatPrice(item.price)}</p>
                          </div>

                          <div className="flex items-center gap-2 bg-background border border-border rounded-md p-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity - 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground rounded transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="w-4 text-center text-sm font-medium">{item.quantity}</span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.menuItemId, item.quantity + 1)}
                              className="w-7 h-7 flex items-center justify-center hover:bg-muted text-muted-foreground rounded transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItem(item.menuItemId)}
                            className="text-muted-foreground hover:text-destructive shrink-0 pt-1.5"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-border pt-4 space-y-3">
                      <div className="flex justify-between font-bold text-lg text-foreground pt-1">
                        <span>Do zapłaty</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">Ceny zawierają VAT. Płatność przy odbiorze.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
