import { useMemo } from "react";
import { useStore, DAYS } from "../store/campus";
import { PageHeader } from "../components/layout/AppLayout";
import { PriorityBadge } from "./Dashboard";
import { CalendarDays, Megaphone } from "lucide-react";

type Item =
  | { kind: "class"; day: string; time: string; sortKey: string; title: string; sub: string; room: string }
  | { kind: "notice"; day: string; time: string; sortKey: string; title: string; sub: string; priority: "high" | "medium" | "low" };

export default function Timeline() {
  const { classes, notices } = useStore();

  const items: Item[] = useMemo(() => {
    const cls: Item[] = classes.map((c) => ({
      kind: "class",
      day: c.day,
      time: `${c.start}–${c.end}`,
      sortKey: `${DAYS.indexOf(c.day)}-${c.start}`,
      title: c.subject,
      sub: `${c.faculty} · Room ${c.room}`,
      room: c.room,
    }));

    const nts: Item[] = notices.map((n) => {
      const d = new Date(n.createdAt);
      return {
        kind: "notice",
        day: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"][d.getDay()],
        time: d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        sortKey: `9-${d.getTime()}`,
        title: n.title,
        sub: n.description,
        priority: n.priority,
      };
    });

    // ✅ FIX: latest first
    return [...cls, ...nts].sort((a, b) =>
      b.sortKey.localeCompare(a.sortKey)
    );

  }, [classes, notices]);

  const grouped = useMemo(() => {
    const m = new Map<string, Item[]>();
    items.forEach((i) => {
      if (!m.has(i.day)) m.set(i.day, []);
      m.get(i.day)!.push(i);
    });

    return Array.from(m.entries()).sort(
      ([a], [b]) => DAYS.indexOf(a) - DAYS.indexOf(b)
    );
  }, [items]);

  return (
    <>
      <PageHeader
        eyebrow="Activity"
        title="Campus Timeline"
        description="A unified, time-ordered view of classes and announcements across the week."
      />

      <div className="space-y-10">
        {grouped.map(([day, list]) => (
          <section key={day}>
            <div className="flex items-baseline gap-3 mb-4">
              <h2 className="font-display text-2xl">{day}</h2>
              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                {list.length} events
              </span>
            </div>

            <ol className="relative border-l border-border pl-6 space-y-4">
              {list.map((i, idx) => (
                <li key={idx} className="relative">
                  <span
                    className={`absolute -left-[31px] top-2 h-3 w-3 rounded-full ring-4 ring-background ${
                      i.kind === "class" ? "bg-primary" : "bg-accent"
                    }`}
                  />

                  <div className="cp-card p-4">
                    <div className="flex items-center gap-2 mb-1.5">
                      {i.kind === "class" ? (
                        <span className="cp-chip bg-primary-soft text-primary">
                          <CalendarDays className="h-3 w-3" /> Class
                        </span>
                      ) : (
                        <span className="cp-chip bg-[hsl(var(--accent)/0.2)] text-accent-foreground">
                          <Megaphone className="h-3 w-3" /> Notice
                        </span>
                      )}

                      <span className="font-mono text-xs text-muted-foreground">
                        {i.time}
                      </span>

                      {i.kind === "notice" && (
                        <PriorityBadge p={i.priority} />
                      )}
                    </div>

                    <div className="font-medium">{i.title}</div>
                    <div className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                      {i.sub}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </section>
        ))}
      </div>
    </>
  );
}