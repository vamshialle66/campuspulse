import { useMemo, useState } from "react";
import { useStore, ROOMS, DAYS } from "@/store/campus";
import { PageHeader } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function Classes() {
  const { classes, addClass, removeClass, role } = useStore();
  const canEdit = role !== "student";
  const [open, setOpen] = useState(false);
  const [filterDay, setFilterDay] = useState<string>("All");

  const list = useMemo(() => {
    const arr = filterDay === "All" ? classes : classes.filter((c) => c.day === filterDay);
    return [...arr].sort((a, b) => DAYS.indexOf(a.day) - DAYS.indexOf(b.day) || a.start.localeCompare(b.start));
  }, [classes, filterDay]);

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="All Classes"
        description="Browse the full weekly schedule. Faculty and admin can add or remove entries."
        action={
          canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> Add class</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display text-2xl">New class</DialogTitle></DialogHeader>
                <ClassForm onDone={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {["All", ...DAYS].map((d) => (
          <button key={d}
            onClick={() => setFilterDay(d)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm border transition-colors ${
              filterDay === d ? "bg-foreground text-background border-foreground" : "bg-surface border-border hover:border-foreground/40"
            }`}>
            {d}
          </button>
        ))}
      </div>

      <div className="cp-card overflow-hidden">
        {list.length === 0 ? (
          <div className="p-10 text-center text-sm text-muted-foreground">No classes scheduled.</div>
        ) : (
          <div className="divide-y divide-border">
            <div className="hidden md:grid grid-cols-12 px-5 py-3 text-[11px] uppercase tracking-wider text-muted-foreground bg-surface-muted">
              <div className="col-span-1">Day</div>
              <div className="col-span-2">Time</div>
              <div className="col-span-2">Room</div>
              <div className="col-span-4">Subject</div>
              <div className="col-span-2">Faculty</div>
              <div className="col-span-1 text-right">·</div>
            </div>
            {list.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-2 px-5 py-4 items-center hover:bg-surface-muted/50">
                <div className="col-span-2 md:col-span-1 text-xs font-medium text-primary">{c.day}</div>
                <div className="col-span-4 md:col-span-2 font-mono text-sm">{c.start}–{c.end}</div>
                <div className="col-span-3 md:col-span-2"><span className="cp-chip bg-secondary text-secondary-foreground font-mono">{c.room}</span></div>
                <div className="col-span-12 md:col-span-4 font-medium">{c.subject}</div>
                <div className="col-span-9 md:col-span-2 text-sm text-muted-foreground">{c.faculty}</div>
                <div className="col-span-3 md:col-span-1 flex justify-end">
                  {canEdit && (
                    <button onClick={() => { removeClass(c.id); toast.success("Class removed"); }}
                      className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10 transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function ClassForm({ onDone }: { onDone: () => void }) {
  const { addClass } = useStore();
  const [form, setForm] = useState({ subject: "", faculty: "", room: ROOMS[0], day: DAYS[0], start: "09:00", end: "10:00" });
  const [error, setError] = useState<string | null>(null);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.subject.trim() || !form.faculty.trim()) { setError("Subject and faculty are required."); return; }
    const res = addClass(form);
    if (!res.ok) { setError(res.error || "Could not add class"); return; }
    toast.success("Class added");
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Subject"><Input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Data Structures" /></Field>
        <Field label="Faculty"><Input value={form.faculty} onChange={(e) => setForm({ ...form, faculty: e.target.value })} placeholder="e.g. Dr. Iyer" /></Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Room">
          <Select value={form.room} onValueChange={(v) => setForm({ ...form, room: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{ROOMS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
        <Field label="Day">
          <Select value={form.day} onValueChange={(v) => setForm({ ...form, day: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>{DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}</SelectContent>
          </Select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start"><Input type="time" value={form.start} onChange={(e) => setForm({ ...form, start: e.target.value })} /></Field>
        <Field label="End"><Input type="time" value={form.end} onChange={(e) => setForm({ ...form, end: e.target.value })} /></Field>
      </div>
      {error && (
        <div className="flex items-start gap-2 text-sm text-destructive bg-destructive/10 border border-destructive/30 rounded-lg p-3">
          <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" /><span>{error}</span>
        </div>
      )}
      <div className="flex justify-end gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit">Add class</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
