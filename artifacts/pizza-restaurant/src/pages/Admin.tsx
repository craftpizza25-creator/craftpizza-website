import * as React from "react"
import { useState, useEffect, useCallback } from "react"
import { Trash2, Plus, LogOut, CalendarDays, Loader2, Clock, Save, Send, Pizza } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const BASE = import.meta.env.BASE_URL.replace(/\/$/, "")

type EventType = "event" | "closure" | "special" | "announcement"

interface CalendarEvent {
  id: number
  title: string
  description: string | null
  date: string
  startTime: string | null
  endTime: string | null
  type: EventType
  isPublished: boolean
}

interface OpeningHour {
  id: number
  dayIndex: number
  dayName: string
  openTime: string | null
  closeTime: string | null
  isClosed: boolean
}

interface TelegramSettings {
  botToken: string
  chatId: string
  enabled: boolean
  botTokenSet?: boolean
}

const TYPE_LABELS: Record<EventType, { label: string; classes: string }> = {
  event:        { label: "Wydarzenie",  classes: "bg-primary/10 text-primary border-primary/20" },
  closure:      { label: "Zamknięte",   classes: "bg-red-500/10 text-red-600 border-red-500/20" },
  special:      { label: "Specjalnie",  classes: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  announcement: { label: "Ogłoszenie",  classes: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
}

function formatDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("pl-PL", {
    weekday: "short", day: "numeric", month: "long", year: "numeric",
  })
}

type AdminTab = "calendar" | "hours" | "telegram" | "pizza-tygodnia"

const inputCls = "w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"

export default function Admin() {
  const [password, setPassword]   = useState(() => sessionStorage.getItem("admin_pw") ?? "")
  const [authed, setAuthed]       = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>("calendar")

  // ── Calendar events ──────────────────────────────────────────────────────
  const [events, setEvents]     = useState<CalendarEvent[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)
  const [form, setForm] = useState({
    title: "", description: "", date: "", startTime: "", endTime: "",
    type: "event" as EventType,
  })
  const [saving, setSaving]       = useState(false)
  const [formError, setFormError] = useState("")

  // ── Opening hours ────────────────────────────────────────────────────────
  const [hours, setHours]               = useState<OpeningHour[]>([])
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hoursSaving, setHoursSaving]   = useState(false)
  const [hoursError, setHoursError]     = useState("")
  const [hoursSaved, setHoursSaved]     = useState(false)

  // ── Pizza tygodnia ───────────────────────────────────────────────────────
  interface PizzaTygodnia { name: string; description: string; price: number }
  const [pt, setPt]                       = useState<PizzaTygodnia>({ name: "", description: "", price: 0 })
  const [ptLoading, setPtLoading]         = useState(false)
  const [ptSaving, setPtSaving]           = useState(false)
  const [ptError, setPtError]             = useState("")
  const [ptSaved, setPtSaved]             = useState(false)

  // ── Telegram ─────────────────────────────────────────────────────────────
  const [tg, setTg]                     = useState<TelegramSettings>({ botToken: "", chatId: "", enabled: false })
  const [tgLoading, setTgLoading]       = useState(false)
  const [tgSaving, setTgSaving]         = useState(false)
  const [tgTesting, setTgTesting]       = useState(false)
  const [tgError, setTgError]           = useState("")
  const [tgSaved, setTgSaved]           = useState(false)
  const [tgTestResult, setTgTestResult] = useState<"ok" | "fail" | null>(null)

  const headers = { "Content-Type": "application/json", "x-admin-password": password }

  // ── Auth / initial fetch ──────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true); setError("")
    try {
      const r = await fetch(`${BASE}/api/admin/calendar-events`, { headers })
      if (r.status === 401) { setAuthed(false); setError("Błędne hasło."); return }
      if (!r.ok) throw new Error()
      setEvents(await r.json())
      setAuthed(true)
      sessionStorage.setItem("admin_pw", password)
    } catch { setError("Nie można połączyć się z serwerem.") }
    finally { setLoading(false) }
  }, [password]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchHours = useCallback(async () => {
    setHoursLoading(true); setHoursError("")
    try {
      const r = await fetch(`${BASE}/api/opening-hours`)
      if (!r.ok) throw new Error()
      setHours(await r.json())
    } catch { setHoursError("Nie można załadować godzin otwarcia.") }
    finally { setHoursLoading(false) }
  }, [])

  const fetchTg = useCallback(async () => {
    setTgLoading(true); setTgError("")
    try {
      const r = await fetch(`${BASE}/api/admin/telegram-settings`, { headers })
      if (!r.ok) throw new Error()
      setTg(await r.json())
    } catch { setTgError("Nie można załadować ustawień Telegrama.") }
    finally { setTgLoading(false) }
  }, [password]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchPt = useCallback(async () => {
    setPtLoading(true); setPtError("")
    try {
      const r = await fetch(`${BASE}/api/admin/pizza-tygodnia`, { headers })
      if (r.status === 401) { setPtError("Błędne hasło."); return }
      if (!r.ok) throw new Error()
      setPt(await r.json())
    } catch { setPtError("Nie można załadować danych pizzy tygodnia.") }
    finally { setPtLoading(false) }
  }, [password]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (authed) { fetchEvents(); fetchHours(); fetchTg(); fetchPt() }
  }, [authed]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Calendar handlers ────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm("Usunąć to wydarzenie?")) return
    setDeleting(id)
    try {
      await fetch(`${BASE}/api/admin/calendar-events/${id}`, { method: "DELETE", headers })
      setEvents((ev) => ev.filter((e) => e.id !== id))
    } finally { setDeleting(null) }
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault(); setFormError("")
    if (!form.title || !form.date) { setFormError("Tytuł i data są wymagane."); return }
    setSaving(true)
    try {
      const body: Record<string, string> = { title: form.title, date: form.date, type: form.type }
      if (form.description) body.description = form.description
      if (form.startTime)   body.startTime   = form.startTime
      if (form.endTime)     body.endTime     = form.endTime
      const r = await fetch(`${BASE}/api/admin/calendar-events`, {
        method: "POST", headers, body: JSON.stringify(body),
      })
      if (!r.ok) { setFormError("Błąd zapisu."); return }
      const created: CalendarEvent = await r.json()
      setEvents((ev) => [...ev, created].sort((a, b) => a.date.localeCompare(b.date)))
      setForm({ title: "", description: "", date: "", startTime: "", endTime: "", type: "event" })
    } finally { setSaving(false) }
  }

  // ── Opening hours handlers ───────────────────────────────────────────────
  function updateHour(id: number, patch: Partial<OpeningHour>) {
    setHours((prev) => prev.map((h) => h.id === id ? { ...h, ...patch } : h))
  }

  async function handleSaveHours(e: React.FormEvent) {
    e.preventDefault(); setHoursSaving(true); setHoursError(""); setHoursSaved(false)
    try {
      const r = await fetch(`${BASE}/api/admin/opening-hours`, {
        method: "PUT", headers,
        body: JSON.stringify(hours.map((h) => ({
          id: h.id, openTime: h.isClosed ? null : h.openTime,
          closeTime: h.isClosed ? null : h.closeTime, isClosed: h.isClosed,
        }))),
      })
      if (r.status === 401) { setHoursError("Błędne hasło."); return }
      if (!r.ok) { setHoursError("Błąd zapisu."); return }
      setHours(await r.json()); setHoursSaved(true)
      setTimeout(() => setHoursSaved(false), 3000)
    } catch { setHoursError("Nie można połączyć się z serwerem.") }
    finally { setHoursSaving(false) }
  }

  // ── Pizza tygodnia handler ───────────────────────────────────────────────
  async function handleSavePt(e: React.FormEvent) {
    e.preventDefault(); setPtSaving(true); setPtError(""); setPtSaved(false)
    try {
      const r = await fetch(`${BASE}/api/admin/pizza-tygodnia`, {
        method: "PUT", headers,
        body: JSON.stringify({ name: pt.name, description: pt.description, price: Number(pt.price) }),
      })
      if (r.status === 401) { setPtError("Błędne hasło."); return }
      if (!r.ok) { const j = await r.json().catch(() => ({})); setPtError(j.error ?? "Błąd zapisu."); return }
      setPt(await r.json()); setPtSaved(true)
      setTimeout(() => setPtSaved(false), 3000)
    } catch { setPtError("Nie można połączyć się z serwerem.") }
    finally { setPtSaving(false) }
  }

  // ── Telegram handlers ────────────────────────────────────────────────────
  async function handleSaveTg(e: React.FormEvent) {
    e.preventDefault(); setTgSaving(true); setTgError(""); setTgSaved(false)
    try {
      const r = await fetch(`${BASE}/api/admin/telegram-settings`, {
        method: "PUT", headers, body: JSON.stringify(tg),
      })
      if (r.status === 401) { setTgError("Błędne hasło."); return }
      if (!r.ok) { setTgError("Błąd zapisu."); return }
      setTgSaved(true); setTimeout(() => setTgSaved(false), 3000)
      fetchTg()
    } catch { setTgError("Nie można połączyć się z serwerem.") }
    finally { setTgSaving(false) }
  }

  async function handleTestTg() {
    setTgTesting(true); setTgTestResult(null); setTgError("")
    try {
      const r = await fetch(`${BASE}/api/admin/telegram-test`, { method: "POST", headers })
      setTgTestResult(r.ok ? "ok" : "fail")
      if (!r.ok) {
        const j = await r.json().catch(() => ({}))
        setTgError(j.error ?? "Wysyłka nieudana.")
      }
    } catch { setTgTestResult("fail"); setTgError("Nie można połączyć się z serwerem.") }
    finally { setTgTesting(false) }
  }

  // ── Login screen ──────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-secondary-foreground/5 border border-secondary-foreground/10 rounded-sm p-8">
          <div className="flex items-center gap-2 mb-8">
            <CalendarDays className="h-5 w-5 text-primary" />
            <h1 className="font-serif text-2xl font-bold text-secondary-foreground">Panel admina</h1>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); fetchEvents() }} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-secondary-foreground/70 mb-1">Hasło</label>
              <input type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls} placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button type="submit" className="w-full rounded-sm" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Zaloguj"}
            </Button>
          </form>
        </div>
      </div>
    )
  }

  // ── Admin panel ───────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-secondary text-secondary-foreground">

      {/* Header */}
      <div className="border-b border-secondary-foreground/10 px-4 md:px-6 py-4 flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-5 w-5 text-primary" />
            <span className="font-serif text-xl font-bold">Panel admina</span>
          </div>
          {/* Tabs */}
          <div className="flex items-center gap-1 border border-secondary-foreground/15 rounded-sm p-0.5">
            {(["calendar", "hours", "telegram", "pizza-tygodnia"] as AdminTab[]).map((tab) => {
              const labels: Record<AdminTab, { icon: React.ReactNode; label: string }> = {
                calendar:        { icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Kalendarz" },
                hours:           { icon: <Clock className="h-3.5 w-3.5" />, label: "Godziny" },
                telegram:        { icon: <Send className="h-3.5 w-3.5" />, label: "Telegram" },
                "pizza-tygodnia": { icon: <Pizza className="h-3.5 w-3.5" />, label: "Pizza tygodnia" },
              }
              const { icon, label } = labels[tab]
              return (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm transition-colors",
                    activeTab === tab
                      ? "bg-primary text-primary-foreground font-medium"
                      : "text-secondary-foreground/60 hover:text-secondary-foreground"
                  )}>
                  {icon} {label}
                </button>
              )
            })}
          </div>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_pw"); setAuthed(false); setPassword("") }}
          className="flex items-center gap-1 text-sm text-secondary-foreground/50 hover:text-secondary-foreground transition-colors">
          <LogOut className="h-4 w-4" /> Wyloguj
        </button>
      </div>

      {/* ── Calendar tab ─────────────────────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">
          <aside className="lg:col-span-2">
            <h2 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Dodaj wydarzenie
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Tytuł *</label>
                <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className={inputCls} placeholder="np. Pizza w plenerze!" />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Opis</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3} className={cn(inputCls, "resize-none")} placeholder="Opcjonalny opis dla klientów…" />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Data *</label>
                <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Od</label>
                  <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Do</label>
                  <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className={inputCls} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Typ</label>
                <select value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className={inputCls}>
                  <option value="event">Wydarzenie</option>
                  <option value="announcement">Ogłoszenie</option>
                  <option value="special">Specjalnie</option>
                  <option value="closure">Zamknięte</option>
                </select>
              </div>
              {formError && <p className="text-sm text-red-400">{formError}</p>}
              <Button type="submit" className="w-full rounded-sm" disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                Zapisz wydarzenie
              </Button>
            </form>
          </aside>

          <main className="lg:col-span-3">
            <h2 className="font-serif text-xl font-bold mb-6">
              Wszystkie wydarzenia <span className="text-secondary-foreground/40 text-base font-sans font-normal">({events.length})</span>
            </h2>
            {loading ? (
              <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
            ) : events.length === 0 ? (
              <div className="text-center py-16 border border-dashed border-secondary-foreground/15 rounded-sm">
                <p className="text-secondary-foreground/40 font-serif text-lg">Brak wydarzeń</p>
              </div>
            ) : (
              <div className="space-y-3">
                {events.map((ev) => {
                  const style = TYPE_LABELS[ev.type] ?? TYPE_LABELS.event
                  const isPast = ev.date < new Date().toISOString().slice(0, 10)
                  return (
                    <div key={ev.id} className={cn(
                      "flex items-start justify-between gap-4 p-4 rounded-sm border transition-colors",
                      isPast ? "border-secondary-foreground/5 opacity-50" : "border-secondary-foreground/10 hover:border-secondary-foreground/20"
                    )}>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border", style.classes)}>
                            {style.label}
                          </span>
                          <span className="text-xs text-secondary-foreground/50">
                            {formatDate(ev.date)}
                            {ev.startTime && <> · {ev.startTime}{ev.endTime ? `–${ev.endTime}` : ""}</>}
                          </span>
                        </div>
                        <p className="font-serif font-semibold text-secondary-foreground truncate">{ev.title}</p>
                        {ev.description && (
                          <p className="text-xs text-secondary-foreground/50 mt-0.5 line-clamp-2">{ev.description}</p>
                        )}
                      </div>
                      <button onClick={() => handleDelete(ev.id)} disabled={deleting === ev.id}
                        className="shrink-0 text-secondary-foreground/30 hover:text-red-500 transition-colors disabled:opacity-30 mt-0.5" title="Usuń">
                        {deleting === ev.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ── Opening hours tab ────────────────────────────────────────────── */}
      {activeTab === "hours" && (
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Godziny otwarcia
          </h2>
          <p className="text-sm text-secondary-foreground/50 mb-8 font-sans">
            Zmiany są natychmiast widoczne na stronie Kalendarz.
          </p>
          {hoursLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <form onSubmit={handleSaveHours} className="space-y-3">
              {hours.map((h) => (
                <div key={h.id} className={cn(
                  "flex flex-wrap items-center gap-3 p-4 rounded-sm border transition-colors",
                  h.isClosed ? "border-secondary-foreground/5 opacity-60" : "border-secondary-foreground/15"
                )}>
                  <span className="w-28 text-sm font-medium text-secondary-foreground shrink-0">{h.dayName}</span>
                  <label className="flex items-center gap-2 text-sm text-secondary-foreground/60 cursor-pointer select-none shrink-0">
                    <input type="checkbox" checked={h.isClosed}
                      onChange={(e) => updateHour(h.id, { isClosed: e.target.checked })}
                      className="w-4 h-4 accent-primary rounded" />
                    Nieczynne
                  </label>
                  {!h.isClosed && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input type="time" value={h.openTime ?? ""}
                        onChange={(e) => updateHour(h.id, { openTime: e.target.value || null })}
                        className="px-2 py-1.5 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm w-28" />
                      <span className="text-secondary-foreground/40 text-sm">–</span>
                      <input type="time" value={h.closeTime ?? ""}
                        onChange={(e) => updateHour(h.id, { closeTime: e.target.value || null })}
                        className="px-2 py-1.5 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm w-28" />
                    </div>
                  )}
                </div>
              ))}
              {hoursError && <p className="text-sm text-red-400 pt-2">{hoursError}</p>}
              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" className="rounded-sm" disabled={hoursSaving}>
                  {hoursSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Zapisywanie…</> : <><Save className="h-4 w-4 mr-2" />Zapisz godziny</>}
                </Button>
                {hoursSaved && <span className="text-sm text-green-500 font-sans">✓ Zapisano</span>}
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Telegram tab ─────────────────────────────────────────────────── */}
      {activeTab === "telegram" && (
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
            <Send className="h-5 w-5 text-primary" /> Powiadomienia Telegram
          </h2>
          <p className="text-sm text-secondary-foreground/50 mb-8 font-sans">
            Po włączeniu każde nowe zamówienie wyśle wiadomość na Twojego Telegrama.
          </p>

          {/* Setup guide */}
          <div className="mb-8 p-5 border border-secondary-foreground/10 rounded-sm bg-secondary-foreground/[0.03] space-y-2">
            <p className="text-xs font-bold uppercase tracking-wider text-secondary-foreground/50 mb-3">Jak skonfigurować?</p>
            <ol className="text-sm text-secondary-foreground/70 font-sans space-y-2 list-decimal list-inside leading-relaxed">
              <li>Otwórz Telegram i wyszukaj <span className="font-mono bg-secondary-foreground/10 px-1 rounded">@BotFather</span></li>
              <li>Wyślij <span className="font-mono bg-secondary-foreground/10 px-1 rounded">/newbot</span> i postępuj zgodnie z instrukcją — otrzymasz <strong>Bot Token</strong></li>
              <li>Napisz do swojego nowego bota dowolną wiadomość, żeby aktywować czat</li>
              <li>Otwórz w przeglądarce: <span className="font-mono bg-secondary-foreground/10 px-1 rounded text-xs break-all">https://api.telegram.org/bot&lt;TOKEN&gt;/getUpdates</span> — skopiuj wartość <span className="font-mono bg-secondary-foreground/10 px-1 rounded">id</span> z pola <span className="font-mono bg-secondary-foreground/10 px-1 rounded">chat</span> jako <strong>Chat ID</strong></li>
              <li>Wklej token i Chat ID poniżej, zapisz i wyślij testową wiadomość</li>
            </ol>
          </div>

          {tgLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <form onSubmit={handleSaveTg} className="space-y-5">

              {/* Enable toggle */}
              <div className={cn(
                "flex items-center justify-between p-4 rounded-sm border transition-colors",
                tg.enabled ? "border-primary/30 bg-primary/5" : "border-secondary-foreground/15"
              )}>
                <div>
                  <p className="text-sm font-medium text-secondary-foreground">Powiadomienia aktywne</p>
                  <p className="text-xs text-secondary-foreground/50 mt-0.5">Wyślij SMS-podobne powiadomienie przy każdym zamówieniu</p>
                </div>
                <button type="button" onClick={() => setTg({ ...tg, enabled: !tg.enabled })}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none",
                    tg.enabled ? "bg-primary" : "bg-secondary-foreground/20"
                  )}>
                  <span className={cn(
                    "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
                    tg.enabled ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              {/* Bot Token */}
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">
                  Bot Token
                  {tg.botTokenSet && <span className="ml-2 text-green-500 normal-case tracking-normal">✓ zapisany</span>}
                </label>
                <input
                  type="password"
                  value={tg.botToken}
                  onChange={(e) => setTg({ ...tg, botToken: e.target.value })}
                  className={inputCls}
                  placeholder={tg.botTokenSet ? "Zostaw puste, żeby zachować obecny token" : "110201543:AAHdqTcvCH1vGWJxfSeofSz4MpinDEAypZc"}
                  autoComplete="off"
                />
              </div>

              {/* Chat ID */}
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Chat ID</label>
                <input
                  type="text"
                  value={tg.chatId}
                  onChange={(e) => setTg({ ...tg, chatId: e.target.value })}
                  className={inputCls}
                  placeholder="np. 123456789"
                />
              </div>

              {tgError && <p className="text-sm text-red-400">{tgError}</p>}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button type="submit" className="rounded-sm" disabled={tgSaving}>
                  {tgSaving ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Zapisywanie…</> : <><Save className="h-4 w-4 mr-2" />Zapisz ustawienia</>}
                </Button>

                <Button type="button" variant="outline"
                  className="rounded-sm border-secondary-foreground/20 text-secondary-foreground hover:bg-secondary-foreground/10"
                  onClick={handleTestTg} disabled={tgTesting || !tg.chatId}>
                  {tgTesting
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Wysyłanie…</>
                    : <><Send className="h-4 w-4 mr-2" />Wyślij testową wiadomość</>}
                </Button>

                {tgSaved && <span className="text-sm text-green-500 font-sans">✓ Zapisano</span>}
                {tgTestResult === "ok"   && <span className="text-sm text-green-500 font-sans">✓ Wiadomość wysłana!</span>}
                {tgTestResult === "fail" && <span className="text-sm text-red-400 font-sans">✗ Wysyłka nieudana</span>}
              </div>
            </form>
          )}
        </div>
      )}

      {/* ── Pizza tygodnia tab ───────────────────────────────────────────── */}
      {activeTab === "pizza-tygodnia" && (
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
            <Pizza className="h-5 w-5 text-primary" /> Pizza tygodnia
          </h2>
          <p className="text-sm text-secondary-foreground/50 mb-8 font-sans">
            Zmień nazwę, składniki i cenę specjalnej pizzy tygodnia. Zmiany są od razu widoczne w menu.
          </p>

          {ptLoading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <form onSubmit={handleSavePt} className="space-y-5">

              {/* Name */}
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">
                  Nazwa pizzy
                </label>
                <input
                  type="text"
                  value={pt.name}
                  onChange={(e) => setPt({ ...pt, name: e.target.value })}
                  className={inputCls}
                  placeholder="np. Pizza tygodnia — Tartufo"
                  required
                />
              </div>

              {/* Ingredients / description */}
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">
                  Składniki
                </label>
                <textarea
                  value={pt.description}
                  onChange={(e) => setPt({ ...pt, description: e.target.value })}
                  rows={4}
                  className={cn(inputCls, "resize-none")}
                  placeholder="np. Sos truflowy, mozzarella fior di latte, pieczarki leśne, parmezan, świeży tymianek."
                  required
                />
                <p className="text-xs text-secondary-foreground/40 mt-1 font-sans">
                  Ten opis pojawi się pod nazwą pizzy w menu.
                </p>
              </div>

              {/* Price */}
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">
                  Cena (zł)
                </label>
                <input
                  type="number"
                  min="1"
                  step="0.5"
                  value={pt.price || ""}
                  onChange={(e) => setPt({ ...pt, price: parseFloat(e.target.value) || 0 })}
                  className={cn(inputCls, "w-40")}
                  placeholder="38.00"
                  required
                />
              </div>

              {ptError && <p className="text-sm text-red-400">{ptError}</p>}

              <div className="flex items-center gap-3 pt-2">
                <Button type="submit" className="rounded-sm" disabled={ptSaving}>
                  {ptSaving
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Zapisywanie…</>
                    : <><Save className="h-4 w-4 mr-2" />Zapisz pizzę tygodnia</>}
                </Button>
                {ptSaved && <span className="text-sm text-green-500 font-sans">✓ Zapisano</span>}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
