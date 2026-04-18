import { NavLink, Outlet, useLocation } from "react-router-dom";
import { LayoutDashboard, CalendarDays, DoorOpen, Megaphone, ListOrdered, GraduationCap, Plus } from "lucide-react";
import { useStore, type Role } from "@/store/campus";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";

const nav = [
  { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
  { to: "/classes", label: "Classes", icon: CalendarDays },
  { to: "/schedule", label: "Schedule", icon: CalendarDays }, // 📅
  { to: "/timeline", label: "Timeline", icon: ListOrdered },  // 📜
  { to: "/rooms", label: "Free Rooms", icon: DoorOpen },
  { to: "/notices", label: "Notices", icon: Megaphone },
];

const roles: { value: Role; label: string }[] = [
  { value: "student", label: "Student" },
  { value: "faculty", label: "Faculty" },
  { value: "admin", label: "Admin" },
];
const role = localStorage.getItem("role");
const email = localStorage.getItem("email");
export default function AppLayout() {
  const { role, setRole } = useStore();
  const loc = useLocation();

  return (
    <div className="min-h-screen flex bg-background">
      {/* Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-border bg-sidebar px-5 py-7 sticky top-0 h-screen">
        <div className="flex items-center gap-3.5 mb-10">
          <div className="h-10 w- rounded-xl overflow-hidden shadow-soft">
          <img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
        </div>
          <div>
            <div className="font-display text-xl font-bold leading-none">CampusPulse</div>
            <div className="text-[11px] text-muted-foreground mt-1 tracking-wide uppercase">Atharva University</div>
          </div>
        </div>

        <nav className="flex flex-col gap-1">
          {nav.map((n) => (
            <NavLink
              key={n.to}
              to={n.to}
              end={n.end}
              className={({ isActive }) =>
                cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary-soft text-primary"
                    : "text-sidebar-foreground hover:bg-sidebar-accent"
                )
              }
            >
              <n.icon className="h-4 w-4" />
              {n.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto cp-card p-4 role-switch">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Viewing as</div>
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-surface-muted">
            {roles.map((r) => (
              <button
                key={r.value}
                onClick={() => setRole(r.value)}
                className={cn(
                  "text-xs font-medium py-1.5 rounded-lg transition-all",
                  role === r.value
                    ? "bg-surface text-foreground shadow-soft"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground mt-3 leading-relaxed">
            {role === "student" && "You can browse classes, rooms and notices."}
            {role === "faculty" && "You can post notices and add classes."}
            {role === "admin" && "Full access — manage classes, notices and rooms."}
          </p>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-sidebar sticky top-0 z-20">
          <div className="flex items-center gap-2">
<div className="h-9 w-9 rounded-xl overflow-hidden shadow-soft">
  <img src="/logo.png" alt="logo" className="h-full w-full object-cover" />
</div>
            <span className="font-display font-semibold">CampusPulse</span>
          </div>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value as Role)}
            className="text-xs rounded-lg border border-border bg-surface px-2 py-1.5"
          >
            {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </header>

        {/* Mobile bottom nav */}
        <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-surface/95 backdrop-blur border-t border-border flex justify-around py-2">
          {nav.map((n) => {
            const active = n.end ? loc.pathname === n.to : loc.pathname.startsWith(n.to);
            return (
              <NavLink key={n.to} to={n.to} end={n.end}
                className={cn("flex flex-col items-center gap-0.5 px-2 py-1 text-[10px]",
                  active ? "text-primary" : "text-muted-foreground")}>
                <n.icon className="h-4 w-4" />
                {n.label}
              </NavLink>
            );
          })}
        </nav>

        <main className="flex-1 px-4 md:px-10 py-6 md:py-10 pb-24 md:pb-10 max-w-[1280px] w-full mx-auto animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export function PageHeader({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
      <div>
        {eyebrow && <div className="text-[11px] uppercase tracking-[0.18em] text-primary font-medium mb-2">{eyebrow}</div>}
        <h1 className="font-display text-3xl md:text-4xl font-semibold leading-tight">{title}</h1>
        {description && <p className="text-muted-foreground mt-2 max-w-xl">{description}</p>}
      </div>
      {action}
    </div>
  );
}

export function EmptyState({ icon: Icon = Plus, title, hint }: { icon?: any; title: string; hint?: string }) {
  return (
    <div className="cp-card p-10 text-center">
      <div className="mx-auto h-12 w-12 rounded-full bg-primary-soft text-primary grid place-items-center mb-3">
        <Icon className="h-5 w-5" />
      </div>
      <div className="font-medium">{title}</div>
      {hint && <div className="text-sm text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
