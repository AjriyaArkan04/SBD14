import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRight, Calendar, Bell, CheckCircle, Clock, Heart,
  LayoutDashboard, LogOut, Settings, Star, Table2, User, Users,
  X, XCircle, Utensils, Filter, Plus, Minus, Eye, EyeOff, AlertCircle,
  MapPin, Edit2, Trash2, RefreshCw, CheckCircle2,
} from "lucide-react";
import { api } from "../api/client";

// ─── TYPES ────────────────────────────────────────────────────────────────────

type View = "landing" | "login" | "register" | "customer" | "admin";
type CustomerSection = "discover" | "reservations" | "favorites";
type AdminSection = "overview" | "tables" | "requests" | "settings";

interface AuthUser {
  id: string;
  name: string;
  email: string;
  initials: string;
  role: "customer" | "admin";
}

type Restaurant = {
  id: string;
  name: string;
  description?: string;
  address?: string;
  city?: string;
  cuisine?: string;
  phone?: string;
  opening_time?: string;
  closing_time?: string;
  is_active?: boolean;
  owner_id?: string;
};

type Table = {
  id: string;
  restaurant_id: string;
  table_number: string;
  capacity: number;
  status: "available" | "reserved" | "maintenance";
  location?: string;
  Restaurant?: { id: string; name: string };
};

type Reservation = {
  id: string;
  customer_id: string;
  restaurant_id: string;
  table_id: string;
  reservation_date: string;
  start_time: string;
  end_time: string;
  guest_count: number;
  status: "pending" | "confirmed" | "rejected" | "cancelled" | "completed";
  special_request?: string;
};

type ReservationWithIncludes = Reservation & {
  Restaurant?: { id: string; name: string; city?: string; address?: string };
  Table?: { id: string; table_number: string; capacity: number; location?: string };
  User?: { id: string; name: string; email: string };
};

// ─── TOAST ────────────────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "info";
interface ToastMsg { id: number; type: ToastType; message: string }

let toastIdCounter = 0;
let globalToastFn: ((t: ToastType, m: string) => void) | null = null;

function generateSessions(open: string, close: string) {
  const result: { start: string; end: string; label: string }[] = [];
  const toMins = (t: string) => {
    const [h, m] = t.slice(0, 5).split(":").map(Number);
    return h * 60 + m;
  };
  const toStr = (mins: number) => {
    const h = Math.floor(mins / 60).toString().padStart(2, "0");
    const m = (mins % 60).toString().padStart(2, "0");
    return `${h}:${m}`;
  };
  let cur = toMins(open);
  const end = toMins(close);
  while (cur + 90 <= end) {
    result.push({ start: toStr(cur), end: toStr(cur + 90), label: `${toStr(cur)} – ${toStr(cur + 90)}` });
    cur += 90;
  }
  return result;
}

function useToast() {
  const [toasts, setToasts] = useState<ToastMsg[]>([]);
  const show = useCallback((type: ToastType, message: string) => {
    const id = ++toastIdCounter;
    setToasts((p) => [...p, { id, type, message }]);
    setTimeout(() => setToasts((p) => p.filter((t) => t.id !== id)), 3500);
  }, []);
  globalToastFn = show;
  return { toasts, show };
}

function toast(type: ToastType, message: string) {
  globalToastFn?.(type, message);
}

function ToastContainer({ toasts }: { toasts: ToastMsg[] }) {
  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-sm shadow-lg text-sm font-mono border pointer-events-auto animate-in slide-in-from-right-4 fade-in duration-200 ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-[#059669]"
              : t.type === "error"
              ? "bg-red-50 border-red-200 text-red-600"
              : "bg-card border-border text-foreground"
          }`}
        >
          {t.type === "success" && <CheckCircle2 className="w-4 h-4 shrink-0" />}
          {t.type === "error" && <AlertCircle className="w-4 h-4 shrink-0" />}
          {t.type === "info" && <Bell className="w-4 h-4 shrink-0" />}
          <span>{t.message}</span>
        </div>
      ))}
    </div>
  );
}

// ─── STATUS BADGE ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-50 text-[#059669] border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    available: "bg-emerald-50 text-[#059669] border-emerald-200",
    reserved: "bg-amber-50 text-amber-700 border-amber-200",
    maintenance: "bg-muted text-muted-foreground border-border",
    completed: "bg-blue-50 text-blue-600 border-blue-200",
  };
  return (
    <span className={`inline-flex items-center font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

// ─── CONFIRM MODAL ─────────────────────────────────────────────────────────────

function ConfirmModal({
  title,
  message,
  confirmLabel = "Confirm",
  danger = false,
  onConfirm,
  onClose,
}: {
  title: string;
  message: string;
  confirmLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-sm p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-5 ${danger ? "bg-red-50 border border-red-200" : "bg-amber-50 border border-amber-200"}`}>
          <AlertCircle className={`w-6 h-6 ${danger ? "text-red-500" : "text-amber-600"}`} />
        </div>
        <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 text-sm px-4 py-2.5 rounded-sm border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
          <button onClick={onConfirm} className={`flex-1 text-sm px-4 py-2.5 rounded-sm text-white transition-colors ${danger ? "bg-red-500 hover:bg-red-600" : "bg-[#059669] hover:bg-[#047857]"}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── BOOKING MODAL ─────────────────────────────────────────────────────────────

function BookingModal({
  restaurant,
  user,
  onClose,
  onBooked,
}: {
  restaurant: Restaurant;
  user: AuthUser;
  onClose: () => void;
  onBooked: () => void;
}) {
  const [tables, setTables] = useState<Table[]>([]);
  const [selectedTable, setSelectedTable] = useState<string>("");
  const [guests, setGuests] = useState(2);
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchingTables, setFetchingTables] = useState(true);
  const [done, setDone] = useState(false);
  const [isAutoConfirm, setIsAutoConfirm] = useState(false);
  const [selectedDate, setSelectedDate] = useState("");
  const [sessions, setSessions] = useState<{ start: string; end: string; label: string }[]>([]);
  const [scheduleData, setScheduleData] = useState<{
  reservations: { table_id: string; start_time: string; end_time: string; status: string }[];
} | null>(null);
  const [selectedSessions, setSelectedSessions] = useState<number[]>([]);

  const fetchTables = useCallback(async (date: string, start?: string, end?: string) => {
    setFetchingTables(true);
    setSelectedTable("");
    try {
      const params: Record<string, string> = { date };
      if (start && end) {
        params.start_time = start + ":00";
        params.end_time = end + ":00";
      }
      const res = await api.get(`/api/tables/restaurant/${restaurant.id}/available`, { params });
      setTables((res.data?.tables ?? []) as Table[]);
    } catch {
      setTables([]);
    } finally {
      setFetchingTables(false);
    }
  }, [restaurant.id]);

  // Generate sesi 90 menit dari jam buka sampai tutup
  const generateSessions = (open: string, close: string) => {
    const result: { start: string; end: string; label: string }[] = [];
    const toMins = (t: string) => {
      const [h, m] = t.slice(0, 5).split(":").map(Number);
      return h * 60 + m;
    };
    const toStr = (mins: number) => {
      const h = Math.floor(mins / 60).toString().padStart(2, "0");
      const m = (mins % 60).toString().padStart(2, "0");
      return `${h}:${m}`;
    };
    let cur = toMins(open);
    const end = toMins(close);
    while (cur + 90 <= end) {
      result.push({ start: toStr(cur), end: toStr(cur + 90), label: `${toStr(cur)} – ${toStr(cur + 90)}` });
      cur += 90;
    }
    return result;
  };

  // Toggle sesi — harus berurutan
  const toggleSession = (idx: number) => {
    setSelectedSessions((prev) => {
      if (prev.includes(idx)) {
        // Kalau deselect, trim sesi setelah idx yang di-deselect
        return prev.filter((i) => i < idx);
      }
      // Hanya boleh pilih kalau berurutan
      const expected = prev.length === 0 ? idx : Math.max(...prev) + 1;
      if (idx !== expected) return prev;
      return [...prev, idx].sort((a, b) => a - b);
    });
  };
  
  const isSessionUnavailable = (idx: number) => {
    if (!scheduleData || sessions.length === 0) return false;
    const s = sessions[idx];
    const allTables = (scheduleData as any).tables as Table[] ?? [];
    if (allTables.length === 0) return false;
    const availableTablesInSession = allTables.filter((t) => {
      if (t.status === "maintenance") return false;
      const hasConflict = scheduleData.reservations.some((r) => {
        if (r.table_id !== t.id) return false;
        // Normalize ke HH:MM semua
        const rStart = r.start_time.slice(0, 5);
        const rEnd = r.end_time.slice(0, 5);
        const sStart = s.start.slice(0, 5);
        const sEnd = s.end.slice(0, 5);
        return rStart < sEnd && rEnd > sStart;
      });
      return !hasConflict;
    });
    return availableTablesInSession.length === 0;
  };

  const canSubmit = selectedTable && selectedDate && selectedSessions.length > 0 && guests > 0;

  const handleBook = async () => {
    if (!canSubmit) return;
    setLoading(true);
    try {
      const sortedSessions = [...selectedSessions].sort((a, b) => a - b);
      const startTime = sessions[sortedSessions[0]].start;
      const endTime = sessions[sortedSessions[sortedSessions.length - 1]].end;

      const response = await api.post("/api/reservations", {
        customer_id: user.id,
        restaurant_id: restaurant.id,
        table_id: selectedTable,
        reservation_date: selectedDate,
        start_time: startTime + ":00",
        end_time: endTime + ":00",
        guest_count: guests,
        special_request: note || undefined,
      });
      setIsAutoConfirm(response.data?.auto_confirmed ?? false);
      setDone(true);
      onBooked();
    } catch (err: any) {
      toast("error", err?.response?.data?.error ?? "Failed to create reservation.");
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-card rounded-sm p-12 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#059669]" />
          </div>
          <h3 className="font-display text-2xl text-foreground mb-2">Request Sent!</h3>
          <p className="text-sm text-muted-foreground leading-relaxed mt-2">
            {isAutoConfirm
              ? <>Your reservation at <span className="text-foreground font-medium">{restaurant.name}</span> has been confirmed automatically!</>
              : <>Your reservation at <span className="text-foreground font-medium">{restaurant.name}</span> is pending admin approval. You'll see the status in My Reservations.</>
            }
          </p>
          <button onClick={onClose} className="mt-8 w-full bg-[#059669] text-white text-sm py-3 rounded-sm hover:bg-[#047857] transition-colors">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="bg-card rounded-sm shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()} style={{ scrollbarWidth: "none" }}>
        <div className="flex items-center justify-between px-6 py-5 border-b border-border">
          <div>
            <h3 className="font-display text-xl text-foreground">{restaurant.name}</h3>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">{restaurant.cuisine} · {restaurant.city}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-sm flex items-center justify-center hover:bg-muted transition-colors">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Table */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Available Table</label>
            {!selectedDate ? (
              <p className="text-sm text-muted-foreground font-mono">Please select a date first.</p>
            ) : selectedSessions.length === 0 ? (
              <p className="text-sm text-muted-foreground font-mono">Please select a session to see available tables.</p>
            ) : fetchingTables ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-2"><RefreshCw className="w-3.5 h-3.5 animate-spin" /> Loading tables...</div>
            ) : tables.length === 0 ? (
              <p className="text-sm text-red-500 font-mono">No available tables for the selected session.</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {tables.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTable(t.id)}
                    className={`text-xs py-2.5 px-3 rounded-sm border transition-all text-left ${selectedTable === t.id ? "border-[#059669] bg-[#059669]/10 text-[#059669]" : "border-border text-foreground hover:border-[#059669]/50"}`}
                  >
                    <p className="font-mono font-medium">{t.table_number}</p>
                    <p className="text-muted-foreground mt-0.5">{t.capacity} seats{t.location ? ` · ${t.location}` : ""}</p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Date</label>
            <input
              type="date"
              value={selectedDate}
              min={new Date().toISOString().split("T")[0]}
              onChange={async (e) => {
                const date = e.target.value;
                setSelectedDate(date);
                setSelectedSessions([]);
                setTables([]);
                setScheduleData(null);
                if (restaurant.opening_time && restaurant.closing_time) {
                  const generated = generateSessions(restaurant.opening_time, restaurant.closing_time);
                  setSessions(generated);
                }
                // Fetch schedule untuk cek sesi yang sudah di-book
                try {
                  const res = await api.get(`/api/tables/restaurant/${restaurant.id}/schedule`, {
                    params: { date },
                  });
                  setScheduleData(res.data);
                } catch {
                  setScheduleData(null);
                }
              }}
              className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors"
            />
          </div>

          {/* Sessions */}
          {selectedDate && sessions.length > 0 && (
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">
                Session {selectedSessions.length > 1 && <span className="text-[#059669]">({selectedSessions.length} sessions · {sessions[selectedSessions[0]].start} – {sessions[selectedSessions[selectedSessions.length-1]].end})</span>}
              </label>
              <p className="text-[10px] text-muted-foreground font-mono mb-3">Select consecutive sessions. Each session is 90 minutes.</p>
              <div className="grid grid-cols-2 gap-2">
                {sessions.map((s, idx) => {
                  const isSelected = selectedSessions.includes(idx);
                  const maxSelected = selectedSessions.length > 0 ? Math.max(...selectedSessions) : -1;
                  const isNext = selectedSessions.length === 0 ? true : idx === maxSelected + 1;
                  const isUnavailable = isSessionUnavailable(idx);
                  const isSelectable = !isUnavailable && (isSelected || isNext);
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        const next = (() => {
                          if (selectedSessions.includes(idx)) return selectedSessions.filter((i) => i < idx).sort((a, b) => a - b);
                          const expected = selectedSessions.length === 0 ? idx : Math.max(...selectedSessions) + 1;
                          if (idx !== expected) return selectedSessions;
                          return [...selectedSessions, idx].sort((a, b) => a - b);
                        })();
                        setSelectedSessions(next);
                        if (next.length > 0 && selectedDate && restaurant.opening_time && restaurant.closing_time) {
                          const allSessions = generateSessions(restaurant.opening_time, restaurant.closing_time);
                          const start = allSessions[next[0]].start;
                          const end = allSessions[next[next.length - 1]].end;
                          fetchTables(selectedDate, start, end);
                        } else {
                          setTables([]);
                          setFetchingTables(false);
                        }
                      }}
                      disabled={!isSelectable}
                      className={`text-xs py-2.5 px-3 rounded-sm border transition-all text-left ${
                        isSelected
                          ? "border-[#059669] bg-[#059669]/10 text-[#059669]"
                          : isUnavailable
                          ? "border-red-100 bg-red-50/50 text-muted-foreground/40 cursor-not-allowed opacity-60"
                          : isSelectable
                          ? "border-border text-foreground hover:border-[#059669]/50"
                          : "border-border text-muted-foreground/40 cursor-not-allowed opacity-50"
                      }`}
                    >
                      <p className="font-mono font-medium">{s.label}</p>
                      {isUnavailable && <p className="text-[10px] text-red-400 mt-0.5">booked</p>}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Guests */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Party Size</label>
            <div className="flex items-center gap-4">
              <button onClick={() => setGuests(Math.max(1, guests - 1))} className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"><Minus className="w-4 h-4" /></button>
              <span className="font-display text-2xl text-foreground w-8 text-center">{guests}</span>
              <button onClick={() => setGuests(Math.min(20, guests + 1))} className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"><Plus className="w-4 h-4" /></button>
              <span className="text-sm text-muted-foreground">{guests === 1 ? "guest" : "guests"}</span>
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Special Requests <span className="text-muted-foreground/50">(optional)</span></label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Dietary restrictions, occasion, seating preferences..."
              className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors resize-none placeholder:text-muted-foreground"
            />
          </div>

          <button
            onClick={handleBook}
            disabled={!canSubmit || loading || tables.length === 0}
            className="w-full bg-[#059669] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#047857] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Request Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING ─────────────────────────────────────────────────────────────────

function LandingPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <div className="min-h-screen bg-background">
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/8 bg-[#141412]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Utensils className="w-5 h-5 text-[#059669]" />
            <span className="font-display text-xl text-white tracking-tight">Reservo</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {["About", "How it Works", "Contact"].map((link) => (
              <a key={link} href="#" className="text-sm text-white/60 hover:text-white transition-colors">{link}</a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("login")} className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">Login</button>
            <button onClick={() => onNavigate("register")} className="text-sm bg-[#059669] text-white px-5 py-2.5 rounded-sm hover:bg-[#047857] transition-colors">Register</button>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-end pb-24 md:pb-0 md:items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#141412]">
          <img src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&auto=format" alt="Fine dining" className="w-full h-full object-cover opacity-45" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/30 to-[#141412]/20" />
        </div>
        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-8">Reserve · Dine · Experience</p>
          <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-[1.08] mb-6">
            Every great meal<br />
            <em className="not-italic text-[#059669]">begins with a reservation</em>
          </h1>
          <p className="text-white/50 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Discover the finest restaurants and secure your table in seconds. No calls, no waiting — just dining.
          </p>
          <div className="bg-white shadow-2xl rounded-sm flex flex-col md:flex-row max-w-3xl mx-auto overflow-hidden">
            <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-border">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type="text" placeholder="Restaurant or cuisine..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b md:border-b-0 md:border-r border-border">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm text-foreground outline-none min-w-[130px]" />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b md:border-b-0 border-border">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent text-sm text-foreground outline-none">
                {[1,2,3,4,5,6,7,8,9,10].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}
              </select>
            </div>
            <button onClick={() => onNavigate("login")} className="bg-[#059669] text-white text-sm font-medium px-7 py-3.5 hover:bg-[#047857] transition-colors flex items-center justify-center gap-2 shrink-0">
              Find a Table <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ─── LOGIN ────────────────────────────────────────────────────────────────────

function LoginPage({ onNavigate, onLogin }: { onNavigate: (v: View) => void; onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", { email, password });
      const token = data?.token as string | undefined;
      const u = data?.user as any;
      if (!token || !u) { setError("Login failed: missing token/user."); return; }
      localStorage.setItem("auth_token", token);
      const nameFromServer: string = u.name ?? (email.split("@")[0] || "User");
      const initials = (nameFromServer || "U").trim().split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase();
      const role: "admin" | "customer" = u.role === "admin" ? "admin" : "customer";
      onLogin({ id: String(u.id), name: nameFromServer, email: u.email, initials, role });
      onNavigate(role === "admin" ? "admin" : "customer");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#141412] flex-col justify-between p-12 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=1200&h=900&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/40 to-transparent" />
        <div className="relative z-10"><div className="flex items-center gap-2"><Utensils className="w-5 h-5 text-[#059669]" /><span className="font-display text-xl text-white">Reservo</span></div></div>
        <div className="relative z-10">
          <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-4">Welcome back</p>
          <h2 className="font-display text-4xl text-white font-light leading-snug mb-4">Your next great meal<br />is one click away.</h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm mb-8">Don't have an account?{" "}<button onClick={() => onNavigate("register")} className="text-[#059669] hover:underline font-medium">Register</button></p>
          {error && <div className="mb-5 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Password</label>
                <button className="text-xs text-[#059669] hover:underline font-mono" type="button">Forgot password?</button>
              </div>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" onKeyDown={(e) => e.key === "Enter" && handleLogin()} className="w-full bg-input-background text-foreground text-sm px-4 py-3 pr-12 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" />
                <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
            </div>
            <button onClick={handleLogin} disabled={loading} className="w-full bg-[#059669] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#047857] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── REGISTER ─────────────────────────────────────────────────────────────────

function RegisterPage({ onNavigate, onLogin }: { onNavigate: (v: View) => void; onLogin: (user: AuthUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-[#059669]"];

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) { setError("Please fill in all fields."); return; }
    if (!email.includes("@")) { setError("Please enter a valid email address."); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    if (password !== confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      await api.post("/api/users/register", { name: name.trim(), email, password, role: "customer" });
      onNavigate("login");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="hidden lg:flex lg:w-1/2 relative bg-[#141412] flex-col justify-between p-12 overflow-hidden">
        <img src="https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=1200&h=900&fit=crop&auto=format" alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/40 to-transparent" />
        <div className="relative z-10"><div className="flex items-center gap-2"><Utensils className="w-5 h-5 text-[#059669]" /><span className="font-display text-xl text-white">Reservo</span></div></div>
        <div className="relative z-10">
          <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-4">Join Reservo</p>
          <h2 className="font-display text-4xl text-white font-light leading-snug mb-4">Start your dining<br />journey today.</h2>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <h1 className="font-display text-3xl text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground text-sm mb-8">Already have an account?{" "}<button onClick={() => onNavigate("login")} className="text-[#059669] hover:underline font-medium">Sign in</button></p>
          {error && <div className="mb-5 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-red-600 text-sm">{error}</p></div>}
          <div className="space-y-4">
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Full Name</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your full name" className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" /></div>
            <div><label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" /></div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Password</label>
              <div className="relative">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 6 characters" className="w-full bg-input-background text-foreground text-sm px-4 py-3 pr-12 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" />
                <button onClick={() => setShowPassword(!showPassword)} type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button>
              </div>
              {password && <div className="mt-2 flex items-center gap-2"><div className="flex gap-1 flex-1">{[1,2,3].map((lvl) => <div key={lvl} className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= lvl ? strengthColor[passwordStrength] : "bg-muted"}`} />)}</div><span className="text-[10px] font-mono text-muted-foreground">{strengthLabel[passwordStrength]}</span></div>}
            </div>
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Confirm Password</label>
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" onKeyDown={(e) => e.key === "Enter" && handleRegister()} className={`w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border outline-none transition-colors placeholder:text-muted-foreground ${confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-400" : "border-transparent focus:border-[#059669]"}`} />
              {confirmPassword && confirmPassword !== password && <p className="text-red-500 text-[10px] font-mono mt-1">Passwords do not match</p>}
            </div>
            <button onClick={handleRegister} disabled={loading} className="w-full bg-[#059669] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#047857] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── CUSTOMER DASHBOARD ───────────────────────────────────────────────────────

function CustomerDashboard({ onNavigate, user }: { onNavigate: (v: View) => void; user: AuthUser | null }) {
  const [activeSection, setActiveSection] = useState<CustomerSection>("discover");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<ReservationWithIncludes[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [bookingRestaurant, setBookingRestaurant] = useState<Restaurant | null>(null);
  const [cancelTarget, setCancelTarget] = useState<ReservationWithIncludes | null>(null);
  const [loadingRestaurants, setLoadingRestaurants] = useState(true);
  const [loadingReservations, setLoadingReservations] = useState(false);

  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  // Fetch restaurants
  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get("/api/restaurants");
        setRestaurants((res.data?.restaurants ?? []) as Restaurant[]);
      } catch { setRestaurants([]); }
      finally { setLoadingRestaurants(false); }
    };
    load();
  }, []);

  // Fetch reservations when on that tab
  const loadReservations = useCallback(async () => {
    if (!user?.id) return;
    setLoadingReservations(true);
    try {
      const res = await api.get(`/api/reservations/customer/${user.id}`);
      setReservations((res.data?.reservations ?? []) as ReservationWithIncludes[]);
    } catch { setReservations([]); }
    finally { setLoadingReservations(false); }
  }, [user?.id]);

  useEffect(() => {
    if (activeSection === "reservations") loadReservations();
  }, [activeSection, loadReservations]);

  const handleCancelConfirm = async () => {
    if (!cancelTarget) return;
    try {
      await api.patch(`/api/reservations/${cancelTarget.id}/cancel`);
      toast("success", "Reservation cancelled.");
      setReservations((prev) => prev.map((r) => r.id === cancelTarget.id ? { ...r, status: "cancelled" } : r));
    } catch (err: any) {
      toast("error", err?.response?.data?.error ?? "Failed to cancel reservation.");
    } finally {
      setCancelTarget(null);
    }
  };

  const toggleFavorite = (id: string) => setFavorites((prev) => prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]);

  const cuisines = ["All", ...Array.from(new Set(restaurants.map((r) => r.cuisine).filter(Boolean))) as string[]];
  const filtered = restaurants.filter((r) => {
    const matchSearch = (r.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCuisine = cuisine === "All" || (r.cuisine ?? "").toLowerCase() === cuisine.toLowerCase();
    return matchSearch && matchCuisine;
  });

  const displayName = user?.name ?? "Guest";
  const displayInitials = user?.initials ?? "G";

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Utensils className="w-5 h-5 text-[#059669]" />
            <span className="font-display text-xl text-foreground tracking-tight">Reservo</span>
          </button>
          <nav className="hidden md:flex items-center gap-6">
            {([{ id: "discover", label: "Discover" }, { id: "reservations", label: "My Reservations" }, { id: "favorites", label: "Favorites" }] as { id: CustomerSection; label: string }[]).map(({ id, label }) => (
              <button key={id} onClick={() => setActiveSection(id)} className={`text-sm transition-colors relative ${activeSection === id ? "text-[#059669] font-medium" : "text-muted-foreground hover:text-foreground"}`}>
                {label}
                {id === "reservations" && pendingCount > 0 && <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-[#059669] rounded-full text-[9px] text-white flex items-center justify-center font-mono">{pendingCount}</span>}
              </button>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveSection("reservations")} className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />}
            </button>
            <button onClick={() => { localStorage.removeItem("auth_token"); onNavigate("landing"); }} className="w-9 h-9 rounded-sm bg-[#059669] flex items-center justify-center hover:bg-[#047857] transition-colors" title="Sign out">
              <span className="text-white text-xs font-medium">{displayInitials}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-1">{activeSection === "discover" ? "Good evening," : activeSection === "reservations" ? "Your bookings," : "Your saved restaurants,"}</p>
          <h1 className="font-display text-3xl text-foreground">{displayName}</h1>
        </div>

        {/* ── DISCOVER ── */}
        {activeSection === "discover" && (
          <>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 bg-card border border-border rounded-sm px-4 py-3 focus-within:border-[#059669] transition-colors">
                  <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
                  <input type="text" placeholder="Search restaurants or cuisines..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none" />
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {cuisines.map((c) => (
                  <button key={c} onClick={() => setCuisine(c)} className={`text-xs font-mono px-4 py-1.5 rounded-sm border transition-all ${cuisine === c ? "bg-[#059669] text-white border-[#059669]" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}>{c}</button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">Showing <span className="text-foreground font-medium">{filtered.length}</span> restaurants</p>
            </div>

            {loadingRestaurants ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Loading restaurants...</div>
            ) : filtered.length === 0 ? (
              <div className="col-span-12 py-20 text-center text-muted-foreground text-sm">No restaurants available yet.</div>
            ) : (
              <div className="grid grid-cols-12 gap-5 mb-16">
                {filtered.map((r) => (
                  <div key={r.id} className="col-span-12 sm:col-span-6 lg:col-span-4 bg-card border border-border rounded-sm overflow-hidden group hover:border-[#059669]/40 hover:shadow-md transition-all">
                    <div className="relative h-40 bg-muted overflow-hidden">
                      <div className="absolute inset-0 flex items-center justify-center text-muted-foreground/20">
                        <Utensils className="w-12 h-12" />
                      </div>
                      <div className="absolute top-3 right-3">
                        <button onClick={() => toggleFavorite(r.id)} className={`w-8 h-8 rounded-sm flex items-center justify-center transition-colors ${favorites.includes(r.id) ? "bg-red-500 text-white" : "bg-black/40 backdrop-blur-sm text-white/70 hover:text-white"}`}>
                          <Heart className={`w-3.5 h-3.5 ${favorites.includes(r.id) ? "fill-white" : ""}`} />
                        </button>
                      </div>
                      {r.is_active === false && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><span className="text-white text-xs font-mono">Temporarily Closed</span></div>
                      )}
                    </div>
                    <div className="p-5">
                      <h3 className="font-display text-lg text-foreground leading-tight">{r.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.cuisine ?? "Restaurant"}</p>
                      {r.address && <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-2"><MapPin className="w-3 h-3" /><span>{r.city ?? r.address}</span></div>}
                      {r.opening_time && r.closing_time && (
                        <div className="flex items-center gap-1.5 text-muted-foreground text-xs mt-1"><Clock className="w-3 h-3" /><span className="font-mono">{r.opening_time.slice(0,5)} – {r.closing_time.slice(0,5)}</span></div>
                      )}
                      {r.description && <p className="text-xs text-muted-foreground mt-2 line-clamp-2 leading-relaxed">{r.description}</p>}
                      <button
                        onClick={() => user ? setBookingRestaurant(r) : onNavigate("login")}
                        disabled={r.is_active === false}
                        className="w-full mt-4 bg-[#059669] text-white text-sm py-2.5 rounded-sm hover:bg-[#047857] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Reserve a Table
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

       {/* ── MY RESERVATIONS ── */}
        {activeSection === "reservations" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-foreground">My Reservations</h2>
                <p className="text-muted-foreground text-sm mt-1">Track and manage your upcoming bookings</p>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={loadReservations} className="w-8 h-8 flex items-center justify-center rounded-sm hover:bg-muted transition-colors" title="Refresh"><RefreshCw className="w-3.5 h-3.5 text-muted-foreground" /></button>
                <button onClick={() => setActiveSection("discover")} className="text-xs font-mono uppercase tracking-widest text-[#059669] hover:underline flex items-center gap-1"><Plus className="w-3.5 h-3.5" /> New</button>
              </div>
            </div>
            {loadingReservations ? (
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-12 justify-center"><RefreshCw className="w-4 h-4 animate-spin" /> Loading reservations...</div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-sm">
                <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No reservations yet.</p>
                <button onClick={() => setActiveSection("discover")} className="mt-4 text-sm text-[#059669] hover:underline">Discover restaurants →</button>
              </div>
            ) : (
              <div className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border">
                  <p className="col-span-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Restaurant</p>
                  <p className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Date</p>
                  <p className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Time</p>
                  <p className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Guests</p>
                  <p className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Table</p>
                  <p className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Status</p>
                  <p className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-right">Action</p>
                </div>
                <div className="divide-y divide-border">
                  {reservations.map((res) => (
                    <div key={res.id}>
                      <div className="grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/40 transition-colors">
                        <div className="col-span-3"><p className="font-medium text-sm text-foreground truncate">{res.Restaurant?.name ?? "—"}</p></div>
                        <div className="col-span-2"><p className="text-sm text-foreground font-mono">{res.reservation_date}</p></div>
                        <div className="col-span-2"><p className="text-xs text-muted-foreground font-mono">{res.start_time?.slice(0,5)} – {res.end_time?.slice(0,5)}</p></div>
                        <div className="col-span-1"><p className="text-sm font-mono text-foreground">{res.guest_count}</p></div>
                        <div className="col-span-2"><p className="text-xs font-mono text-muted-foreground">{res.Table?.table_number ?? "—"}</p></div>
                        <div className="col-span-1"><StatusBadge status={res.status} /></div>
                        <div className="col-span-1 flex justify-end">
                          {(res.status === "pending" || res.status === "confirmed") && (
                            <button onClick={() => setCancelTarget(res)} className="text-xs text-muted-foreground hover:text-red-500 transition-colors font-mono">Cancel</button>
                          )}
                        </div>
                      </div>
                      {res.status === "rejected" && res.rejection_reason && (
                        <div className="px-6 py-3 bg-red-50 border-t border-red-100">
                          <p className="text-[10px] font-mono uppercase tracking-widest text-red-400 mb-0.5">Rejection Reason</p>
                          <p className="text-xs text-red-600">{res.rejection_reason}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FAVORITES ── */}
        {activeSection === "favorites" && (
          <div>
            <div className="mb-6">
              <h2 className="font-display text-2xl text-foreground">Saved Restaurants</h2>
              <p className="text-muted-foreground text-sm mt-1">{favorites.length} restaurant{favorites.length !== 1 ? "s" : ""} saved</p>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-sm">
                <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No favorites yet.</p>
                <button onClick={() => setActiveSection("discover")} className="mt-4 text-sm text-[#059669] hover:underline">Discover restaurants →</button>
              </div>
            ) : (
              <div className="grid grid-cols-12 gap-5">
                {restaurants.filter((r) => favorites.includes(r.id)).map((r) => (
                  <div key={r.id} className="col-span-12 sm:col-span-6 lg:col-span-4 bg-card border border-border rounded-sm overflow-hidden">
                    <div className="p-5">
                      <div className="flex items-start justify-between">
                        <div><h3 className="font-display text-lg text-foreground">{r.name}</h3><p className="text-xs text-muted-foreground font-mono mt-0.5">{r.cuisine} · {r.city}</p></div>
                        <button onClick={() => toggleFavorite(r.id)} className="w-8 h-8 rounded-sm bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"><Heart className="w-3.5 h-3.5 fill-white" /></button>
                      </div>
                      <button onClick={() => setBookingRestaurant(r)} className="w-full mt-4 bg-[#059669] text-white text-sm py-2.5 rounded-sm hover:bg-[#047857] transition-colors">Reserve a Table</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {bookingRestaurant && user && (
        <BookingModal
          restaurant={bookingRestaurant}
          user={user}
          onClose={() => setBookingRestaurant(null)}
          onBooked={() => { setBookingRestaurant(null); toast("success", "Reservation sent — awaiting confirmation."); if (activeSection === "reservations") loadReservations(); }}
        />
      )}

      {cancelTarget && (
        <ConfirmModal
          title="Cancel Reservation?"
          message={`Are you sure you want to cancel your reservation at ${cancelTarget.Restaurant?.name ?? "this restaurant"}?`}
          confirmLabel="Yes, Cancel"
          danger
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelTarget(null)}
        />
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ──────────────────────────────────────────────────────────

function AdminDashboard({ onNavigate, user }: { onNavigate: (v: View) => void; user: AuthUser | null }) {
  const [activeSection, setActiveSection] = useState<AdminSection>("requests");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [requests, setRequests] = useState<ReservationWithIncludes[]>([]);
  const [tableFilter, setTableFilter] = useState("All");
  const [restaurantFilter, setRestaurantFilter] = useState("All");

  // Add Restaurant form state
  const emptyRestaurant = { name: "", description: "", address: "", city: "", cuisine: "", phone: "", opening_time: "08:00", closing_time: "22:00" };
  const [newRestaurant, setNewRestaurant] = useState(emptyRestaurant);
  const [addingRestaurant, setAddingRestaurant] = useState(false);
  const [restaurantError, setRestaurantError] = useState("");

  // Add Table form state
  const emptyTable = { restaurant_id: "", table_number: "", capacity: 2, status: "available" as Table["status"], location: "" };
  const [newTable, setNewTable] = useState(emptyTable);
  const [addingTable, setAddingTable] = useState(false);
  const [tableError, setTableError] = useState("");

  // Action states
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ReservationWithIncludes | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [deleteRestTarget, setDeleteRestTarget] = useState<Restaurant | null>(null);
  const [deleteTableTarget, setDeleteTableTarget] = useState<Table | null>(null);

  const pendingCount = requests.filter((r) => r.status === "pending").length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  // Filtered tables (by status + restaurant)
  const filteredTables = tables.filter((t) => {
    const statusMatch = tableFilter === "All" || t.status === tableFilter.toLowerCase();
    const restMatch = restaurantFilter === "All" || t.restaurant_id === restaurantFilter;
    return statusMatch && restMatch;
  });

  const displayName = user?.name ?? "Restaurant Manager";
  const displayInitials = user?.initials ?? "RM";

  const handleTableStatusChange = async (t: Table, status: Table["status"]) => {
  try {
    await api.patch(`/api/tables/${t.id}/status`, { status });
    setTables((prev) => prev.map((x) => x.id === t.id ? { ...x, status } : x));
    toast("success", `Table ${t.table_number} status updated to ${status}.`);
  } catch (err: any) {
    toast("error", err?.response?.data?.error ?? "Failed to update table status.");
  }
};

  // Load data
  const loadAll = useCallback(async () => {
    try {
      const [rRes, tRes, reqRes] = await Promise.all([
        api.get("/api/restaurants"),
        api.get("/api/tables"),
        api.get("/api/reservations"),
      ]);
      setRestaurants((rRes.data?.restaurants ?? []) as Restaurant[]);
      setTables((tRes.data?.tables ?? []) as Table[]);
      const allRes = (reqRes.data?.reservations ?? []) as ReservationWithIncludes[];
      // Show all non-completed, non-cancelled reservations in requests
      setRequests(allRes.filter((r) => !["completed", "cancelled"].includes(r.status)));
    } catch {
      setRestaurants([]); setTables([]); setRequests([]);
    }
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  // ── ADD RESTAURANT ──
  const handleAddRestaurant = async () => {
    setRestaurantError("");
    if (!newRestaurant.name.trim()) { setRestaurantError("Restaurant name is required."); return; }
    if (!newRestaurant.address.trim()) { setRestaurantError("Address is required."); return; }
    if (!newRestaurant.city.trim()) { setRestaurantError("City is required."); return; }
    setAddingRestaurant(true);
    try {
      await api.post("/api/restaurants", {
        name: newRestaurant.name.trim(),
        description: newRestaurant.description || undefined,
        address: newRestaurant.address.trim(),
        city: newRestaurant.city.trim(),
        cuisine: newRestaurant.cuisine || undefined,
        phone: newRestaurant.phone || undefined,
        opening_time: newRestaurant.opening_time + ":00",
        closing_time: newRestaurant.closing_time + ":00",
        owner_id: user?.id,
      });
      toast("success", `"${newRestaurant.name}" added successfully.`);
      setNewRestaurant(emptyRestaurant);
      const rRes = await api.get("/api/restaurants");
      setRestaurants((rRes.data?.restaurants ?? []) as Restaurant[]);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to create restaurant.";
      setRestaurantError(msg);
      toast("error", msg);
    } finally {
      setAddingRestaurant(false);
    }
  };

  // ── ADD TABLE ──
  const handleAddTable = async () => {
    setTableError("");
    if (!newTable.restaurant_id) { setTableError("Please select a restaurant."); return; }
    if (!newTable.table_number.trim()) { setTableError("Table number is required."); return; }
    if (newTable.capacity < 1) { setTableError("Capacity must be at least 1."); return; }
    setAddingTable(true);
    try {
      await api.post("/api/tables", {
        restaurant_id: newTable.restaurant_id,
        table_number: newTable.table_number.trim(),
        capacity: Number(newTable.capacity),
        status: newTable.status,
        location: newTable.location || undefined,
      });
      toast("success", `Table ${newTable.table_number} added successfully.`);
      setNewTable({ ...emptyTable, restaurant_id: newTable.restaurant_id });
      const tRes = await api.get("/api/tables");
      setTables((tRes.data?.tables ?? []) as Table[]);
    } catch (err: any) {
      const msg = err?.response?.data?.error ?? "Failed to create table.";
      setTableError(msg);
      toast("error", msg);
    } finally {
      setAddingTable(false);
    }
  };

  // ── APPROVE RESERVATION → auto-update table to reserved ──
  const handleApprove = async (req: ReservationWithIncludes) => {
    setActionLoading(req.id + "-approve");
    try {
      // 1. Confirm reservation
      await api.patch(`/api/reservations/${req.id}/confirm`);
      // 2. Auto-update table status to reserved
      await api.patch(`/api/tables/${req.table_id}/status`, { status: "reserved" });
      toast("success", `Reservation confirmed. Table ${req.Table?.table_number ?? ""} marked as reserved.`);
      // 3. Refresh state
      setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "confirmed" } : r));
      setTables((prev) => prev.map((t) => t.id === req.table_id ? { ...t, status: "reserved" } : t));
    } catch (err: any) {
      toast("error", err?.response?.data?.error ?? "Failed to confirm reservation.");
    } finally {
      setActionLoading(null);
    }
  };

  // ── REJECT RESERVATION → table stays available ──
  const handleReject = async (req: ReservationWithIncludes) => {
  if (!rejectReason.trim()) {
    toast("error", "Please enter a rejection reason.");
    return;
  }
  setActionLoading(req.id + "-reject");
  try {
    await api.patch(`/api/reservations/${req.id}/reject`, { rejection_reason: rejectReason.trim() });
    toast("success", "Reservation rejected.");
    setRequests((prev) => prev.map((r) => r.id === req.id ? { ...r, status: "rejected", rejection_reason: rejectReason } : r));
    setRejectTarget(null);
    setRejectReason("");
  } catch (err: any) {
    toast("error", err?.response?.data?.error ?? "Failed to reject reservation.");
  } finally {
    setActionLoading(null);
  }
};

  // ── DELETE RESTAURANT ──
  const handleDeleteRestaurant = async (r: Restaurant) => {
    try {
      await api.delete(`/api/restaurants/${r.id}`);
      toast("success", `"${r.name}" deleted.`);
      setRestaurants((prev) => prev.filter((x) => x.id !== r.id));
    } catch (err: any) {
      toast("error", err?.response?.data?.error ?? "Failed to delete restaurant.");
    } finally {
      setDeleteRestTarget(null);
    }
  };

  // ── DELETE TABLE ──
  const handleDeleteTable = async (t: Table) => {
    try {
      await api.delete(`/api/tables/${t.id}`);
      toast("success", `Table ${t.table_number} deleted.`);
      setTables((prev) => prev.filter((x) => x.id !== t.id));
    } catch (err: any) {
      toast("error", err?.response?.data?.error ?? "Failed to delete table.");
    } finally {
      setDeleteTableTarget(null);
    }
  };

  const navItems = [
    { id: "overview" as AdminSection, label: "Overview", icon: LayoutDashboard },
    { id: "tables" as AdminSection, label: "Tables & Restaurants", icon: Table2 },
    { id: "requests" as AdminSection, label: "Incoming Requests", icon: Bell, badge: pendingCount },
    { id: "settings" as AdminSection, label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#141412] fixed top-0 left-0 h-screen flex flex-col z-40">
        <div className="px-4 py-5 border-b border-white/8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-sm bg-[#059669]/20 border border-[#059669]/30 flex items-center justify-center shrink-0"><Utensils className="w-4 h-4 text-[#059669]" /></div>
            <div><p className="text-white text-sm font-medium">Reservo Admin</p><p className="text-white/40 text-[10px] font-mono">Restaurant Manager</p></div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button key={id} onClick={() => setActiveSection(id)} className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm transition-all group ${activeSection === id ? "bg-[#059669]/15 text-[#059669]" : "text-white/50 hover:text-white hover:bg-white/5"}`}>
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeSection === id ? "text-[#059669]" : "text-white/40 group-hover:text-white/70"}`} />
                <span>{label}</span>
              </div>
              {badge !== undefined && badge > 0 && <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${activeSection === id ? "bg-[#059669] text-white" : "bg-white/10 text-white/60"}`}>{badge}</span>}
            </button>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-sm bg-[#059669] flex items-center justify-center shrink-0"><span className="text-white text-xs font-medium">{displayInitials}</span></div>
            <div className="flex-1 min-w-0"><p className="text-white text-xs font-medium truncate">{displayName}</p><p className="text-white/35 text-[10px] font-mono">Admin</p></div>
          </div>
          <button onClick={() => { localStorage.removeItem("auth_token"); onNavigate("landing"); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-all text-sm">
            <LogOut className="w-4 h-4" /><span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="font-display text-xl text-foreground">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "tables" && "Tables & Restaurants"}
              {activeSection === "requests" && "Incoming Requests"}
              {activeSection === "settings" && "Settings"}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={loadAll} className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors" title="Refresh data"><RefreshCw className="w-4 h-4 text-muted-foreground" /></button>
            <button className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors" onClick={() => setActiveSection("requests")}>
              <Bell className="w-4 h-4 text-muted-foreground" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />}
            </button>
          </div>
        </header>

        <div className="flex-1 p-8">
          {/* Stats */}
          <div className="grid grid-cols-12 gap-4 mb-8">
            {[
              { label: "Restaurants", value: restaurants.length, sub: "registered" },
              { label: "Total Tables", value: tables.length, sub: "capacity tracked" },
              { label: "Available Now", value: availableCount, sub: "ready for guests" },
              { label: "Pending Requests", value: pendingCount, sub: "awaiting approval" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-card border border-border rounded-sm p-5">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="font-display text-4xl leading-none text-foreground mt-2">{value}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-wider">{sub}</p>
              </div>
            ))}
          </div>

          {/* ── OVERVIEW: show pending requests + table status summary ── */}
          {activeSection === "overview" && (
            <div className="space-y-8">
              <div>
                <h2 className="font-display text-xl text-foreground mb-4">Pending Requests</h2>
                {requests.filter((r) => r.status === "pending").length === 0 ? (
                  <div className="py-10 text-center bg-card border border-border rounded-sm text-muted-foreground text-sm">No pending requests.</div>
                ) : (
                  <div className="space-y-3">
                    {requests.filter((r) => r.status === "pending").slice(0, 5).map((req) => (
                      <RequestCard key={req.id} req={req} actionLoading={actionLoading} onApprove={handleApprove} onReject={() => setRejectTarget(req)} />
                    ))}
                    {requests.filter((r) => r.status === "pending").length > 5 && (
                      <button onClick={() => setActiveSection("requests")} className="w-full text-xs text-[#059669] font-mono hover:underline py-2">View all {requests.filter(r => r.status === "pending").length} pending requests →</button>
                    )}
                  </div>
                )}
              </div>
              <div>
                <h2 className="font-display text-xl text-foreground mb-4">Recent Tables</h2>
                <TablesTable tables={tables.slice(0, 8)} restaurants={restaurants} onDelete={(t) => setDeleteTableTarget(t)} onStatusChange={handleTableStatusChange} /> 
                </div>
            </div>
          )}

          {/* ── TABLES & RESTAURANTS ── */}
          {activeSection === "tables" && (
            <div className="space-y-8">
              {/* Add Forms */}
              <div className="grid grid-cols-12 gap-6">
                {/* Add Restaurant */}
                <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-sm p-6">
                  <h2 className="font-display text-xl text-foreground mb-1">Add Restaurant</h2>
                  <p className="text-muted-foreground text-xs font-mono mb-5">Create a restaurant customers can book</p>
                  {restaurantError && <div className="mb-4 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-red-600 text-sm">{restaurantError}</p></div>}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Name <span className="text-red-400">*</span></label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newRestaurant.name} onChange={(e) => setNewRestaurant((s) => ({ ...s, name: e.target.value }))} placeholder="e.g. Sakura Sushi" />
                    </div>
                    <div className="col-span-12">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Description</label>
                      <textarea className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors resize-none placeholder:text-muted-foreground" value={newRestaurant.description} onChange={(e) => setNewRestaurant((s) => ({ ...s, description: e.target.value }))} placeholder="Short description…" rows={2} />
                    </div>
                    <div className="col-span-12">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Address <span className="text-red-400">*</span></label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newRestaurant.address} onChange={(e) => setNewRestaurant((s) => ({ ...s, address: e.target.value }))} placeholder="Street address" />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">City <span className="text-red-400">*</span></label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newRestaurant.city} onChange={(e) => setNewRestaurant((s) => ({ ...s, city: e.target.value }))} placeholder="e.g. Jakarta" />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Cuisine</label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newRestaurant.cuisine} onChange={(e) => setNewRestaurant((s) => ({ ...s, cuisine: e.target.value }))} placeholder="e.g. Japanese" />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Opening Time</label>
                      <input type="time" className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors" value={newRestaurant.opening_time} onChange={(e) => setNewRestaurant((s) => ({ ...s, opening_time: e.target.value }))} />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Closing Time</label>
                      <input type="time" className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors" value={newRestaurant.closing_time} onChange={(e) => setNewRestaurant((s) => ({ ...s, closing_time: e.target.value }))} />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Phone</label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newRestaurant.phone} onChange={(e) => setNewRestaurant((s) => ({ ...s, phone: e.target.value }))} placeholder="Optional" />
                    </div>
                    <div className="col-span-6 flex items-end">
                      <button onClick={handleAddRestaurant} disabled={addingRestaurant} className="w-full bg-[#059669] text-white text-sm font-medium py-2.5 rounded-sm hover:bg-[#047857] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {addingRestaurant ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create Restaurant</>}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Add Table */}
                <div className="col-span-12 lg:col-span-6 bg-card border border-border rounded-sm p-6">
                  <h2 className="font-display text-xl text-foreground mb-1">Add Table</h2>
                  <p className="text-muted-foreground text-xs font-mono mb-5">Assign a table to a restaurant</p>
                  {tableError && <div className="mb-4 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2"><AlertCircle className="w-4 h-4 text-red-500 shrink-0" /><p className="text-red-600 text-sm">{tableError}</p></div>}
                  <div className="grid grid-cols-12 gap-3">
                    <div className="col-span-12">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Restaurant <span className="text-red-400">*</span></label>
                      <select className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors" value={newTable.restaurant_id} onChange={(e) => setNewTable((s) => ({ ...s, restaurant_id: e.target.value }))}>
                        <option value="">Select restaurant…</option>
                        {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Table Number <span className="text-red-400">*</span></label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newTable.table_number} onChange={(e) => setNewTable((s) => ({ ...s, table_number: e.target.value }))} placeholder="T-01" />
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Capacity</label>
                      <div className="flex items-center gap-3">
                        <button onClick={() => setNewTable((s) => ({ ...s, capacity: Math.max(1, s.capacity - 1) }))} className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"><Minus className="w-3.5 h-3.5" /></button>
                        <span className="font-display text-xl text-foreground w-8 text-center">{newTable.capacity}</span>
                        <button onClick={() => setNewTable((s) => ({ ...s, capacity: Math.min(50, s.capacity + 1) }))} className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors shrink-0"><Plus className="w-3.5 h-3.5" /></button>
                      </div>
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Status</label>
                      <select className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors" value={newTable.status} onChange={(e) => setNewTable((s) => ({ ...s, status: e.target.value as Table["status"] }))}>
                        <option value="available">Available</option>
                        <option value="reserved">Reserved</option>
                        <option value="maintenance">Maintenance</option>
                      </select>
                    </div>
                    <div className="col-span-6">
                      <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-1.5">Location</label>
                      <input className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground" value={newTable.location} onChange={(e) => setNewTable((s) => ({ ...s, location: e.target.value }))} placeholder="e.g. Indoor, Window…" />
                    </div>
                    <div className="col-span-12">
                      <button onClick={handleAddTable} disabled={addingTable} className="w-full bg-[#059669] text-white text-sm font-medium py-2.5 rounded-sm hover:bg-[#047857] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                        {addingTable ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Plus className="w-4 h-4" /> Create Table</>}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tables list */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl text-foreground">All Tables</h2>
                </div>
                <TablesTable tables={tables} restaurants={restaurants} onDelete={(t) => setDeleteTableTarget(t)} onStatusChange={handleTableStatusChange} />
              </div>

              {/* Restaurants list */}
              <div>
                <h2 className="font-display text-xl text-foreground mb-4">All Restaurants</h2>
                {restaurants.length === 0 ? (
                  <div className="py-10 text-center bg-card border border-border rounded-sm text-muted-foreground text-sm">No restaurants yet. Add one above.</div>
                ) : (
                  <div className="bg-card border border-border rounded-sm overflow-hidden">
                    <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border">
                      {["Name", "City", "Cuisine", "Hours", "Status", "Action"].map((h, i) => (
                        <p key={h} className={`text-[10px] font-mono uppercase tracking-widest text-muted-foreground ${i === 5 ? "col-span-1 text-right" : i < 3 ? "col-span-2" : "col-span-2"}`}>{h}</p>
                      ))}
                    </div>
                    <div className="divide-y divide-border">
                      {restaurants.map((r) => (
                        <div key={r.id} className="grid grid-cols-12 gap-4 px-6 py-3 items-center hover:bg-muted/40 transition-colors">
                          <div className="col-span-2"><p className="text-sm font-medium text-foreground truncate">{r.name}</p></div>
                          <div className="col-span-2"><p className="text-sm text-muted-foreground font-mono">{r.city ?? "—"}</p></div>
                          <div className="col-span-2"><p className="text-sm text-muted-foreground">{r.cuisine ?? "—"}</p></div>
                          <div className="col-span-2"><p className="text-xs text-muted-foreground font-mono">{r.opening_time?.slice(0,5) ?? "—"} – {r.closing_time?.slice(0,5) ?? "—"}</p></div>
                          <div className="col-span-2"><StatusBadge status={r.is_active !== false ? "available" : "maintenance"} /></div>
                          <div className="col-span-2 flex justify-end">
                            <button onClick={() => setDeleteRestTarget(r)} className="text-xs text-red-400 hover:text-red-600 transition-colors font-mono flex items-center gap-1 px-2 py-1 border border-red-200 rounded-sm hover:border-red-300"><Trash2 className="w-3 h-3" /> Delete</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── INCOMING REQUESTS ── */}
          {activeSection === "requests" && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-foreground">Incoming Requests</h2>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5">{pendingCount} pending · requires action</p>
                </div>
                <button onClick={loadAll} className="flex items-center gap-2 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"><RefreshCw className="w-3.5 h-3.5" /> Refresh</button>
              </div>
              {requests.length === 0 ? (
                <div className="py-12 text-center bg-card border border-border rounded-sm text-muted-foreground text-sm">No incoming requests.</div>
              ) : (
                <div className="space-y-3">
                  {requests.map((req) => (
                    <RequestCard key={req.id} req={req} actionLoading={actionLoading} onApprove={handleApprove} onReject={() => setRejectTarget(req)} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── SETTINGS ── */}
          {activeSection === "settings" && (
            <div className="bg-card border border-border rounded-sm p-8 max-w-2xl">
              <h3 className="font-display text-xl text-foreground mb-6">Admin Settings</h3>
              <div className="space-y-5">
                {[{ label: "Admin Name", value: displayName }, { label: "Email", value: user?.email ?? "" }].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">{label}</label>
                    <input defaultValue={value} className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors" />
                  </div>
                ))}
                <div className="pt-2">
                  <button onClick={() => toast("success", "Settings saved.")} className="bg-[#059669] text-white text-sm px-6 py-2.5 rounded-sm hover:bg-[#047857] transition-colors">Save Changes</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={() => { setRejectTarget(null); setRejectReason(""); }}>
          <div className="bg-card rounded-sm p-8 max-w-sm w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mb-5 bg-red-50 border border-red-200">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Reject Reservation?</h3>
            <p className="text-muted-foreground text-sm leading-relaxed mb-4">
              Rejecting reservation from <span className="text-foreground font-medium">{rejectTarget.User?.name ?? "this guest"}</span>. Please provide a reason.
            </p>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="e.g. Restaurant fully booked, table unavailable..."
              rows={3}
              className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-red-400 outline-none transition-colors placeholder:text-muted-foreground resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectTarget(null); setRejectReason(""); }} className="flex-1 text-sm px-4 py-2.5 rounded-sm border border-border text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
              <button
                onClick={() => handleReject(rejectTarget)}
                disabled={!rejectReason.trim()}
                className="flex-1 text-sm px-4 py-2.5 rounded-sm text-white bg-red-500 hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      {deleteRestTarget && (
        <ConfirmModal
          title="Delete Restaurant?"
          message={`Delete "${deleteRestTarget.name}"? This will also remove all associated tables.`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDeleteRestaurant(deleteRestTarget)}
          onClose={() => setDeleteRestTarget(null)}
        />
      )}
      {deleteTableTarget && (
        <ConfirmModal
          title="Delete Table?"
          message={`Delete table ${deleteTableTarget.table_number}?`}
          confirmLabel="Delete"
          danger
          onConfirm={() => handleDeleteTable(deleteTableTarget)}
          onClose={() => setDeleteTableTarget(null)}
        />
      )}
    </div>
  );
}

// ─── REQUEST CARD (shared between overview & requests) ────────────────────────

function RequestCard({
  req,
  actionLoading,
  onApprove,
  onReject,
}: {
  req: ReservationWithIncludes;
  actionLoading: string | null;
  onApprove: (req: ReservationWithIncludes) => void;
  onReject: (req: ReservationWithIncludes) => void;
}) {
  const isPending = req.status === "pending";
  const [showSchedule, setShowSchedule] = useState(false);
  const [scheduleData, setScheduleData] = useState<{
    restaurant: { opening_time: string; closing_time: string };
    reservations: { table_id: string; start_time: string; end_time: string; status: string }[];
  } | null>(null);
  const [loadingAvail, setLoadingAvail] = useState(false);

  const checkAvailability = async () => {
    setLoadingAvail(true);
    setShowSchedule(true);
    try {
      const res = await api.get(`/api/tables/restaurant/${req.restaurant_id}/schedule`, {
        params: { date: req.reservation_date },
      });
      setScheduleData(res.data);
    } catch {
      setScheduleData(null);
    } finally {
      setLoadingAvail(false);
    }
  };

  const sessions = scheduleData
    ? generateSessions(scheduleData.restaurant.opening_time, scheduleData.restaurant.closing_time)
    : [];

  const isSessionBooked = (tableId: string, sessionStart: string, sessionEnd: string) => {
    if (!scheduleData) return false;
    return scheduleData.reservations.some((r) => {
      if (r.table_id !== tableId) return false;
      const rStart = r.start_time.slice(0, 5);
      const rEnd = r.end_time.slice(0, 5);
      return rStart < sessionEnd && rEnd > sessionStart;
    });
  };

  return (
    <div className={`bg-card border rounded-sm p-5 transition-all ${isPending ? "border-border hover:border-[#059669]/30" : req.status === "confirmed" ? "border-emerald-200 bg-emerald-50/20" : "border-red-100 bg-red-50/10 opacity-70"}`}>
      <div className="grid grid-cols-12 gap-4 items-start">
        <div className="col-span-12 md:col-span-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center shrink-0"><User className="w-4 h-4 text-muted-foreground" /></div>
            <div>
              <p className="text-sm font-medium text-foreground">{req.User?.name ?? "Guest"}</p>
              <p className="text-[10px] text-muted-foreground font-mono">{req.User?.email ?? "—"}</p>
            </div>
          </div>
        </div>
        <div className="col-span-12 md:col-span-5">
          <div className="flex flex-wrap gap-x-4 gap-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Utensils className="w-3.5 h-3.5" /><span className="font-medium text-foreground">{req.Restaurant?.name ?? "—"}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Calendar className="w-3.5 h-3.5" /><span className="font-mono">{req.reservation_date}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Clock className="w-3.5 h-3.5" /><span className="font-mono">{req.start_time?.slice(0,5)} – {req.end_time?.slice(0,5)}</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Users className="w-3.5 h-3.5" /><span className="font-mono">{req.guest_count} guests</span></div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Table2 className="w-3.5 h-3.5" /><span className="font-mono">{req.Table?.table_number ?? "—"}</span></div>
          </div>
          {req.special_request && (
            <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed border-l-2 border-border pl-3">"{req.special_request}"</p>
          )}
        </div>
        <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-3">
          {isPending ? (
            <>
              <button
                onClick={() => onReject(req)}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {actionLoading === req.id + "-reject" ? <div className="w-3.5 h-3.5 border-2 border-red-300 border-t-red-500 rounded-full animate-spin" /> : <XCircle className="w-3.5 h-3.5" />} Reject
              </button>
              <button
                onClick={() => onApprove(req)}
                disabled={!!actionLoading}
                className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[#059669] text-white hover:bg-[#047857] transition-colors disabled:opacity-50"
              >
                {actionLoading === req.id + "-approve" ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />} Approve
              </button>
            </>
          ) : (
            <StatusBadge status={req.status} />
          )}
        </div>
      </div>

      {/* Check Availability — hanya untuk pending */}
      {isPending && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            onClick={checkAvailability}
            className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground hover:text-foreground transition-colors"
          >
            {loadingAvail
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <Eye className="w-3.5 h-3.5" />
            }
            {showSchedule ? "Refresh Availability" : "Check Availability"}
          </button>

          {showSchedule && (
            <div className="mt-3">
              {loadingAvail ? (
                <p className="text-xs text-muted-foreground font-mono">Loading schedule...</p>
              ) : !scheduleData ? (
                <p className="text-xs text-red-500 font-mono">Failed to load schedule.</p>
              ) : sessions.length === 0 ? (
                <p className="text-xs text-muted-foreground font-mono">No sessions available.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="text-[10px] font-mono border-collapse">
                    <thead>
                      <tr>
                        <th className="text-left pr-4 py-1 text-muted-foreground uppercase tracking-widest">Table</th>
                        {sessions.map((s) => (
                          <th key={s.start} className="px-2 py-1 text-muted-foreground uppercase tracking-widest whitespace-nowrap">{s.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(scheduleData as any).tables?.map((t: Table) => (
                        <tr key={t.id} className={t.id === req.table_id ? "bg-amber-50" : ""}>
                          <td className="pr-4 py-1 text-foreground font-medium">
                            {t.table_number}
                            {t.id === req.table_id && <span className="ml-1 text-amber-600">(this)</span>}
                          </td>
                          {sessions.map((s) => {
                            const booked = isSessionBooked(t.id, s.start, s.end);
                            return (
                              <td key={s.start} className="px-2 py-1 text-center">
                                <span className={`inline-block w-5 h-5 rounded-sm border ${
                                  t.status === "maintenance"
                                    ? "bg-muted border-border"
                                    : booked
                                    ? "bg-red-100 border-red-300"
                                    : "bg-emerald-100 border-emerald-300"
                                }`} />
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="flex items-center gap-3 mt-2">
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /><span className="text-[10px] text-muted-foreground">Available</span></div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" /><span className="text-[10px] text-muted-foreground">Booked</span></div>
                    <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-amber-50 border border-amber-200 inline-block" /><span className="text-[10px] text-muted-foreground">This table</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── TABLES TABLE ─────────────────────────────────────────────────────────────

function TablesTable({
  tables,
  restaurants,
  onDelete,
  onStatusChange,
}: {
  tables: Table[];
  restaurants: Restaurant[];
  onDelete: (t: Table) => void;
  onStatusChange: (t: Table, status: Table["status"]) => void;
}) {
  const [scheduleDate, setScheduleDate] = useState(new Date().toISOString().split("T")[0]);
  const [schedule, setSchedule] = useState<{
    restaurant: { opening_time: string; closing_time: string };
    reservations: { table_id: string; start_time: string; end_time: string; status: string }[];
  } | null>(null);
  const [loadingSchedule, setLoadingSchedule] = useState(false);
  const [scheduleRestId, setScheduleRestId] = useState<string>("");

  // Auto-pick first restaurant
  useEffect(() => {
    if (restaurants.length > 0 && !scheduleRestId) {
      setScheduleRestId(restaurants[0].id);
    }
  }, [restaurants]);

  const fetchSchedule = useCallback(async (restId: string, date: string) => {
    if (!restId) return;
    setLoadingSchedule(true);
    try {
      const res = await api.get(`/api/tables/restaurant/${restId}/schedule`, { params: { date } });
      setSchedule(res.data);
    } catch {
      setSchedule(null);
    } finally {
      setLoadingSchedule(false);
    }
  }, []);

  useEffect(() => {
    if (scheduleRestId) fetchSchedule(scheduleRestId, scheduleDate);
  }, [scheduleRestId, scheduleDate, fetchSchedule]);

  const sessions = schedule ? generateSessions(schedule.restaurant.opening_time, schedule.restaurant.closing_time) : [];

  const isSessionBooked = (tableId: string, sessionStart: string, sessionEnd: string) => {
    if (!schedule) return false;
    return schedule.reservations.some((r) => {
      if (r.table_id !== tableId) return false;
      const rStart = r.start_time.slice(0, 5);
      const rEnd = r.end_time.slice(0, 5);
      return rStart < sessionEnd && rEnd > sessionStart;
    });
  };

  const filteredTables = tables.filter((t) => t.restaurant_id === scheduleRestId);

  if (tables.length === 0) return (
    <div className="py-10 text-center bg-card border border-border rounded-sm text-muted-foreground text-sm">No tables found.</div>
  );

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center gap-3 flex-wrap">
        <select
          value={scheduleRestId}
          onChange={(e) => setScheduleRestId(e.target.value)}
          className="bg-card border border-border text-foreground text-xs font-mono px-3 py-1.5 rounded-sm outline-none focus:border-[#059669] transition-colors"
        >
          {restaurants.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <input
          type="date"
          value={scheduleDate}
          onChange={(e) => setScheduleDate(e.target.value)}
          className="bg-card border border-border text-foreground text-xs font-mono px-3 py-1.5 rounded-sm outline-none focus:border-[#059669] transition-colors"
        />
        {loadingSchedule && <RefreshCw className="w-3.5 h-3.5 text-muted-foreground animate-spin" />}
      </div>

      {/* Table + Session Grid */}
      <div className="bg-card border border-border rounded-sm overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border bg-muted">
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-24 sticky left-0 bg-muted">Table</th>
              <th className="text-left px-4 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-20">Status</th>
              {sessions.map((s) => (
                <th key={s.start} className="px-3 py-3 font-mono text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">{s.label}</th>
              ))}
              <th className="px-4 py-3 text-right font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredTables.length === 0 ? (
              <tr><td colSpan={sessions.length + 3} className="text-center py-8 text-muted-foreground">No tables for this restaurant.</td></tr>
            ) : (
              filteredTables.map((t) => (
                <tr key={t.id} className="hover:bg-muted/40 transition-colors">
                  <td className="px-4 py-3 sticky left-0 bg-card">
                    <p className="font-mono font-medium text-foreground">{t.table_number}</p>
                    <p className="text-muted-foreground text-[10px] mt-0.5">{t.capacity} seats{t.location ? ` · ${t.location}` : ""}</p>
                  </td>
                  <td className="px-4 py-3">
                    {t.status === "maintenance" ? (
                      <span className="inline-flex items-center font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm bg-muted text-muted-foreground border-border">maintenance</span>
                    ) : (
                      <span className="inline-flex items-center font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm bg-emerald-50 text-[#059669] border-emerald-200">active</span>
                    )}
                  </td>
                  {sessions.map((s) => {
                    const booked = isSessionBooked(t.id, s.start, s.end);
                    const isMaintenance = t.status === "maintenance";
                    return (
                      <td key={s.start} className="px-3 py-3 text-center">
                        {isMaintenance ? (
                          <span className="inline-block w-6 h-6 rounded-sm bg-muted border border-border" title="Maintenance" />
                        ) : booked ? (
                          <span className="inline-block w-6 h-6 rounded-sm bg-red-100 border border-red-300" title="Booked" />
                        ) : (
                          <span className="inline-block w-6 h-6 rounded-sm bg-emerald-100 border border-emerald-300" title="Available" />
                        )}
                      </td>
                    );
                  })}
                  <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <select
                      value={t.status}
                      onChange={(e) => onStatusChange(t, e.target.value as Table["status"])}
                      className="text-[10px] font-mono bg-card border border-border rounded-sm px-2 py-1 outline-none focus:border-[#059669] transition-colors text-foreground"
                    >
                      <option value="available">Available</option>
                      <option value="reserved">Reserved</option>
                      <option value="maintenance">Maintenance</option>
                    </select>
                    <button onClick={() => onDelete(t)} className="text-xs text-red-400 hover:text-red-600 transition-colors px-2 py-1 border border-red-200 rounded-sm hover:border-red-300 flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* Legend */}
        <div className="px-4 py-3 border-t border-border flex items-center gap-4">
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Legend:</p>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-emerald-100 border border-emerald-300 inline-block" /><span className="text-[10px] font-mono text-muted-foreground">Available</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-red-100 border border-red-300 inline-block" /><span className="text-[10px] font-mono text-muted-foreground">Booked</span></div>
          <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-muted border border-border inline-block" /><span className="text-[10px] font-mono text-muted-foreground">Maintenance</span></div>
        </div>
      </div>
    </div>
  );
}

// ─── ROOT ─────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<AuthUser | null>(null);
  const { toasts, show } = useToast();

  // expose toast globally
  useEffect(() => { globalToastFn = show; }, [show]);

  const handleLogin = (u: AuthUser) => setUser(u);

  const handleNavigate = (v: View) => {
    if ((v === "customer" || v === "admin") && !user) { setView("login"); return; }
    setView(v);
  };

  return (
    <div className="min-h-screen bg-background antialiased" style={{ scrollbarWidth: "none" }}>
      {view === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {view === "login" && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {view === "register" && <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {view === "customer" && <CustomerDashboard onNavigate={handleNavigate} user={user} />}
      {view === "admin" && <AdminDashboard onNavigate={handleNavigate} user={user} />}
      <ToastContainer toasts={toasts} />
    </div>
  );
}