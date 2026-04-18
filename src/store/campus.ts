import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Role = "student" | "faculty" | "admin";

export type ClassEntry = {
  id: string;
  room: string;
  subject: string;
  faculty: string;
  day: string; // Mon, Tue...
  start: string; // "09:00"
  end: string;   // "10:00"
  createdAt: number;
};

export type Notice = {
  id: string;
  title: string;
  description: string;
  priority: "high" | "medium" | "low";
  author: string;
  createdAt: number;
};

export const ROOMS = ["A101", "A102", "B201", "B202", "C301", "Lab-1"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type State = {
  role: Role;
  setRole: (r: Role) => void;
  classes: ClassEntry[];
  notices: Notice[];
  addClass: (c: Omit<ClassEntry, "id" | "createdAt">) => { ok: boolean; error?: string };
  removeClass: (id: string) => void;
  addNotice: (n: Omit<Notice, "id" | "createdAt">) => void;
  removeNotice: (id: string) => void;
};

const uid = () => Math.random().toString(36).slice(2, 10);

const seedClasses: ClassEntry[] = [
  { id: uid(), room: "A101", subject: "Linear Algebra", faculty: "Dr. Mehra", day: "Mon", start: "09:00", end: "10:00", createdAt: Date.now() - 90000 },
  { id: uid(), room: "B201", subject: "Intro to Algorithms", faculty: "Prof. Iyer", day: "Mon", start: "10:15", end: "11:15", createdAt: Date.now() - 80000 },
  { id: uid(), room: "A102", subject: "World Literature", faculty: "Ms. Khan", day: "Mon", start: "11:30", end: "12:30", createdAt: Date.now() - 70000 },
  { id: uid(), room: "Lab-1", subject: "Physics Lab", faculty: "Dr. Rao", day: "Mon", start: "14:00", end: "16:00", createdAt: Date.now() - 60000 },
  { id: uid(), room: "B202", subject: "Microeconomics", faculty: "Prof. Nair", day: "Tue", start: "09:00", end: "10:00", createdAt: Date.now() - 50000 },
];

const seedNotices: Notice[] = [
  { id: uid(), title: "Mid-term schedule released", description: "Mid-term examinations will begin from the 28th. Check the portal for your slot.", priority: "high", author: "Examination Cell", createdAt: Date.now() - 3600_000 },
  { id: uid(), title: "Library hours extended", description: "The central library will remain open till 11pm starting this week.", priority: "medium", author: "Library", createdAt: Date.now() - 7200_000 },
  { id: uid(), title: "Inter-college fest registrations", description: "Pulse'26 registrations are now open. Visit the student council desk.", priority: "low", author: "Student Council", createdAt: Date.now() - 86400_000 },
];

const overlap = (aS: string, aE: string, bS: string, bE: string) => aS < bE && bS < aE;

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      role: "admin",
      setRole: (r) => set({ role: r }),
      classes: seedClasses,
      notices: seedNotices,
      addClass: (c) => {
        const conflict = get().classes.find(
          (x) => x.room === c.room && x.day === c.day && overlap(c.start, c.end, x.start, x.end)
        );
        if (conflict) {
          return { ok: false, error: `Conflict with ${conflict.subject} (${conflict.start}–${conflict.end}) in ${conflict.room}` };
        }
        if (c.start >= c.end) return { ok: false, error: "End time must be after start time" };
        set({ classes: [...get().classes, { ...c, id: uid(), createdAt: Date.now() }] });
        return { ok: true };
      },
      removeClass: (id) => set({ classes: get().classes.filter((c) => c.id !== id) }),
      addNotice: (n) => set({ notices: [{ ...n, id: uid(), createdAt: Date.now() }, ...get().notices] }),
      removeNotice: (id) => set({ notices: get().notices.filter((n) => n.id !== id) }),
    }),
    { name: "campuspulse-store" }
  )
);

export const findFreeRooms = (classes: ClassEntry[], day: string, time: string) => {
  const busy = new Set(
    classes.filter((c) => c.day === day && c.start <= time && time < c.end).map((c) => c.room)
  );
  return ROOMS.map((r) => ({ room: r, free: !busy.has(r) }));
};

export const todayDay = () => {
  const d = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  return d === "Sun" ? "Mon" : d;
};

export const nowHHMM = () => {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
};
