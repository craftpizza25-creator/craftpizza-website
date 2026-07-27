import { useState, useEffect, useCallback } from "react"
import { Trash2, Plus, LogOut, CalendarDays, Loader2, Clock, Save } from "lucide-react"
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

type AdminTab = "calendar" | "hours"

export default function Admin() {
  const [password, setPassword] = useState(() => sessionStorage.getItem("admin_pw") ?? "")
  const [authed, setAuthed]     = useState(false)
  const [activeTab, setActiveTab] = useState<AdminTab>("calendar")

  // ── Calendar events state ────────────────────────────────────────────────
  const [events, setEvents]     = useState<CalendarEvent[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")
  const [deleting, setDeleting] = useState<number | null>(null)

  const [form, setForm] = useState({
    title: "", description: "", date: "", startTime: "", endTime: "",
    type: "event" as EventType,
  })
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")

  // ── Opening hours state ──────────────────────────────────────────────────
  const [hours, setHours]           = useState<OpeningHour[]>([])
  const [hoursLoading, setHoursLoading] = useState(false)
  const [hoursSaving, setHoursSaving]   = useState(false)
  const [hoursError, setHoursError]     = useState("")
  const [hoursSaved, setHoursSaved]     = useState(false)

  const headers = { "Content-Type": "application/json", "x-admin-password": password }

  // ── Fetch calendar events ────────────────────────────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      const r = await fetch(`${BASE}/api/admin/calendar-events`, { headers })
      if (r.status === 401) { setAuthed(false); setError("Błędne hasło."); return }
      if (!r.ok) throw new Error("Błąd serwera")
      setEvents(await r.json())
      setAuthed(true)
      sessionStorage.setItem("admin_pw", password)
    } catch {
      setError("Nie można połączyć się z serwerem.")
    } finally {
      setLoading(false)
    }
  }, [password]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Fetch opening hours ──────────────────────────────────────────────────
  const fetchHours = useCallback(async () => {
    setHoursLoading(true)
    setHoursError("")
    try {
      const r = await fetch(`${BASE}/api/opening-hours`)
      if (!r.ok) throw new Error()
      setHours(await r.json())
    } catch {
      setHoursError("Nie można załadować godzin otwarcia.")
    } finally {
      setHoursLoading(false)
    }
  }, [])

  useEffect(() => {
    if (authed) {
      fetchEvents()
      fetchHours()
    }
  }, [authed]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Delete event ─────────────────────────────────────────────────────────
  async function handleDelete(id: number) {
    if (!confirm("Usunąć to wydarzenie?")) return
    setDeleting(id)
    try {
      await fetch(`${BASE}/api/admin/calendar-events/${id}`, { method: "DELETE", headers })
      setEvents((ev) => ev.filter((e) => e.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // ── Create event ─────────────────────────────────────────────────────────
  async function handleCreate(e: React.FormEvent) {
    e.preventDefault()
    setFormError("")
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
    } finally {
      setSaving(false)
    }
  }

  // ── Save opening hours ───────────────────────────────────────────────────
  function updateHour(id: number, patch: Partial<OpeningHour>) {
    setHours((prev) => prev.map((h) => h.id === id ? { ...h, ...patch } : h))
  }

  async function handleSaveHours(e: React.FormEvent) {
    e.preventDefault()
    setHoursSaving(true)
    setHoursError("")
    setHoursSaved(false)
    try {
      const r = await fetch(`${BASE}/api/admin/opening-hours`, {
        method: "PUT",
        headers,
        body: JSON.stringify(hours.map((h) => ({
          id:        h.id,
          openTime:  h.isClosed ? null : h.openTime,
          closeTime: h.isClosed ? null : h.closeTime,
          isClosed:  h.isClosed,
        }))),
      })
      if (r.status === 401) { setHoursError("Błędne hasło."); return }
      if (!r.ok) { setHoursError("Błąd zapisu."); return }
      setHours(await r.json())
      setHoursSaved(true)
      setTimeout(() => setHoursSaved(false), 3000)
    } catch {
      setHoursError("Nie można połączyć się z serwerem.")
    } finally {
      setHoursSaving(false)
    }
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
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                placeholder="••••••••"
                required
              />
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
      <div className="border-b border-secondary-foreground/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarDays className="h-5 w-5 text-primary" />
          <span className="font-serif text-xl font-bold">Panel admina</span>
          {/* Tabs */}
          <div className="flex items-center gap-1 ml-4 border border-secondary-foreground/15 rounded-sm p-0.5">
            <button
              onClick={() => setActiveTab("calendar")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm transition-colors",
                activeTab === "calendar"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-secondary-foreground/60 hover:text-secondary-foreground"
              )}
            >
              <CalendarDays className="h-3.5 w-3.5" /> Kalendarz
            </button>
            <button
              onClick={() => setActiveTab("hours")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-sm transition-colors",
                activeTab === "hours"
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-secondary-foreground/60 hover:text-secondary-foreground"
              )}
            >
              <Clock className="h-3.5 w-3.5" /> Godziny otwarcia
            </button>
          </div>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_pw"); setAuthed(false); setPassword("") }}
          className="flex items-center gap-1 text-sm text-secondary-foreground/50 hover:text-secondary-foreground transition-colors"
        >
          <LogOut className="h-4 w-4" /> Wyloguj
        </button>
      </div>

      {/* ── Calendar tab ───────────────────────────────────────────────────── */}
      {activeTab === "calendar" && (
        <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 lg:grid-cols-5 gap-10">

          {/* Add event form */}
          <aside className="lg:col-span-2">
            <h2 className="font-serif text-xl font-bold mb-6 flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" /> Dodaj wydarzenie
            </h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Tytuł *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                  placeholder="np. Pizza w plenerze!"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Opis</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm resize-none"
                  placeholder="Opcjonalny opis dla klientów…"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Data *</label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                  className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Od</label>
                  <input
                    type="time"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Do</label>
                  <input
                    type="time"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-secondary-foreground/60 uppercase tracking-wider mb-1">Typ</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as EventType })}
                  className="w-full px-3 py-2 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm"
                >
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

          {/* Events list */}
          <main className="lg:col-span-3">
            <h2 className="font-serif text-xl font-bold mb-6">
              Wszystkie wydarzenia <span className="text-secondary-foreground/40 text-base font-sans font-normal">({events.length})</span>
            </h2>

            {loading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
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
                    <div
                      key={ev.id}
                      className={cn(
                        "flex items-start justify-between gap-4 p-4 rounded-sm border transition-colors",
                        isPast
                          ? "border-secondary-foreground/5 opacity-50"
                          : "border-secondary-foreground/10 hover:border-secondary-foreground/20"
                      )}
                    >
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
                      <button
                        onClick={() => handleDelete(ev.id)}
                        disabled={deleting === ev.id}
                        className="shrink-0 text-secondary-foreground/30 hover:text-red-500 transition-colors disabled:opacity-30 mt-0.5"
                        title="Usuń"
                      >
                        {deleting === ev.id
                          ? <Loader2 className="h-4 w-4 animate-spin" />
                          : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </main>
        </div>
      )}

      {/* ── Opening hours tab ──────────────────────────────────────────────── */}
      {activeTab === "hours" && (
        <div className="max-w-2xl mx-auto px-6 py-10">
          <h2 className="font-serif text-xl font-bold mb-2 flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" /> Godziny otwarcia
          </h2>
          <p className="text-sm text-secondary-foreground/50 mb-8 font-sans">
            Zmiany są natychmiast widoczne na stronie Kalendarz.
          </p>

          {hoursLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <form onSubmit={handleSaveHours} className="space-y-3">
              {hours.map((h) => (
                <div
                  key={h.id}
                  className={cn(
                    "flex flex-wrap items-center gap-3 p-4 rounded-sm border transition-colors",
                    h.isClosed
                      ? "border-secondary-foreground/5 opacity-60"
                      : "border-secondary-foreground/15"
                  )}
                >
                  {/* Day name */}
                  <span className="w-28 text-sm font-medium text-secondary-foreground shrink-0">
                    {h.dayName}
                  </span>

                  {/* Closed toggle */}
                  <label className="flex items-center gap-2 text-sm text-secondary-foreground/60 cursor-pointer select-none shrink-0">
                    <input
                      type="checkbox"
                      checked={h.isClosed}
                      onChange={(e) => updateHour(h.id, { isClosed: e.target.checked })}
                      className="w-4 h-4 accent-primary rounded"
                    />
                    Nieczynne
                  </label>

                  {/* Time inputs — hidden when closed */}
                  {!h.isClosed && (
                    <div className="flex items-center gap-2 ml-auto">
                      <input
                        type="time"
                        value={h.openTime ?? ""}
                        onChange={(e) => updateHour(h.id, { openTime: e.target.value || null })}
                        className="px-2 py-1.5 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm w-28"
                      />
                      <span className="text-secondary-foreground/40 text-sm">–</span>
                      <input
                        type="time"
                        value={h.closeTime ?? ""}
                        onChange={(e) => updateHour(h.id, { closeTime: e.target.value || null })}
                        className="px-2 py-1.5 bg-secondary border border-secondary-foreground/20 text-secondary-foreground rounded-sm focus:outline-none focus:border-primary text-sm w-28"
                      />
                    </div>
                  )}
                </div>
              ))}

              {hoursError && <p className="text-sm text-red-400 pt-2">{hoursError}</p>}

              <div className="flex items-center gap-3 pt-4">
                <Button type="submit" className="rounded-sm" disabled={hoursSaving}>
                  {hoursSaving
                    ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Zapisywanie…</>
                    : <><Save className="h-4 w-4 mr-2" /> Zapisz godziny</>}
                </Button>
                {hoursSaved && (
                  <span className="text-sm text-green-500 font-sans">✓ Zapisano</span>
                )}
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
