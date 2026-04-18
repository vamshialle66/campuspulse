import { useMemo, useState } from "react";
import { useStore, ROOMS, DAYS, todayDay, nowHHMM, findFreeRooms } from "@/store/campus";
import { PageHeader } from "@/components/layout/AppLayout";
import { CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function FreeRooms() {
  const { classes } = useStore();
  const [day, setDay] = useState(todayDay());
  const [time, setTime] = useState(nowHHMM());

  const status = useMemo(() => findFreeRooms(classes, day, time), [classes, day, time]);

  // Build room utilization for the day (which slots are busy)
  const utilization = useMemo(() => {
    return ROOMS.map((room) => {
      const slots = classes.filter((c) => c.room === room && c.day === day).sort((a, b) => a.start.localeCompare(b.start));
      return { room, slots };
    });
  }, [classes, day]);

  return (
    <>
      <PageHeader
        eyebrow="Availability"
        title="Find a Free Room"
        description="Pick a day and time — we'll cross-check the schedule and tell you what's open."
      />

      <div className="cp-card p-5 mb-6 flex flex-col md:flex-row gap-4 md:items-end">
        <div className="flex-1">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Day</div>
          <div className="flex flex-wrap gap-1.5">
            {DAYS.map((d) => (
              <button key={d} onClick={() => setDay(d)}
                className={cn("px-3 py-1.5 rounded-full text-sm border transition-colors",
                  day === d ? "bg-foreground text-background border-foreground" : "bg-surface border-border")}>
                {d}
              </button>
            ))}
          </div>
        </div>
        <div className="md:w-44">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground mb-2">Time</div>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
            className="w-full rounded-lg border border-input bg-surface px-3 py-2 font-mono text-sm" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {status.map((s) => (
          <div key={s.room}
            className={cn("cp-card p-4 text-center transition-transform hover:-translate-y-0.5",
              s.free ? "bg-primary-soft border-primary/20" : "")}>
            <div className="font-mono text-2xl font-semibold">{s.room}</div>
            <div className={cn("inline-flex items-center gap-1 mt-2 text-xs font-medium",
              s.free ? "text-primary" : "text-muted-foreground")}>
              {s.free ? <><CheckCircle2 className="h-3.5 w-3.5" /> Free</> : <><XCircle className="h-3.5 w-3.5" /> Occupied</>}
            </div>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl mb-4">Day utilization · {day}</h2>
      <div className="cp-card divide-y divide-border">
        {utilization.map((u) => (
          <div key={u.room} className="grid grid-cols-12 gap-3 items-center px-5 py-4">
            <div className="col-span-3 md:col-span-2 font-mono font-medium">{u.room}</div>
            <div className="col-span-9 md:col-span-10">
              {u.slots.length === 0 ? (
                <div className="text-xs text-muted-foreground italic">Free all day</div>
              ) : (
                <div className="flex flex-wrap gap-1.5">
                  {u.slots.map((s) => (
                    <span key={s.id} className="cp-chip bg-secondary text-secondary-foreground font-mono">
                      {s.start}–{s.end} · {s.subject}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
