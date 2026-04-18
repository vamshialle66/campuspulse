import { useState } from "react";
import { useStore } from "@/store/campus";
import { PageHeader } from "@/components/layout/AppLayout";
import { PriorityBadge } from "@/pages/Dashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const fmt = (ts: number) => {
  const d = new Date(ts);
  const now = Date.now();
  const diff = (now - ts) / 60000;
  if (diff < 60) return `${Math.max(1, Math.floor(diff))}m ago`;
  if (diff < 60 * 24) return `${Math.floor(diff / 60)}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

export default function Notices() {
  const { notices, removeNotice, role } = useStore();
  const canEdit = role !== "student";
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState<"all" | "high" | "medium" | "low">("all");

  const list = filter === "all" ? notices : notices.filter((n) => n.priority === filter);

  return (
    <>
      <PageHeader
        eyebrow="Bulletin"
        title="Notices & Announcements"
        description="Campus-wide updates. High-priority notices are highlighted at the top."
        action={
          canEdit && (
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2"><Plus className="h-4 w-4" /> New notice</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle className="font-display text-2xl">Post a notice</DialogTitle></DialogHeader>
                <NoticeForm onDone={() => setOpen(false)} />
              </DialogContent>
            </Dialog>
          )
        }
      />

      <div className="flex gap-2 mb-5">
        {(["all", "high", "medium", "low"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={cn("px-3.5 py-1.5 rounded-full text-sm border capitalize transition-colors",
              filter === f ? "bg-foreground text-background border-foreground" : "bg-surface border-border")}>
            {f}
          </button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {list.map((n) => (
          <article key={n.id}
            className={cn("cp-card p-5 relative",
              n.priority === "high" && "bg-[hsl(var(--warning)/0.08)] border-[hsl(var(--warning)/0.4)]")}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <PriorityBadge p={n.priority} />
                <span className="text-[11px] text-muted-foreground">{n.author} · {fmt(n.createdAt)}</span>
              </div>
              {canEdit && (
                <button onClick={() => { removeNotice(n.id); toast.success("Notice deleted"); }}
                  className="text-muted-foreground hover:text-destructive p-1.5 rounded-lg hover:bg-destructive/10">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <h3 className="font-display text-xl leading-snug">{n.title}</h3>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{n.description}</p>
          </article>
        ))}
        {list.length === 0 && (
          <div className="md:col-span-2 cp-card p-10 text-center text-sm text-muted-foreground">No notices.</div>
        )}
      </div>
    </>
  );
}

function NoticeForm({ onDone }: { onDone: () => void }) {
  const { addNotice, role } = useStore();
  const [form, setForm] = useState({
    title: "", description: "", priority: "medium" as "high" | "medium" | "low",
    author: role === "admin" ? "Administration" : role === "faculty" ? "Faculty" : "Student",
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.description.trim()) { toast.error("Title and description required"); return; }
    addNotice(form);
    toast.success("Notice posted");
    onDone();
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Title"><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="e.g. Library closed Friday" /></Field>
      <Field label="Description">
        <Textarea rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Add details students and faculty should know." />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Priority">
          <Select value={form.priority} onValueChange={(v: any) => setForm({ ...form, priority: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <Field label="Author"><Input value={form.author} onChange={(e) => setForm({ ...form, author: e.target.value })} /></Field>
      </div>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="ghost" onClick={onDone}>Cancel</Button>
        <Button type="submit">Post notice</Button>
      </div>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="space-y-1.5"><Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>{children}</div>;
}
