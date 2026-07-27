import * as React from "react"
import { useCart } from "@/hooks/use-cart"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useCreateOrder } from "@workspace/api-client-react"
import { Minus, Plus, Trash2, ArrowLeft, CheckCircle2, Clock, CalendarDays, MapPin } from "lucide-react"
import { Link } from "wouter"
import { cn } from "@/lib/utils"

function formatPrice(price: number) {
  return `${price.toFixed(2).replace(".", ",")} zł`
}

const BOX_FEE = 2.00 // Opakowanie kartonowe

// ── Opening-hours schedule ─────────────────────────────────────────────────
// Keyed by JS getDay() value: 0=Sun, 1=Mon … 6=Sat
const SCHEDULE: Record<number, { open: string; close: string; label: string }> = {
  0: { open: "12:00", close: "21:00", label: "Niedziela" },
  3: { open: "12:00", close: "21:00", label: "Środa" },
  4: { open: "12:00", close: "21:00", label: "Czwartek" },
  5: { open: "12:00", close: "22:00", label: "Piątek" },
  6: { open: "12:00", close: "22:00", label: "Sobota" },
}

function generateSlots(open: string, close: string): string[] {
  const slots: string[] = []
  const [oh, om] = open.split(":").map(Number)
  const [ch, cm] = close.split(":").map(Number)
  const closeTotal = ch * 60 + cm - 30 // last slot is 30 min before close
  let h = oh, m = om
  while (h * 60 + m <= closeTotal) {
    slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
    m += 30
    if (m >= 60) { h++; m -= 60 }
  }
  return slots
}

function getAvailableDates(): { iso: string; label: string; dayOfWeek: number }[] {
  const dates: { iso: string; label: string; dayOfWeek: number }[] = []
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  for (let i = 0; i < 21; i++) {
    const d = new Date(today)
    d.setDate(today.getDate() + i)
    const dow = d.getDay()
    if (SCHEDULE[dow]) {
      const iso = d.toISOString().slice(0, 10)
      const label = d.toLocaleDateString("pl-PL", {
        weekday: "long",
        day: "numeric",
        month: "long",
      }).replace(/^\w/, c => c.toUpperCase())
      dates.push({ iso, label, dayOfWeek: dow })
    }
  }
  return dates.slice(0, 10) // show max 10 upcoming open days
}

function getAvailableSlots(iso: string, dow: number): string[] {
  const schedule = SCHEDULE[dow]
  if (!schedule) return []
  const all = generateSlots(schedule.open, schedule.close)

  // For today: filter out slots that are in the past (with 30-min lead time)
  const todayIso = new Date().toISOString().slice(0, 10)
  if (iso !== todayIso) return all

  const now = new Date()
  const leadMinutes = now.getHours() * 60 + now.getMinutes() + 30
  return all.filter(slot => {
    const [h, m] = slot.split(":").map(Number)
    return h * 60 + m > leadMinutes
  })
}

// ── Polish date formatting ─────────────────────────────────────────────────
function formatDatePolish(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("pl-PL", {
    weekday: "long", day: "numeric", month: "long", year: "numeric"
  }).replace(/^\w/, c => c.toUpperCase())
}

// ──────────────────────────────────────────────────────────────────────────
export default function Order() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart()
  const [pickupDate, setPickupDate] = React.useState<string>("")
  const [pickupTime, setPickupTime] = React.useState<string>("")
  const [successData, setSuccessData] = React.useState<{ id: string; date: string; time: string } | null>(null)
  const [acceptedTerms, setAcceptedTerms] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)

  const createOrder = useCreateOrder()

  const availableDates = React.useMemo(() => getAvailableDates(), [])
  const selectedDayOfWeek = pickupDate
    ? availableDates.find(d => d.iso === pickupDate)?.dayOfWeek ?? -1
    : -1
  const availableSlots = React.useMemo(
    () => pickupDate ? getAvailableSlots(pickupDate, selectedDayOfWeek) : [],
    [pickupDate, selectedDayOfWeek]
  )

  // Reset time when date changes
  React.useEffect(() => { setPickupTime("") }, [pickupDate])

  const canSubmit = items.length > 0 && pickupDate !== "" && pickupTime !== "" && acceptedTerms

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!canSubmit) return
    const formData = new FormData(e.currentTarget)

    createOrder.mutate({
      data: {
        customerName: formData.get("name") as string,
        customerEmail: formData.get("email") as string,
        customerPhone: formData.get("phone") as string,
        orderType: "pickup",
        specialInstructions: (formData.get("instructions") as string) || undefined,
        pickupDate,
        pickupTime,
        items: items.map(item => ({
          menuItemId: item.menuItemId,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        }))
      }
    }, {
      onSuccess: (data) => {
        setSuccessData({ id: String(data.id), date: pickupDate, time: pickupTime })
        clearCart()
        formRef.current?.reset()
        setPickupDate("")
        setPickupTime("")
        setAcceptedTerms(false)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    })
  }

  // ── Success screen ──────────────────────────────────────────────────────
  if (successData) {
    return (
      <div className="min-h-[90vh] flex flex-col items-center justify-center p-4 bg-background">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10 text-primary" />
          </div>
          <h1 className="font-serif text-4xl font-bold text-foreground">Zamówienie przyjęte!</h1>
          <p className="text-muted-foreground text-lg">
            Dziękujemy! Przygotujemy Twoją pizzę na czas odbioru.
          </p>
          <div className="p-6 bg-card border border-border rounded-xl space-y-4 text-left">
            <div className="flex items-start gap-3">
              <CalendarDays className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Data odbioru</p>
                <p className="font-semibold text-foreground">{formatDatePolish(successData.date)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Godzina odbioru</p>
                <p className="font-serif text-3xl text-primary font-bold">{successData.time}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div>
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-0.5">Miejsce odbioru</p>
                <p className="font-semibold text-foreground">Craft Pizza · Łączany</p>
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">Potwierdzenie zostało wysłane na Twój adres e-mail.</p>
          <Button asChild className="mt-4">
            <Link href="/">Wróć na stronę główną</Link>
          </Button>
        </div>
      </div>
    )
  }

  // ── Main page ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-6xl">
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-foreground mb-2">
          Złóż zamówienie
        </h1>
        {/* Pickup-only notice */}
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-4 py-1.5 text-sm font-medium mb-8">
          <MapPin className="w-4 h-4 shrink-0" />
          Tylko odbiór osobisty &nbsp;·&nbsp; Dostawa wkrótce
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

          {/* ── Left: form ─────────────────────────────────────────────── */}
          <div className="lg:col-span-7 xl:col-span-8 order-2 lg:order-1">
            {items.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-border rounded-xl">
                <p className="text-xl text-muted-foreground mb-6 font-serif">Twój koszyk jest pusty.</p>
                <Button asChild><Link href="/menu">Przeglądaj menu</Link></Button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-8" id="checkout-form">

                {/* ── 1. Termin odbioru ─────────────────────────────── */}
                <div className="space-y-6 bg-card border border-border p-6 rounded-xl">
                  <h2 className="font-serif text-2xl font-semibold border-b border-border pb-4">
                    Termin odbioru
                  </h2>

                  {/* Date picker */}
                  <div className="space-y-3">
                    <p className="text-sm font-medium text-foreground">Wybierz dzień *</p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {availableDates.map(({ iso, label }) => (
                        <button
                          key={iso}
                          type="button"
                          onClick={() => setPickupDate(iso)}
                          className={cn(
                            "px-3 py-2.5 rounded-lg border text-sm font-medium text-left transition-colors leading-tight",
                            pickupDate === iso
                              ? "bg-primary text-primary-foreground border-primary"
                              : "bg-background border-border hover:border-primary/50 hover:bg-muted text-foreground"
                          )}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Time slot picker */}
                  {pickupDate && (
                    <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                      <p className="text-sm font-medium text-foreground">Wybierz godzinę *</p>
                      {availableSlots.length === 0 ? (
                        <p className="text-sm text-muted-foreground italic">
                          Na dziś nie ma już wolnych terminów. Wybierz inny dzień.
                        </p>
                      ) : (
                        <div className="flex flex-wrap gap-2">
                          {availableSlots.map(slot => (
                            <button
                              key={slot}
                              type="button"
                              onClick={() => setPickupTime(slot)}
                              className={cn(
                                "w-[72px] py-2 rounded-lg border text-sm font-semibold transition-colors",
                                pickupTime === slot
                                  ? "bg-primary text-primary-foreground border-primary"
                                  : "bg-background border-border hover:border-primary/50 hover:bg-muted text-foreground"
                              )}
                            >
                              {slot}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* ── 2. Dane kontaktowe ────────────────────────────── */}
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

                {/* ── 3. Uwagi ──────────────────────────────────────── */}
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

                {/* ── 4. Warunki zamówienia ─────────────────────────── */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 space-y-3">
                  <h3 className="text-sm font-bold text-amber-900 uppercase tracking-wide">⚠️ Warunki zamówienia i płatności</h3>
                  <ul className="text-xs text-amber-800 space-y-1.5 list-disc list-inside leading-relaxed">
                    <li>Po złożeniu zamówienia otrzymasz e-mail z prośbą o potwierdzenie — odpowiedz słowem <strong>POTWIERDZAM</strong>.</li>
                    <li>Zamówienie jest wiążące z chwilą jego potwierdzenia przez obie strony.</li>
                    <li><strong>Płatność wymagana przy odbiorze</strong> — gotówką lub kartą.</li>
                    <li>W przypadku nieodebrania potwierdzonego zamówienia Craft Pizza zastrzega sobie prawo do obciążenia klienta <strong>pełnym kosztem zamówienia</strong>.</li>
                    <li>Anulowanie możliwe <strong>co najmniej 2 godziny przed odbiorem</strong> — mailowo lub telefonicznie.</li>
                  </ul>
                  <label className="flex items-start gap-3 cursor-pointer group pt-1">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-amber-400 accent-primary shrink-0 cursor-pointer"
                    />
                    <span className="text-xs text-amber-900 font-medium leading-relaxed group-hover:text-amber-950">
                      Zapoznałem/am się z warunkami zamówienia i akceptuję politykę dotyczącą nieodebranych zamówień.
                    </span>
                  </label>
                </div>

                {/* ── Submit ────────────────────────────────────────── */}
                <div className="flex justify-between items-center pt-2">
                  <Link href="/menu" className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-medium text-sm transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Dodaj więcej
                  </Link>
                  <Button
                    type="submit"
                    size="lg"
                    className="h-14 px-8 text-lg font-bold"
                    disabled={createOrder.isPending || !canSubmit}
                  >
                    {createOrder.isPending
                      ? "Przetwarzanie..."
                      : `Zamów na ${pickupTime || "–"} · ${formatPrice(total + BOX_FEE)}`}
                  </Button>
                </div>

                {(!pickupDate || !pickupTime) && items.length > 0 && (
                  <p className="text-xs text-muted-foreground text-right -mt-4">
                    Wybierz dzień i godzinę odbioru, aby złożyć zamówienie.
                  </p>
                )}
              </form>
            )}
          </div>

          {/* ── Right: cart summary ─────────────────────────────────────── */}
          <div className="lg:col-span-5 xl:col-span-4 order-1 lg:order-2">
            <div className="bg-card border border-border rounded-xl sticky top-24 overflow-hidden">
              <div className="p-6 bg-secondary/30 border-b border-border">
                <h2 className="font-serif text-2xl font-semibold">Twoje zamówienie</h2>
                {pickupDate && pickupTime && (
                  <p className="text-sm text-primary font-medium mt-1">
                    Odbiór: {formatDatePolish(pickupDate).split(",")[0]}, {pickupTime}
                  </p>
                )}
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
                    <div className="border-t border-border pt-4 space-y-2">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Pozycje</span>
                        <span>{formatPrice(total)}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>Opakowanie kartonowe</span>
                        <span>{formatPrice(BOX_FEE)}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg text-foreground border-t border-border pt-3 mt-1">
                        <span>Do zapłaty</span>
                        <span>{formatPrice(total + BOX_FEE)}</span>
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
