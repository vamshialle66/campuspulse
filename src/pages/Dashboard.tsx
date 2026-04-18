import { useMemo } from "react";
import { Link } from "react-router-dom";
import { useStore, todayDay, nowHHMM, ROOMS, findFreeRooms } from "@/store/campus";
import { PageHeader } from "@/components/layout/AppLayout";
import { ArrowUpRight, CalendarDays, DoorOpen, Megaphone, Sparkles, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

export default function Dashboard() {
  const { classes, notices, role } = useStore();
  const day = todayDay();
  const now = nowHHMM();

  const todays = useMemo(
    () => classes.filter((c) => c.day === day).sort((a, b) => a.start.localeCompare(b.start)),
    [classes, day]
  );
  const upcoming = todays.find((c) => c.start > now);
  const ongoing = todays.find((c) => c.start <= now && now < c.end);

  const free = findFreeRooms(classes, day, now);
  const freeCount = free.filter((r) => r.free).length;

  const highNotices = notices.filter((n) => n.priority === "high");

  return (
    <>
      <PageHeader
        eyebrow={`${day} · ${now}`}
        title={`${greeting()}, ${role === "admin" ? "Admin" : role === "faculty" ? "Professor" : "Student"}.`}
        description="A quiet pulse of what's happening on campus today."
      />

      {/* Stat row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Classes today" value={todays.length} icon={CalendarDays} />
        <StatCard label="Free rooms now" value={`${freeCount}/${ROOMS.length}`} icon={DoorOpen} accent />
        <StatCard label="Active notices" value={notices.length} icon={Megaphone} />
        <StatCard label="High priority" value={highNotices.length} icon={AlertTriangle} warn={highNotices.length > 0} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Now / Next */}
        <div className="lg:col-span-2 space-y-6">
          <section className="cp-card p-6 bg-gradient-warm">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Right now</span>
            </div>
            {ongoing ? (
              <div>
                <div className="text-xs text-primary font-medium font-mono">{ongoing.start} – {ongoing.end}</div>
                <h3 className="font-display text-2xl mt-1">{ongoing.subject}</h3>
                <div className="text-sm text-muted-foreground mt-1">{ongoing.faculty} · Room {ongoing.room}</div>
              </div>
            ) : (
              <div>
                <h3 className="font-display text-2xl">No class in session</h3>
                <div className="text-sm text-muted-foreground mt-1">
                  {upcoming ? `Next: ${upcoming.subject} at ${upcoming.start} (${upcoming.room})` : "Nothing more scheduled today."}
                </div>
              </div>
            )}
          </section>

          {/* Schedule */}
          <section className="cp-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Schedule</div>
                <h3 className="font-display text-xl mt-0.5">Today, {day}</h3>
              </div>
              <Link to="/classes" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                All classes <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            {todays.length === 0 ? (
              <div className="p-8 text-sm text-muted-foreground text-center">No classes scheduled.</div>
            ) : (
              <ul>
                {todays.map((c) => {
                  const isOngoing = ongoing?.id === c.id;
                  const past = c.end <= now;
                  return (
                    <li key={c.id} className={cn("flex items-center gap-4 px-5 py-4 border-b last:border-b-0 border-border", past && "opacity-50")}>
                      <div className="font-mono text-xs text-muted-foreground w-24 shrink-0">{c.start}–{c.end}</div>
                      <div className={cn("h-2 w-2 rounded-full shrink-0", isOngoing ? "bg-success animate-pulse" : past ? "bg-border" : "bg-primary")} />
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{c.subject}</div>
                        <div className="text-xs text-muted-foreground truncate">{c.faculty}</div>
                      </div>
                      <span className="cp-chip bg-secondary text-secondary-foreground font-mono">{c.room}</span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </div>

        {/* Notices */}
        <aside className="space-y-6">
          <section className="cp-card overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-border">
              <div>
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Bulletin</div>
                <h3 className="font-display text-xl mt-0.5">Notices</h3>
              </div>
              <Link to="/notices" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
                View all <ArrowUpRight className="h-3 w-3" />
              </Link>
            </div>
            <ul>
              {notices.slice(0, 4).map((n) => (
                <li key={n.id} className={cn("p-5 border-b last:border-b-0 border-border", n.priority === "high" && "bg-[hsl(var(--warning)/0.08)]")}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <PriorityBadge p={n.priority} />
                    <span className="text-[11px] text-muted-foreground">{n.author}</span>
                  </div>
                  <div className="font-medium leading-snug">{n.title}</div>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{n.description}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="cp-card p-5">
            <div className="text-xs uppercase tracking-wider text-muted-foreground mb-3">Free rooms · now</div>
            <div className="flex flex-wrap gap-2">
              {free.map((r) => (
                <span key={r.room}
                  className={cn("cp-chip font-mono",
                    r.free ? "bg-primary-soft text-primary" : "bg-muted text-muted-foreground line-through")}>
                  {r.room}
                </span>
              ))}
            </div>
          </section>
        </aside>
      </div>
    </>
  );
}

function StatCard({ label, value, icon: Icon, accent, warn }: any) {
  return (
    <div className={cn("cp-card p-5", accent && "bg-gradient-sage text-primary-foreground border-transparent", warn && "border-warning/40")}>
      <div className="flex items-center justify-between">
        <div className={cn("text-[11px] uppercase tracking-wider", accent ? "text-primary-foreground/80" : "text-muted-foreground")}>{label}</div>
        <Icon className={cn("h-4 w-4", accent ? "text-primary-foreground/80" : "text-muted-foreground")} />
      </div>
      <div className="font-display text-3xl mt-2">{value}</div>
    </div>
  );
}

export function PriorityBadge({ p }: { p: "high" | "medium" | "low" }) {
  const map = {
    high: "bg-[hsl(var(--warning)/0.18)] text-[hsl(var(--warning-foreground))] border border-[hsl(var(--warning)/0.4)]",
    medium: "bg-primary-soft text-primary",
    low: "bg-muted text-muted-foreground",
  } as const;
  return <span className={cn("cp-chip uppercase tracking-wider text-[10px]", map[p])}>{p}</span>;

<div style={{ marginBottom: 20 }}>
  <button className="cp-btn role-non-student">
    Create Class
  </button>

  <button className="cp-btn role-faculty">
    Add Notice
  </button>

  <button className="cp-btn role-admin">
    Manage Users
  </button>
</div>
}



