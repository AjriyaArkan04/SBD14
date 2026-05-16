import { useState, useCallback } from "react";
import {
  Search, Calendar, Users, Clock, X, Check,
  MapPin, Star, LayoutDashboard, ArrowRight,
  Plus, Minus, LogOut, Bell, Settings, Utensils,
  ChevronRight, CheckCircle, XCircle, AlertCircle,
  Filter, Table2, Menu, User, TrendingUp,
} from "lucide-react";

type View = "landing" | "customer" | "admin";

const RESTAURANTS = [
  { id: 1, name: "Maison Blanc", cuisine: "French", rating: 4.9, reviews: 347, price: "$$$$", location: "Midtown", image: "photo-1414235077428-338989a2e8c0", tags: ["Fine Dining", "Romantic"] },
  { id: 2, name: "Osteria Toscana", cuisine: "Italian", rating: 4.7, reviews: 512, price: "$$$", location: "West Village", image: "photo-1555396273-367ea4eb4db5", tags: ["Pasta", "Wine Bar"] },
  { id: 3, name: "Sakura Garden", cuisine: "Japanese", rating: 4.8, reviews: 289, price: "$$$", location: "East Side", image: "photo-1579871494447-9811cf80d66c", tags: ["Omakase", "Sake"] },
  { id: 4, name: "The Copper Grill", cuisine: "American", rating: 4.6, reviews: 634, price: "$$$", location: "Downtown", image: "photo-1550966871-3ed3cdb5ed0c", tags: ["Steakhouse", "Cocktails"] },
  { id: 5, name: "Spice Route", cuisine: "Indian", rating: 4.7, reviews: 198, price: "$$", location: "Uptown", image: "photo-1565299585323-38d6b0865b47", tags: ["Vegetarian", "Tandoor"] },
  { id: 6, name: "La Mar Azul", cuisine: "Mediterranean", rating: 4.8, reviews: 421, price: "$$$", location: "Harbor", image: "photo-1504674900247-0877df9cc836", tags: ["Seafood", "Terrace"] },
];

const MY_RESERVATIONS = [
  { id: 1, restaurant: "Maison Blanc", date: "May 18, 2026", time: "7:30 PM", guests: 2, status: "Confirmed" },
  { id: 2, restaurant: "Sakura Garden", date: "May 22, 2026", time: "8:00 PM", guests: 4, status: "Pending" },
  { id: 3, restaurant: "The Copper Grill", date: "Apr 30, 2026", time: "6:30 PM", guests: 3, status: "Cancelled" },
  { id: 4, restaurant: "Osteria Toscana", date: "Jun 5, 2026", time: "7:00 PM", guests: 6, status: "Pending" },
];

const TABLES_DATA = [
  { id: 1, number: "T-01", capacity: 2, status: "Available", location: "Indoor", section: "Window" },
  { id: 2, number: "T-02", capacity: 2, status: "Reserved", location: "Indoor", section: "Window" },
  { id: 3, number: "T-03", capacity: 4, status: "Occupied", location: "Indoor", section: "Main" },
  { id: 4, number: "T-04", capacity: 4, status: "Available", location: "Indoor", section: "Main" },
  { id: 5, number: "T-05", capacity: 6, status: "Reserved", location: "Indoor", section: "Main" },
  { id: 6, number: "T-06", capacity: 8, status: "Available", location: "Indoor", section: "Private" },
  { id: 7, number: "T-07", capacity: 2, status: "Occupied", location: "Outdoor", section: "Terrace" },
  { id: 8, number: "T-08", capacity: 4, status: "Available", location: "Outdoor", section: "Terrace" },
  { id: 9, number: "T-09", capacity: 4, status: "Reserved", location: "Outdoor", section: "Terrace" },
  { id: 10, number: "T-10", capacity: 6, status: "Closed", location: "Outdoor", section: "Garden" },
  { id: 11, number: "T-11", capacity: 2, status: "Available", location: "Bar", section: "Bar Counter" },
  { id: 12, number: "T-12", capacity: 4, status: "Occupied", location: "Bar", section: "Lounge" },
];

const INITIAL_REQUESTS = [
  { id: 1, guest: "Sarah Mitchell", email: "sarah.m@email.com", table: "T-05", date: "May 20, 2026", time: "7:00 PM", guests: 5, note: "Anniversary dinner — please arrange flowers on the table.", status: "Pending" },
  { id: 2, guest: "James Thornton", email: "j.thornton@email.com", table: "T-09", date: "May 20, 2026", time: "8:30 PM", guests: 3, note: "Dietary restriction: strictly gluten-free.", status: "Pending" },
  { id: 3, guest: "Elena Vasquez", email: "elena.v@email.com", table: "T-06", date: "May 21, 2026", time: "6:00 PM", guests: 8, note: "Corporate dinner. AV setup required for presentation.", status: "Pending" },
  { id: 4, guest: "Marcus Chen", email: "m.chen@email.com", table: "T-02", date: "May 21, 2026", time: "7:30 PM", guests: 2, note: "", status: "Pending" },
  { id: 5, guest: "Priya Nair", email: "priya.n@email.com", table: "T-08", date: "May 22, 2026", time: "1:00 PM", guests: 4, note: "Vegetarian menu preferred.", status: "Pending" },
];

const TIME_SLOTS = [
  { time: "12:00 PM", available: true }, { time: "12:30 PM", available: false },
  { time: "1:00 PM", available: true }, { time: "1:30 PM", available: true },
  { time: "6:00 PM", available: false }, { time: "6:30 PM", available: true },
  { time: "7:00 PM", available: true }, { time: "7:30 PM", available: false },
  { time: "8:00 PM", available: true }, { time: "8:30 PM", available: true },
  { time: "9:00 PM", available: true },
];

// May 2026: starts on Friday (day index 5, Sun=0)
const MAY_START_DAY = 5;
const MAY_TOTAL_DAYS = 31;
const TODAY = 15;

function CalendarGrid({ selected, onSelect }: { selected: number | null; onSelect: (d: number) => void }) {
  const cells: (number | null)[] = [];
  for (let i = 0; i < MAY_START_DAY; i++) cells.push(null);
  for (let d = 1; d <= MAY_TOTAL_DAYS; d++) cells.push(d);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <button className="p-1 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-4 h-4 rotate-180" />
        </button>
        <p className="text-sm font-medium text-foreground">May 2026</p>
        <button className="p-1 rounded-sm hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-0.5 text-center">
        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((d) => (
          <div key={d} className="text-[10px] font-mono text-muted-foreground py-1.5 uppercase tracking-wider">{d}</div>
        ))}
        {cells.map((day, i) => (
          <div key={i} className="aspect-square flex items-center justify-center">
            {day === null ? null : (
              <button
                onClick={() => day >= TODAY && onSelect(day)}
                disabled={day < TODAY}
                className={`w-8 h-8 text-xs rounded-sm transition-all ${
                  day === selected
                    ? "bg-[#059669] text-white font-medium"
                    : day < TODAY
                    ? "text-muted-foreground/30 cursor-not-allowed"
                    : "hover:bg-muted text-foreground"
                }`}
              >
                {day}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    Confirmed: "bg-emerald-50 text-[#059669] border-emerald-200",
    Approved: "bg-emerald-50 text-[#059669] border-emerald-200",
    Pending: "bg-amber-50 text-amber-700 border-amber-200",
    Cancelled: "bg-red-50 text-red-600 border-red-200",
    Rejected: "bg-red-50 text-red-600 border-red-200",
    Available: "bg-emerald-50 text-[#059669] border-emerald-200",
    Reserved: "bg-amber-50 text-amber-700 border-amber-200",
    Occupied: "bg-red-50 text-red-600 border-red-200",
    Closed: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span className={`inline-flex items-center font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm ${map[status] ?? "bg-muted text-muted-foreground"}`}>
      {status}
    </span>
  );
}

function BookingModal({
  restaurant,
  onClose,
}: {
  restaurant: typeof RESTAURANTS[0];
  onClose: () => void;
}) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [guests, setGuests] = useState(2);
  const [confirmed, setConfirmed] = useState(false);

  const canConfirm = selectedDate !== null && selectedTime !== null;

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
        <div className="bg-card rounded-sm p-12 max-w-sm w-full text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-[#059669]" />
          </div>
          <h3 className="font-display text-2xl text-foreground mb-2">Reservation Confirmed</h3>
          <p className="text-muted-foreground text-sm mb-1">{restaurant.name}</p>
          <p className="text-sm font-mono text-foreground mt-3">
            May {selectedDate}, 2026 · {selectedTime} · {guests} {guests === 1 ? "guest" : "guests"}
          </p>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
            A confirmation has been sent to your email. We look forward to seeing you.
          </p>
          <button onClick={onClose} className="mt-8 w-full bg-[#059669] text-white text-sm py-3 rounded-sm hover:bg-[#047857] transition-colors">
            Done
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={onClose}>
      <div
        className="bg-card rounded-sm shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
        style={{ scrollbarWidth: "none" }}
      >
        {/* Header */}
        <div className="relative h-40 bg-muted overflow-hidden rounded-t-sm">
          <img
            src={`https://images.unsplash.com/${restaurant.image}?w=800&h=320&fit=crop&auto=format`}
            alt={restaurant.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-sm bg-black/40 text-white flex items-center justify-center hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-6">
            <p className="text-white/70 text-xs font-mono uppercase tracking-widest">{restaurant.cuisine}</p>
            <h3 className="font-display text-2xl text-white">{restaurant.name}</h3>
          </div>
        </div>

        <div className="p-6 grid grid-cols-12 gap-6">
          {/* Calendar */}
          <div className="col-span-12 md:col-span-7">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Select Date</p>
            <CalendarGrid selected={selectedDate} onSelect={setSelectedDate} />
          </div>

          {/* Guests */}
          <div className="col-span-12 md:col-span-5">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">Party Size</p>
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setGuests(Math.max(1, guests - 1))}
                className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="font-display text-3xl text-foreground w-8 text-center">{guests}</span>
              <button
                onClick={() => setGuests(Math.min(12, guests + 1))}
                className="w-9 h-9 rounded-sm border border-border flex items-center justify-center hover:bg-muted transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
              <span className="text-sm text-muted-foreground">{guests === 1 ? "guest" : "guests"}</span>
            </div>

            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Special Requests</p>
            <textarea
              placeholder="Dietary restrictions, occasion, seating preferences..."
              rows={3}
              className="w-full text-sm bg-input-background rounded-sm px-3 py-2 text-foreground placeholder:text-muted-foreground outline-none resize-none border border-transparent focus:border-[#059669] transition-colors"
            />
          </div>

          {/* Time Slots */}
          <div className="col-span-12">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              Available Times {selectedDate ? `— May ${selectedDate}` : ""}
            </p>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
              {TIME_SLOTS.map(({ time, available }) => (
                <button
                  key={time}
                  disabled={!available}
                  onClick={() => available && setSelectedTime(time)}
                  className={`text-xs py-2 px-1 rounded-sm border transition-all font-mono ${
                    !available
                      ? "border-border text-muted-foreground/40 bg-muted/40 cursor-not-allowed"
                      : selectedTime === time
                      ? "border-[#059669] bg-[#059669] text-white"
                      : "border-border text-foreground hover:border-[#059669] hover:text-[#059669]"
                  }`}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>

          {/* Confirm */}
          <div className="col-span-12 flex items-center justify-between pt-2 border-t border-border">
            <div>
              {canConfirm && (
                <p className="text-sm text-foreground">
                  <span className="font-mono">May {selectedDate}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="font-mono">{selectedTime}</span>
                  <span className="text-muted-foreground mx-2">·</span>
                  <span className="font-mono">{guests} {guests === 1 ? "guest" : "guests"}</span>
                </p>
              )}
              {!canConfirm && (
                <p className="text-xs text-muted-foreground">Select a date and time to continue</p>
              )}
            </div>
            <button
              disabled={!canConfirm}
              onClick={() => canConfirm && setConfirmed(true)}
              className={`text-sm px-8 py-3 rounded-sm transition-all font-medium ${
                canConfirm
                  ? "bg-[#059669] text-white hover:bg-[#047857]"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              Confirm Reservation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── LANDING PAGE ───────────────────────────────────────────────────────────────

function LandingPage({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [date, setDate] = useState("");
  const [guests, setGuests] = useState("2");

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
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
            <button
              onClick={() => onNavigate("customer")}
              className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2"
            >
              Login
            </button>
            <button
              onClick={() => onNavigate("customer")}
              className="text-sm bg-[#059669] text-white px-5 py-2.5 rounded-sm hover:bg-[#047857] transition-colors"
            >
              Register
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative h-screen flex items-end pb-24 md:pb-0 md:items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#141412]">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&auto=format"
            alt="Elegant fine dining restaurant interior with warm candlelight"
            className="w-full h-full object-cover opacity-45"
          />
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

          {/* Search Bar */}
          <div className="bg-white shadow-2xl rounded-sm flex flex-col md:flex-row max-w-3xl mx-auto overflow-hidden">
            <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-border">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Restaurant or cuisine..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b md:border-b-0 md:border-r border-border">
              <Calendar className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none min-w-[130px]"
              />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b md:border-b-0 border-border">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <select
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="bg-transparent text-sm text-foreground outline-none"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                ))}
              </select>
            </div>
            <button
              onClick={() => onNavigate("customer")}
              className="bg-[#059669] text-white text-sm font-medium px-7 py-3.5 hover:bg-[#047857] transition-colors flex items-center justify-center gap-2 shrink-0"
            >
              Find a Table
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 hidden md:flex flex-col items-center gap-2 text-white/30">
          <span className="text-[9px] font-mono tracking-[0.3em] uppercase">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* About Section */}
      <section className="py-24 bg-background" id="about">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-12 gap-8 items-center">
          <div className="col-span-12 md:col-span-5">
            <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-muted">
              <img
                src="https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&h=1000&fit=crop&auto=format"
                alt="Chef plating a dish in a gourmet kitchen"
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-6 right-6 bg-[#059669] text-white p-5 rounded-sm shadow-xl">
                <p className="font-mono text-3xl font-medium leading-none">500+</p>
                <p className="text-xs mt-1.5 text-white/80 tracking-wide">Partner Restaurants</p>
              </div>
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 md:col-start-7">
            <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-5">About Reservo</p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground font-light leading-tight mb-6">
              Where dining<br />becomes <em className="not-italic text-[#059669]">effortless</em>
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-5">
              Reservo connects food lovers with the world's finest dining experiences. We partner with over 500 restaurants across 30 cities to give you instant access to the tables that matter — for date nights, business dinners, and everything in between.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed mb-10">
              Our platform is built for both diners and restaurants: customers get real-time availability and instant confirmations, while restaurants get powerful tools to manage their floor with precision.
            </p>
            <div className="grid grid-cols-3 gap-6 pt-8 border-t border-border">
              {[
                { stat: "500+", label: "Restaurants" },
                { stat: "98%", label: "Confirmation Rate" },
                { stat: "2M+", label: "Diners Served" },
              ].map(({ stat, label }) => (
                <div key={label}>
                  <p className="font-display text-3xl text-foreground">{stat}</p>
                  <p className="text-[10px] text-muted-foreground mt-1 font-mono uppercase tracking-widest">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-[#141412]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-5">Process</p>
            <h2 className="font-display text-4xl text-white font-light">Three steps to your table</h2>
          </div>
          <div className="grid grid-cols-12 gap-6">
            {[
              { num: "01", title: "Search & Discover", desc: "Browse curated restaurants by cuisine, location, or occasion. Filter by real-time availability and party size.", icon: Search },
              { num: "02", title: "Choose & Book", desc: "Select your preferred date, time, and party size. Confirm your reservation in under 30 seconds.", icon: Calendar },
              { num: "03", title: "Dine & Enjoy", desc: "Receive instant confirmation. Arrive and your table will be ready — no calls, no waiting lists.", icon: Utensils },
            ].map(({ num, title, desc, icon: Icon }) => (
              <div key={num} className="col-span-12 md:col-span-4">
                <div className="border border-white/8 rounded-sm p-8 h-full group hover:border-[#059669]/40 transition-colors">
                  <p className="font-mono text-[#059669] text-[10px] tracking-[0.3em] uppercase mb-8">{num}</p>
                  <Icon className="w-7 h-7 text-white/30 mb-5 group-hover:text-white/50 transition-colors" />
                  <h3 className="font-display text-xl text-white mb-3">{title}</h3>
                  <p className="text-white/45 text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-[#059669]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-4xl text-white font-light mb-4">Ready to find your table?</h2>
          <p className="text-white/65 text-sm mb-10 leading-relaxed">
            Join over 2 million diners who trust Reservo for their restaurant reservations.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={() => onNavigate("customer")}
              className="bg-white text-[#059669] text-sm font-medium px-8 py-3 rounded-sm hover:bg-white/90 transition-colors"
            >
              Get Started — Free
            </button>
            <button
              onClick={() => onNavigate("admin")}
              className="border border-white/30 text-white text-sm px-8 py-3 rounded-sm hover:bg-white/10 transition-colors"
            >
              Restaurant Owner?
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0D0D0B] py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Utensils className="w-4 h-4 text-[#059669]" />
            <span className="font-display text-white text-lg">Reservo</span>
          </div>
          <p className="text-white/25 text-xs font-mono">© 2026 Reservo, Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map((item) => (
              <a key={item} href="#" className="text-white/35 text-xs hover:text-white/60 transition-colors font-mono">{item}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── CUSTOMER DASHBOARD ──────────────────────────────────────────────────────────

function CustomerDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const [bookingRestaurant, setBookingRestaurant] = useState<typeof RESTAURANTS[0] | null>(null);

  const cuisines = ["All", "French", "Italian", "Japanese", "American", "Indian", "Mediterranean"];

  const filtered = RESTAURANTS.filter((r) => {
    const matchSearch = r.name.toLowerCase().includes(search.toLowerCase()) || r.cuisine.toLowerCase().includes(search.toLowerCase());
    const matchCuisine = cuisine === "All" || r.cuisine === cuisine;
    return matchSearch && matchCuisine;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <Utensils className="w-5 h-5 text-[#059669]" />
              <span className="font-display text-xl text-foreground tracking-tight">Reservo</span>
            </button>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {["Discover", "My Reservations", "Favorites"].map((link, i) => (
                <a key={link} href="#" className={`text-sm transition-colors ${i === 0 ? "text-[#059669] font-medium" : "text-muted-foreground hover:text-foreground"}`}>{link}</a>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors relative">
              <Bell className="w-4 h-4 text-muted-foreground" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-sm bg-[#059669] flex items-center justify-center">
              <span className="text-white text-xs font-medium">AK</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        {/* Welcome */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-1">Good evening,</p>
          <h1 className="font-display text-3xl text-foreground">Amara Khoury</h1>
        </div>

        {/* Search + Filter */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex items-center gap-3 flex-1 bg-card border border-border rounded-sm px-4 py-3 focus-within:border-[#059669] transition-colors">
              <Search className="w-4 h-4 text-muted-foreground shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants or cuisines..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <div className="flex items-center gap-3 bg-card border border-border rounded-sm px-4 py-3">
              <Calendar className="w-4 h-4 text-muted-foreground" />
              <input type="date" className="bg-transparent text-sm text-foreground outline-none" />
            </div>
            <div className="flex items-center gap-3 bg-card border border-border rounded-sm px-4 py-3">
              <Users className="w-4 h-4 text-muted-foreground" />
              <select className="bg-transparent text-sm text-foreground outline-none">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Cuisine Filter Pills */}
          <div className="flex items-center gap-2 flex-wrap">
            {cuisines.map((c) => (
              <button
                key={c}
                onClick={() => setCuisine(c)}
                className={`text-xs font-mono px-4 py-1.5 rounded-sm border transition-all ${
                  cuisine === c
                    ? "bg-[#059669] text-white border-[#059669]"
                    : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Results header */}
        <div className="flex items-center justify-between mb-5">
          <p className="text-sm text-muted-foreground">
            Showing <span className="text-foreground font-medium">{filtered.length}</span> restaurants
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-3.5 h-3.5" />
            <span>Sort: Recommended</span>
          </div>
        </div>

        {/* Restaurant Grid — 12-col, 3-up */}
        <div className="grid grid-cols-12 gap-5 mb-16">
          {filtered.map((r) => (
            <div
              key={r.id}
              className="col-span-12 sm:col-span-6 lg:col-span-4 bg-card border border-border rounded-sm overflow-hidden group hover:border-[#059669]/40 hover:shadow-md transition-all"
            >
              <div className="relative h-48 bg-muted overflow-hidden">
                <img
                  src={`https://images.unsplash.com/${r.image}?w=600&h=400&fit=crop&auto=format`}
                  alt={r.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 bg-[#141412]/80 backdrop-blur-sm text-white text-xs font-mono px-2.5 py-1 rounded-sm">
                  {r.price}
                </div>
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-1.5">
                  <div>
                    <h3 className="font-display text-lg text-foreground leading-tight">{r.name}</h3>
                    <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.cuisine}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-3">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="text-sm font-mono text-foreground">{r.rating}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-muted-foreground text-xs mb-4">
                  <MapPin className="w-3 h-3" />
                  <span>{r.location}</span>
                  <span className="text-border">·</span>
                  <span className="text-muted-foreground">{r.reviews} reviews</span>
                </div>
                <div className="flex gap-1.5 mb-4">
                  {r.tags.map((tag) => (
                    <span key={tag} className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 bg-muted text-muted-foreground rounded-sm">{tag}</span>
                  ))}
                </div>
                <button
                  onClick={() => setBookingRestaurant(r)}
                  className="w-full bg-[#059669] text-white text-sm py-2.5 rounded-sm hover:bg-[#047857] transition-colors"
                >
                  Reserve a Table
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* My Reservations */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-display text-2xl text-foreground">My Reservations</h2>
              <p className="text-muted-foreground text-sm mt-1">Track and manage your upcoming bookings</p>
            </div>
            <button className="text-xs font-mono uppercase tracking-widest text-[#059669] hover:underline">View All</button>
          </div>

          <div className="bg-card border border-border rounded-sm overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border">
              <p className="col-span-4 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Restaurant</p>
              <p className="col-span-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Date & Time</p>
              <p className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Guests</p>
              <p className="col-span-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Status</p>
              <p className="col-span-1 text-[10px] font-mono uppercase tracking-widest text-muted-foreground text-right">Action</p>
            </div>

            {MY_RESERVATIONS.map((res, i) => (
              <div
                key={res.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 items-center hover:bg-muted/40 transition-colors ${i < MY_RESERVATIONS.length - 1 ? "border-b border-border" : ""}`}
              >
                <div className="col-span-4">
                  <p className="font-medium text-sm text-foreground">{res.restaurant}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">#{String(1000 + res.id).padStart(5, "0")}</p>
                </div>
                <div className="col-span-3">
                  <p className="text-sm text-foreground">{res.date}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-0.5">{res.time}</p>
                </div>
                <div className="col-span-2">
                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm text-foreground font-mono">{res.guests}</span>
                  </div>
                </div>
                <div className="col-span-2">
                  <StatusBadge status={res.status} />
                </div>
                <div className="col-span-1 flex justify-end">
                  {res.status === "Pending" && (
                    <button className="text-xs text-muted-foreground hover:text-red-500 transition-colors font-mono">Cancel</button>
                  )}
                  {res.status === "Confirmed" && (
                    <button className="text-xs text-[#059669] hover:underline font-mono">View</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {bookingRestaurant && (
        <BookingModal restaurant={bookingRestaurant} onClose={() => setBookingRestaurant(null)} />
      )}
    </div>
  );
}

// ─── ADMIN DASHBOARD ─────────────────────────────────────────────────────────────

function AdminDashboard({ onNavigate }: { onNavigate: (v: View) => void }) {
  const [activeSection, setActiveSection] = useState<"overview" | "tables" | "requests" | "settings">("requests");
  const [requests, setRequests] = useState(INITIAL_REQUESTS);
  const [tables] = useState(TABLES_DATA);

  const handleApprove = useCallback((id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Approved" } : r)));
  }, []);

  const handleReject = useCallback((id: number) => {
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "Rejected" } : r)));
  }, []);

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const availableCount = tables.filter((t) => t.status === "Available").length;
  const occupiedCount = tables.filter((t) => t.status === "Occupied").length;
  const reservedCount = tables.filter((t) => t.status === "Reserved").length;

  const navItems = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "tables", label: "Tables Status", icon: Table2 },
    { id: "requests", label: "Incoming Requests", icon: Bell, badge: pendingCount },
    { id: "settings", label: "Settings", icon: Settings },
  ] as const;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-[#141412] flex flex-col fixed top-0 left-0 h-full z-40">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-6 border-b border-white/8">
          <Utensils className="w-5 h-5 text-[#059669]" />
          <div>
            <p className="font-display text-white text-lg leading-none tracking-tight">Reservo</p>
            <p className="text-[10px] text-white/35 font-mono mt-0.5 tracking-widest uppercase">Admin</p>
          </div>
        </div>

        {/* Restaurant info */}
        <div className="px-6 py-5 border-b border-white/8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-sm bg-[#059669]/20 border border-[#059669]/30 flex items-center justify-center">
              <Utensils className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Maison Blanc</p>
              <p className="text-white/40 text-[10px] font-mono">French Fine Dining</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {navItems.map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id as typeof activeSection)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm transition-all group ${
                activeSection === id
                  ? "bg-[#059669]/15 text-[#059669]"
                  : "text-white/50 hover:text-white hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeSection === id ? "text-[#059669]" : "text-white/40 group-hover:text-white/70"}`} />
                <span>{label}</span>
              </div>
              {"badge" in { badge } && badge !== undefined && (badge as number) > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${activeSection === id ? "bg-[#059669] text-white" : "bg-white/10 text-white/60"}`}>
                  {badge}
                </span>
              )}
            </button>
          ))}
        </nav>

        {/* User + Logout */}
        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-sm bg-[#059669] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">MB</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">Michel Bernard</p>
              <p className="text-white/35 text-[10px] font-mono">Restaurant Manager</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate("landing")}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-all text-sm"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        {/* Top Header */}
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="font-display text-xl text-foreground">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "tables" && "Tables Status"}
              {activeSection === "requests" && "Incoming Requests"}
              {activeSection === "settings" && "Settings"}
            </h1>
            <p className="text-muted-foreground text-xs font-mono mt-0.5">Thursday, May 15, 2026</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors">
              <Bell className="w-4 h-4 text-muted-foreground" />
              {pendingCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />
              )}
            </button>
          </div>
        </header>

        <div className="flex-1 p-8">
          {/* Stats Row (always visible) */}
          <div className="grid grid-cols-12 gap-4 mb-8">
            {[
              { label: "Total Tables", value: tables.length, sub: "capacity tracked", icon: Table2, color: "text-foreground" },
              { label: "Available Now", value: availableCount, sub: "ready for guests", icon: CheckCircle, color: "text-[#059669]" },
              { label: "Reserved Today", value: reservedCount, sub: "upcoming seatings", icon: Clock, color: "text-amber-600" },
              { label: "Pending Requests", value: pendingCount, sub: "awaiting approval", icon: AlertCircle, color: "text-red-500" },
            ].map(({ label, value, sub, icon: Icon, color }) => (
              <div key={label} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-card border border-border rounded-sm p-5">
                <div className="flex items-start justify-between mb-4">
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <p className={`font-display text-4xl leading-none ${color}`}>{value}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-wider">{sub}</p>
              </div>
            ))}
          </div>

          {/* Tables Status Section */}
          {(activeSection === "tables" || activeSection === "overview") && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-foreground">Tables Status</h2>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5">Real-time floor management</p>
                </div>
                <div className="flex items-center gap-2">
                  {["All", "Available", "Reserved", "Occupied", "Closed"].map((s) => (
                    <button key={s} className="text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-sm border border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground transition-colors">
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-sm overflow-hidden">
                {/* Table Head */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border">
                  {["Table", "Capacity", "Location", "Section", "Status", "Action"].map((h, i) => (
                    <p key={h} className={`text-[10px] font-mono uppercase tracking-widest text-muted-foreground ${i === 0 ? "col-span-2" : i === 5 ? "col-span-2 text-right" : "col-span-2"}`}>
                      {h}
                    </p>
                  ))}
                </div>

                {tables.map((table, i) => (
                  <div
                    key={table.id}
                    className={`grid grid-cols-12 gap-4 px-6 py-3.5 items-center hover:bg-muted/40 transition-colors ${i < tables.length - 1 ? "border-b border-border" : ""}`}
                  >
                    <div className="col-span-2">
                      <p className="font-mono text-sm font-medium text-foreground">{table.number}</p>
                    </div>
                    <div className="col-span-2">
                      <div className="flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="font-mono text-sm text-foreground">{table.capacity}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-foreground">{table.location}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-sm text-muted-foreground">{table.section}</span>
                    </div>
                    <div className="col-span-2">
                      <StatusBadge status={table.status} />
                    </div>
                    <div className="col-span-2 flex justify-end gap-2">
                      <button className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors px-2 py-1 border border-border rounded-sm hover:border-foreground/30">
                        Edit
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Incoming Requests Section */}
          {(activeSection === "requests" || activeSection === "overview") && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-foreground">Incoming Requests</h2>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5">
                    {pendingCount} pending · requires action
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className={`bg-card border rounded-sm p-5 transition-all ${
                      req.status === "Pending"
                        ? "border-border hover:border-[#059669]/30"
                        : req.status === "Approved"
                        ? "border-emerald-200 bg-emerald-50/30"
                        : "border-red-100 bg-red-50/20 opacity-60"
                    }`}
                  >
                    <div className="grid grid-cols-12 gap-4 items-start">
                      {/* Guest Info */}
                      <div className="col-span-12 md:col-span-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-sm bg-muted flex items-center justify-center shrink-0">
                            <User className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{req.guest}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{req.email}</p>
                          </div>
                        </div>
                      </div>

                      {/* Details */}
                      <div className="col-span-12 md:col-span-5">
                        <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="font-mono">{req.date}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" />
                            <span className="font-mono">{req.time}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Users className="w-3.5 h-3.5" />
                            <span className="font-mono">{req.guests} guests</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Table2 className="w-3.5 h-3.5" />
                            <span className="font-mono">{req.table}</span>
                          </div>
                        </div>
                        {req.note && (
                          <p className="text-xs text-muted-foreground mt-2 italic leading-relaxed border-l-2 border-border pl-3">
                            "{req.note}"
                          </p>
                        )}
                      </div>

                      {/* Status + Actions */}
                      <div className="col-span-12 md:col-span-4 flex items-center justify-end gap-3">
                        {req.status === "Pending" ? (
                          <>
                            <button
                              onClick={() => handleReject(req.id)}
                              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-sm border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <XCircle className="w-3.5 h-3.5" />
                              Reject
                            </button>
                            <button
                              onClick={() => handleApprove(req.id)}
                              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider px-4 py-2 rounded-sm bg-[#059669] text-white hover:bg-[#047857] transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          </>
                        ) : (
                          <StatusBadge status={req.status} />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="bg-card border border-border rounded-sm p-8 max-w-2xl">
              <h3 className="font-display text-xl text-foreground mb-6">Restaurant Settings</h3>
              <div className="space-y-5">
                {[
                  { label: "Restaurant Name", value: "Maison Blanc" },
                  { label: "Contact Email", value: "contact@maisonblanc.com" },
                  { label: "Phone", value: "+1 (212) 555-0147" },
                  { label: "Cuisine Type", value: "French Fine Dining" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">{label}</label>
                    <input
                      defaultValue={value}
                      className="w-full bg-input-background text-foreground text-sm px-4 py-2.5 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors"
                    />
                  </div>
                ))}
                <div className="pt-4">
                  <button className="bg-[#059669] text-white text-sm px-6 py-2.5 rounded-sm hover:bg-[#047857] transition-colors">
                    Save Changes
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── ROOT ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [view, setView] = useState<View>("landing");

  return (
    <div className="min-h-screen bg-background antialiased" style={{ scrollbarWidth: "none" }}>
      {view === "landing" && <LandingPage onNavigate={setView} />}
      {view === "customer" && <CustomerDashboard onNavigate={setView} />}
      {view === "admin" && <AdminDashboard onNavigate={setView} />}
    </div>
  );
}
