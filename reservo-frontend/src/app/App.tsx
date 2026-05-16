import { useEffect, useState } from "react";
import {
  ArrowRight, Calendar, Bell, CheckCircle, CheckCircleIcon, Clock, Heart,
  LayoutDashboard, LogOut, Settings, Star, Table2, User, Users,
  X, XCircle, Utensils, Filter, Plus, Minus, Eye, EyeOff, AlertCircle,
} from "lucide-react";
import { api } from "../api/client";

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
};

type ReservationWithIncludes = Reservation & {
  Restaurant?: { id: string; name: string; city?: string; address?: string };
  Table?: { id: string; table_number: string; capacity: number; location?: string };
};

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    confirmed: "bg-emerald-50 text-[#059669] border-emerald-200",
    pending: "bg-amber-50 text-amber-700 border-amber-200",
    rejected: "bg-red-50 text-red-600 border-red-200",
    cancelled: "bg-red-50 text-red-600 border-red-200",
    available: "bg-emerald-50 text-[#059669] border-emerald-200",
    reserved: "bg-amber-50 text-amber-700 border-amber-200",
    maintenance: "bg-muted text-muted-foreground border-border",
    completed: "bg-emerald-50 text-[#059669] border-emerald-200",
  };
  return (
    <span
      className={`inline-flex items-center font-mono text-[10px] tracking-widest uppercase border px-2 py-0.5 rounded-sm ${map[status] ?? "bg-muted text-muted-foreground"}`}
    >
      {status}
    </span>
  );
}

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
              <a key={link} href="#" className="text-sm text-white/60 hover:text-white transition-colors">
                {link}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => onNavigate("login")} className="text-sm text-white/70 hover:text-white transition-colors px-4 py-2">
              Login
            </button>
            <button onClick={() => onNavigate("register")} className="text-sm bg-[#059669] text-white px-5 py-2.5 rounded-sm hover:bg-[#047857] transition-colors">
              Register
            </button>
          </div>
        </div>
      </nav>

      <section className="relative h-screen flex items-end pb-24 md:pb-0 md:items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-[#141412]">
          <img
            src="https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1920&h=1080&fit=crop&auto=format"
            alt="Elegant fine dining"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#141412] via-[#141412]/30 to-[#141412]/20" />
        </div>

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          <p className="text-[#059669] text-[10px] font-mono tracking-[0.3em] uppercase mb-8">Reserve · Dine · Experience</p>
          <h1 className="font-display text-5xl md:text-7xl text-white font-light leading-[1.08] mb-6">
            Every great meal
            <br />
            <em className="not-italic text-[#059669]">begins with a reservation</em>
          </h1>
          <p className="text-white/50 text-base md:text-lg mb-12 max-w-xl mx-auto leading-relaxed">
            Discover the finest restaurants and secure your table in seconds.
          </p>

          <div className="bg-white shadow-2xl rounded-sm flex flex-col md:flex-row max-w-3xl mx-auto overflow-hidden">
            <div className="flex items-center gap-3 flex-1 px-5 py-3.5 border-b md:border-b-0 md:border-r border-border">
              <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
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
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="bg-transparent text-sm text-foreground outline-none min-w-[130px]" />
            </div>
            <div className="flex items-center gap-3 px-5 py-3.5 border-b md:border-b-0 border-border">
              <Users className="w-4 h-4 text-muted-foreground shrink-0" />
              <select value={guests} onChange={(e) => setGuests(e.target.value)} className="bg-transparent text-sm text-foreground outline-none">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                  <option key={n} value={n}>
                    {n} {n === 1 ? "Guest" : "Guests"}
                  </option>
                ))}
              </select>
            </div>
            <button onClick={() => onNavigate("login")} className="bg-[#059669] text-white text-sm font-medium px-7 py-3.5 hover:bg-[#047857] transition-colors flex items-center justify-center gap-2 shrink-0">
              Find a Table
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

function LoginPage({ onNavigate, onLogin }: { onNavigate: (v: View) => void; onLogin: (user: AuthUser) => void }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/login", { email, password });
      const token = data?.token as string | undefined;
      const u = data?.user as any;
      if (!token || !u) {
        setError("Login failed: missing token/user.");
        return;
      }

      localStorage.setItem("auth_token", token);

      const nameFromServer: string = u.name ?? (email.split("@")[0] || "User");
      const initials = (nameFromServer || "U")
        .trim()
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      const role: "admin" | "customer" = (u.role === "admin" ? "admin" : "customer") as any;

      const hardcodedAdminEmails = [
        "arkan@mail.com",
        "idan@mail.com",
        "nova@mail.com",
        "amar@mail.com",
      ];
      const isAllowedAdmin = hardcodedAdminEmails.includes(String(u.email || "").toLowerCase());
      const finalRole: "admin" | "customer" = role === "admin" && isAllowedAdmin ? "admin" : "customer";

      onLogin({
        id: String(u.id),
        name: nameFromServer,
        email: u.email,
        initials,
        role,
      });

      onNavigate(role === "admin" ? "admin" : "customer");
    } catch (err: any) {
      setError(err?.response?.data?.error || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <h1 className="font-display text-3xl text-foreground mb-2">Sign in</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Don't have an account?{" "}
            <button onClick={() => onNavigate("register")} className="text-[#059669] hover:underline font-medium">
              Register
            </button>
          </p>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Password</label>
                <button className="text-xs text-[#059669] hover:underline font-mono" type="button">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                  className="w-full bg-input-background text-foreground text-sm px-4 py-3 pr-12 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-[#059669] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#047857] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Sign In"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono text-center">
              By signing in, you agree to our{" "}
              <button className="text-foreground hover:underline">Terms of Service</button> and{" "}
              <button className="text-foreground hover:underline">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function RegisterPage({ onNavigate, onLogin }: { onNavigate: (v: View) => void; onLogin: (user: AuthUser) => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<"customer" | "admin">("customer");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthLabel = ["", "Weak", "Fair", "Strong"];
  const strengthColor = ["", "bg-red-400", "bg-amber-400", "bg-[#059669]"];

  const handleRegister = async () => {
    setError("");
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post("/api/users/register", {
        name: name.trim(),
        email,
        password,
        role,
      });

      const u = data?.user as any;
      const registeredId = u?.id ? String(u.id) : "";
      const initials = name
        .trim()
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase();

      onNavigate("login");
      setError("");

      onLogin({
        id: registeredId,
        name: name.trim(),
        email,
        initials,
        role: finalRole,
      });
    } catch (err: any) {
      setError(err?.response?.data?.error || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      <div className="flex-1 flex items-center justify-center p-8 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <h1 className="font-display text-3xl text-foreground mb-2">Create account</h1>
          <p className="text-muted-foreground text-sm mb-8">
            Already have an account?{" "}
            <button onClick={() => onNavigate("login")} className="text-[#059669] hover:underline font-medium">
              Sign in
            </button>
          </p>

          <div className="flex bg-muted rounded-sm p-1 mb-6">
            {(["customer"] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={`flex-1 text-xs font-mono uppercase tracking-widest py-2 rounded-sm transition-all ${role === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
              >
                Customer
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-5 px-4 py-3 rounded-sm bg-red-50 border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your full name"
                className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground"
              />
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Min. 6 characters"
                  className="w-full bg-input-background text-foreground text-sm px-4 py-3 pr-12 rounded-sm border border-transparent focus:border-[#059669] outline-none transition-colors placeholder:text-muted-foreground"
                />
                <button
                  onClick={() => setShowPassword(!showPassword)}
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {password && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1, 2, 3].map((lvl) => (
                      <div
                        key={lvl}
                        className={`h-1 flex-1 rounded-full transition-colors ${passwordStrength >= lvl ? strengthColor[passwordStrength] : "bg-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground">{strengthLabel[passwordStrength]}</span>
                </div>
              )}
            </div>

            <div>
              <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground block mb-2">Confirm Password</label>
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your password"
                onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                className={`w-full bg-input-background text-foreground text-sm px-4 py-3 rounded-sm border outline-none transition-colors placeholder:text-muted-foreground ${
                  confirmPassword && confirmPassword !== password ? "border-red-300 focus:border-red-400" : "border-transparent focus:border-[#059669]"
                }`}
              />
              {confirmPassword && confirmPassword !== password && <p className="text-red-500 text-[10px] font-mono mt-1">Passwords do not match</p>}
            </div>

            <button
              onClick={handleRegister}
              disabled={loading}
              className="w-full bg-[#059669] text-white text-sm font-medium py-3 rounded-sm hover:bg-[#047857] transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : "Create Account"}
            </button>
          </div>

          <div className="mt-8 pt-6 border-t border-border">
            <p className="text-xs text-muted-foreground font-mono text-center">
              By registering, you agree to our{" "}
              <button className="text-foreground hover:underline">Terms of Service</button> and{" "}
              <button className="text-foreground hover:underline">Privacy Policy</button>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerDashboard({ onNavigate, user }: { onNavigate: (v: View) => void; user: AuthUser | null }) {
  const [activeSection, setActiveSection] = useState<CustomerSection>("discover");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [reservations, setReservations] = useState<ReservationWithIncludes[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const [search, setSearch] = useState("");
  const [cuisine, setCuisine] = useState("All");
  const pendingCount = reservations.filter((r) => r.status === "pending").length;

  // TEMP: show empty UI while wiring endpoints. No hardcoded data.
  useEffect(() => {
    setRestaurants([]);
    setReservations([]);
    setFavorites([]);
  }, []);

  const filtered = restaurants.filter((r) => {
    const matchSearch = (r.name ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCuisine = cuisine === "All" ? true : (r.cuisine ?? "").toLowerCase() === cuisine.toLowerCase();
    return matchSearch && matchCuisine;
  });

  const displayName = user?.name ?? "Guest";
  const displayInitials = user?.initials ?? "G";
  const navLinks: { id: CustomerSection; label: string }[] = [
    { id: "discover", label: "Discover" },
    { id: "reservations", label: "My Reservations" },
    { id: "favorites", label: "Favorites" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => onNavigate("landing")} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Utensils className="w-5 h-5 text-[#059669]" />
            <span className="font-display text-xl text-foreground tracking-tight">Reservo</span>
          </button>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              {navLinks.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setActiveSection(id)}
                  className={`text-sm transition-colors relative ${activeSection === id ? "text-[#059669] font-medium" : "text-muted-foreground hover:text-foreground"}`}
                >
                  {label}
                  {id === "reservations" && pendingCount > 0 && (
                    <span className="absolute -top-1.5 -right-3 w-4 h-4 bg-[#059669] rounded-full text-[9px] text-white flex items-center justify-center font-mono">
                      {pendingCount}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3 relative">
            <button
              onClick={() => setActiveSection("reservations")}
              className="w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors relative"
            >
              <Bell className="w-4 h-4 text-muted-foreground" />
              {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />}
            </button>

            <button
              onClick={() => onNavigate("landing")}
              className="w-9 h-9 rounded-sm bg-[#059669] flex items-center justify-center hover:bg-[#047857] transition-colors"
              title="Session"
            >
              <span className="text-white text-xs font-medium">{displayInitials}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-10">
        <div className="mb-8">
          <p className="text-muted-foreground text-sm mb-1">
            {activeSection === "discover" ? "Good evening," : activeSection === "reservations" ? "Your bookings," : "Your saved restaurants,"}
          </p>
          <h1 className="font-display text-3xl text-foreground">{displayName}</h1>
        </div>

        {activeSection === "discover" && (
          <>
            <div className="mb-8">
              <div className="flex flex-col md:flex-row gap-3 mb-4">
                <div className="flex items-center gap-3 flex-1 bg-card border border-border rounded-sm px-4 py-3 focus-within:border-[#059669] transition-colors">
                  <Filter className="w-4 h-4 text-muted-foreground shrink-0" />
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
                  <select className="bg-transparent text-sm text-foreground outline-none">{[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n} {n === 1 ? "Guest" : "Guests"}</option>)}</select>
                </div>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {["All", "French", "Italian", "Japanese", "American", "Indian", "Mediterranean"].map((c) => (
                  <button
                    key={c}
                    onClick={() => setCuisine(c)}
                    className={`text-xs font-mono px-4 py-1.5 rounded-sm border transition-all ${cuisine === c ? "bg-[#059669] text-white border-[#059669]" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between mb-5">
              <p className="text-sm text-muted-foreground">
                Showing <span className="text-foreground font-medium">{filtered.length}</span> restaurants
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Filter className="w-3.5 h-3.5" />
                <span>Sort: Recommended</span>
              </div>
            </div>

            <div className="grid grid-cols-12 gap-5 mb-16">
              {filtered.length === 0 ? (
                <div className="col-span-12 py-20 text-center text-muted-foreground text-sm">No restaurants available.</div>
              ) : (
                filtered.map((r) => (
                  <div
                    key={r.id}
                    className="col-span-12 sm:col-span-6 lg:col-span-4 bg-card border border-border rounded-sm overflow-hidden"
                  >
                    <div className="p-5">
                      <h3 className="font-display text-lg text-foreground leading-tight">{r.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono mt-0.5">{r.cuisine ?? ""}</p>
                      <div className="mt-4">
                        <StatusBadge status="pending" />
                      </div>
                      <button className="w-full mt-4 bg-[#059669] text-white text-sm py-2.5 rounded-sm hover:bg-[#047857] transition-colors" type="button">
                        Reserve a Table
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeSection === "reservations" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-foreground">My Reservations</h2>
                <p className="text-muted-foreground text-sm mt-1">Track and manage your upcoming bookings</p>
              </div>
              <button onClick={() => setActiveSection("discover")} className="text-xs font-mono uppercase tracking-widest text-[#059669] hover:underline flex items-center gap-1">
                <Plus className="w-3.5 h-3.5" /> New Reservation
              </button>
            </div>

            {reservations.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-sm">
                <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No reservations yet.</p>
                <button onClick={() => setActiveSection("discover")} className="mt-4 text-sm text-[#059669] hover:underline" type="button">
                  Discover restaurants →
                </button>
              </div>
            ) : null}
          </div>
        )}

        {activeSection === "favorites" && (
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl text-foreground">Saved Restaurants</h2>
                <p className="text-muted-foreground text-sm mt-1">{favorites.length} restaurant{favorites.length !== 1 ? "s" : ""} saved</p>
              </div>
            </div>
            {favorites.length === 0 ? (
              <div className="text-center py-20 bg-card border border-border rounded-sm">
                <Heart className="w-10 h-10 text-muted-foreground/40 mx-auto mb-4" />
                <p className="text-muted-foreground text-sm">No favorites yet.</p>
                <button onClick={() => setActiveSection("discover")} className="mt-4 text-sm text-[#059669] hover:underline" type="button">
                  Discover restaurants →
                </button>
              </div>
            ) : null}
          </div>
        )}
      </main>
    </div>
  );
}

function AdminDashboard({ onNavigate, user }: { onNavigate: (v: View) => void; user: AuthUser | null }) {
  const [activeSection, setActiveSection] = useState<AdminSection>("requests");
  const [tables, setTables] = useState<Table[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [tableFilter, setTableFilter] = useState("All");

  const pendingCount = requests.filter((r) => r.status === "Pending").length;
  const availableCount = tables.filter((t) => t.status === "available").length;
  const reservedCount = tables.filter((t) => t.status === "reserved").length;

  const filteredTables = tableFilter === "All" ? tables : tables.filter((t) => t.status === (tableFilter === "Available" ? "available" : tableFilter === "Reserved" ? "reserved" : "maintenance"));

  const displayName = user?.name ?? "Restaurant Manager";
  const displayInitials = user?.initials ?? "RM";

  // TEMP: show empty lists while wiring.
  useEffect(() => {
    setTables([]);
    setRequests([]);
  }, []);

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 bg-[#141412] fixed top-0 left-0 h-screen flex flex-col z-40">
        <div className="px-4 py-5 border-b border-white/8">
          <div className="flex items-center gap-3 px-2">
            <div className="w-9 h-9 rounded-sm bg-[#059669]/20 border border-[#059669]/30 flex items-center justify-center shrink-0">
              <Utensils className="w-4 h-4 text-[#059669]" />
            </div>
            <div>
              <p className="text-white text-sm font-medium">Restaurant</p>
              <p className="text-white/40 text-[10px] font-mono">Manager</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { id: "overview" as const, label: "Overview", icon: LayoutDashboard },
            { id: "tables" as const, label: "Tables Status", icon: Table2 },
            { id: "requests" as const, label: "Incoming Requests", icon: Bell, badge: pendingCount },
            { id: "settings" as const, label: "Settings", icon: Settings },
          ].map(({ id, label, icon: Icon, badge }) => (
            <button
              key={id}
              onClick={() => setActiveSection(id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-sm text-sm transition-all group ${activeSection === id ? "bg-[#059669]/15 text-[#059669]" : "text-white/50 hover:text-white hover:bg-white/5"}`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${activeSection === id ? "text-[#059669]" : "text-white/40 group-hover:text-white/70"}`} />
                <span>{label}</span>
              </div>
              {badge !== undefined && badge > 0 && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-sm ${activeSection === id ? "bg-[#059669] text-white" : "bg-white/10 text-white/60"}`}>{badge}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="px-3 py-4 border-t border-white/8">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-sm bg-[#059669] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-medium">{displayInitials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{displayName}</p>
              <p className="text-white/35 text-[10px] font-mono">Restaurant Manager</p>
            </div>
          </div>
          <button onClick={() => onNavigate("landing")} className="w-full flex items-center gap-3 px-3 py-2.5 text-white/40 hover:text-white hover:bg-white/5 rounded-sm transition-all text-sm">
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 min-h-screen flex flex-col">
        <header className="h-16 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-30">
          <div>
            <h1 className="font-display text-xl text-foreground">
              {activeSection === "overview" && "Dashboard Overview"}
              {activeSection === "tables" && "Tables Status"}
              {activeSection === "requests" && "Incoming Requests"}
              {activeSection === "settings" && "Settings"}
            </h1>
            <p className="text-muted-foreground text-xs font-mono mt-0.5">—</p>
          </div>
          <button className="relative w-9 h-9 flex items-center justify-center rounded-sm hover:bg-muted transition-colors" onClick={() => setActiveSection("requests")}>
            <Bell className="w-4 h-4 text-muted-foreground" />
            {pendingCount > 0 && <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#059669] rounded-full" />}
          </button>
        </header>

        <div className="flex-1 p-8">
          <div className="grid grid-cols-12 gap-4 mb-8">
            {[
              { label: "Total Tables", value: tables.length, sub: "capacity tracked" },
              { label: "Available Now", value: availableCount, sub: "ready for guests" },
              { label: "Reserved", value: reservedCount, sub: "upcoming seatings" },
              { label: "Pending Requests", value: pendingCount, sub: "awaiting approval" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="col-span-12 sm:col-span-6 lg:col-span-3 bg-card border border-border rounded-sm p-5">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{label}</p>
                <p className="font-display text-4xl leading-none text-foreground mt-2">{value}</p>
                <p className="text-[10px] text-muted-foreground font-mono mt-2 uppercase tracking-wider">{sub}</p>
              </div>
            ))}
          </div>

          {(activeSection === "tables" || activeSection === "overview") && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-foreground">Tables Status</h2>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5">Real-time floor management</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {[("All"), "Available", "Reserved"].map((s) => (
                    <button
                      key={s}
                      onClick={() => setTableFilter(String(s))}
                      className={`text-[10px] font-mono uppercase tracking-wider px-3 py-1.5 rounded-sm border transition-colors ${tableFilter === s ? "bg-[#059669] text-white border-[#059669]" : "border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-card border border-border rounded-sm overflow-hidden">
                <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-muted border-b border-border">
                  {["Table", "Capacity", "Location", "Status"].map((h) => (
                    <p key={h} className="col-span-3 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
                      {h}
                    </p>
                  ))}
                </div>

                {filteredTables.length === 0 ? (
                  <div className="py-12 text-center text-muted-foreground text-sm">No tables found for this filter.</div>
                ) : null}
              </div>
            </div>
          )}

          {(activeSection === "requests" || activeSection === "overview") && (
            <div>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h2 className="font-display text-xl text-foreground">Incoming Requests</h2>
                  <p className="text-muted-foreground text-xs font-mono mt-0.5">{pendingCount} pending · requires action</p>
                </div>
              </div>
              <div className="text-center py-12 bg-card border border-border rounded-sm text-muted-foreground text-sm">No incoming requests yet.</div>
            </div>
          )}

          {activeSection === "settings" && (
            <div className="bg-card border border-border rounded-sm p-8 max-w-2xl">
              <h3 className="font-display text-xl text-foreground mb-6">Restaurant Settings</h3>
              <div className="text-muted-foreground text-sm">Settings wiring pending.</div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState<View>("landing");
  const [user, setUser] = useState<AuthUser | null>(null);

  const handleLogin = (u: AuthUser) => setUser(u);

  const handleNavigate = (v: View) => {
    if ((v === "customer" || v === "admin") && !user) {
      setView("login");
      return;
    }
    setView(v);
  };

  return (
    <div className="min-h-screen bg-background antialiased" style={{ scrollbarWidth: "none" }}>
      {view === "landing" && <LandingPage onNavigate={handleNavigate} />}
      {view === "login" && <LoginPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {view === "register" && <RegisterPage onNavigate={handleNavigate} onLogin={handleLogin} />}
      {view === "customer" && <CustomerDashboard onNavigate={handleNavigate} user={user} />}
      {view === "admin" && <AdminDashboard onNavigate={handleNavigate} user={user} />}
    </div>
  );
}

