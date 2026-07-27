import { useGetCalendarEvents } from "@workspace/api-client-react"
import { CalendarDays, Clock, MapPin, Phone, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { useEffect, useState } from "react"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

interface OpeningHour {
  id: number
  dayIndex: number
  dayName: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

const FALLBACK_HOURS = [
  { dayName: "Poniedziałek", isClosed: true,  openTime: null,    closeTime: null    },
  { dayName: "Wtorek",       isClosed: true,  openTime: null,    closeTime: null    },
  { dayName: "Środa",        isClosed: false, openTime: "12:00", closeTime: "21:00" },
  { dayName: "Czwartek",     isClosed: false, openTime: "12:00", closeTime: "21:00" },
  { dayName: "Piątek",       isClosed: false, openTime: "12:00", closeTime: "22:00" },
  { dayName: "Sobota",       isClosed: false, openTime: "12:00", closeTime: "22:00" },
  { dayName: "Niedziela",    isClosed: false, openTime: "12:00", closeTime: "21:00" },
]

function useOpeningHours() {
  const [hours, setHours] = useState<OpeningHour[] | null>(null)
  useEffect(() => {
    fetch(`${BASE}/api/opening-hours`)
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(setHours)
      .catch(() => setHours(null))
  }, [])
  return hours
}

const TODAY = new Date().toLocaleDateString("pl-PL", { weekday: "long" })
  .replace(/^\w/, (c) => c.toUpperCase())

const EVENT_TYPE_STYLES: Record<string, { label: string; classes: string }> = {
  event:        { label: "Wydarzenie",    classes: "bg-primary/10 text-primary border-primary/20" },
  closure:      { label: "Zamknięte",     classes: "bg-destructive/10 text-destructive border-destructive/20" },
  special:      { label: "Specjalnie",    classes: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  announcement: { label: "Ogłoszenie",    classes: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
}

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00")
  return d.toLocaleDateString("pl-PL", { weekday: "long", day: "numeric", month: "long", year: "numeric" })
    .replace(/^\w/, (c) => c.toUpperCase())
}

export default function CalendarPage() {
  const { data: events, isLoading } = useGetCalendarEvents()
  const fetchedHours = useOpeningHours()
  const displayHours = fetchedHours ?? FALLBACK_HOURS

  return (
    <div className="min-h-screen bg-secondary text-secondary-foreground">

      {/* Header */}
      <div className="py-16 border-b border-secondary-foreground/10">
        <div className="container mx-auto px-4 text-center max-w-2xl">
          <span className="font-sans tracking-widest uppercase text-xs font-bold text-primary mb-3 block">
            Aktualności
          </span>
          <h1 className="font-serif text-5xl md:text-6xl font-bold mb-4">
            Kalendarz
          </h1>
          <p className="text-secondary-foreground/60 text-lg font-sans">
            Sprawdź nasze godziny otwarcia, nadchodzące wydarzenia i aktualne ogłoszenia.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* LEFT — Opening hours + contact */}
          <aside className="lg:col-span-2 space-y-8">

            {/* Opening hours */}
            <div>
              <div className="flex items-center gap-2 mb-6">
                <Clock className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold">Godziny otwarcia</h2>
              </div>
              <div className="space-y-1">
                {displayHours.map((row) => {
                  const isToday = row.dayName.toLowerCase() === TODAY.toLowerCase()
                  const label = row.isClosed ? "Nieczynne" : `${row.openTime} – ${row.closeTime}`
                  return (
                    <div
                      key={row.dayName}
                      className={cn(
                        "flex justify-between items-center py-2.5 px-3 rounded-sm text-sm",
                        isToday
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "hover:bg-secondary-foreground/5 text-secondary-foreground/80"
                      )}
                    >
                      <span>{row.dayName}</span>
                      <span className={cn(row.isClosed && !isToday && "text-secondary-foreground/40")}>
                        {label}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Location */}
            <div className="border-t border-secondary-foreground/10 pt-8">
              <div className="flex items-center gap-2 mb-5">
                <MapPin className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-2xl font-bold">Gdzie jesteśmy</h2>
              </div>
              <div className="space-y-3 text-secondary-foreground/70 text-sm font-sans">
                <p className="text-secondary-foreground font-medium text-base">Craft Pizza</p>
                <p>ul. Flisaków 16<br />32-050 Łączany<br />(trasa velo Skawina)</p>
                <a
                  href="https://maps.google.com/?q=ul.+Flisaków+16+Łączany"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-primary hover:text-primary/80 transition-colors font-medium mt-1"
                >
                  Otwórz w Google Maps <ChevronRight className="h-3 w-3" />
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="border-t border-secondary-foreground/10 pt-8">
              <div className="flex items-center gap-2 mb-4">
                <Phone className="h-5 w-5 text-primary" />
                <h2 className="font-serif text-xl font-bold">Kontakt</h2>
              </div>
              <p className="text-secondary-foreground/60 text-sm font-sans mb-2">
                Masz pytania? Zadzwoń lub napisz.
              </p>
              <a
                href="https://www.instagram.com/craft_pizzaa/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/80 transition-colors font-medium text-sm"
              >
                @craft_pizzaa na Instagramie
              </a>
            </div>
          </aside>

          {/* RIGHT — Events feed */}
          <main className="lg:col-span-3">
            <div className="flex items-center gap-2 mb-8">
              <CalendarDays className="h-5 w-5 text-primary" />
              <h2 className="font-serif text-2xl font-bold">Nadchodzące wydarzenia</h2>
            </div>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse rounded-sm border border-secondary-foreground/10 p-5">
                    <div className="h-3 bg-secondary-foreground/10 rounded w-1/4 mb-3" />
                    <div className="h-5 bg-secondary-foreground/10 rounded w-2/3 mb-2" />
                    <div className="h-4 bg-secondary-foreground/10 rounded w-full" />
                  </div>
                ))}
              </div>
            ) : !events || events.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-secondary-foreground/15 rounded-sm">
                <CalendarDays className="h-10 w-10 text-secondary-foreground/20 mx-auto mb-4" />
                <p className="font-serif text-xl text-secondary-foreground/40">Brak zaplanowanych wydarzeń</p>
                <p className="text-sm text-secondary-foreground/30 mt-1 font-sans">Zajrzyj wkrótce po aktualizacje.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {events.map((event) => {
                  const style = EVENT_TYPE_STYLES[event.type] ?? EVENT_TYPE_STYLES.event
                  return (
                    <article
                      key={event.id}
                      className="rounded-sm border border-secondary-foreground/10 p-5 hover:border-primary/30 transition-colors"
                    >
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className={cn("text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border font-sans", style.classes)}>
                          {style.label}
                        </span>
                        <span className="text-xs text-secondary-foreground/50 font-sans">
                          {formatDate(event.date)}
                          {event.startTime && (
                            <> · {event.startTime}{event.endTime ? ` – ${event.endTime}` : ""}</>
                          )}
                        </span>
                      </div>
                      <h3 className="font-serif text-xl font-semibold text-secondary-foreground mb-1">
                        {event.title}
                      </h3>
                      {event.description && (
                        <p className="text-sm text-secondary-foreground/60 font-sans leading-relaxed">
                          {event.description}
                        </p>
                      )}
                    </article>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
