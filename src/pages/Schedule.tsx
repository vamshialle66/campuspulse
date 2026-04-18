import { useMemo, useState } from "react";
import { useStore, DAYS } from "../store/campus";
import { PageHeader } from "../components/layout/AppLayout";

export default function Schedule() {
  const { classes, addClass, removeClass, addNotice, role } = useStore();

  const [form, setForm] = useState({
    subject: "",
    faculty: "",
    room: "",
    start: "",
    end: "",
    day: "Mon",
  });

  // 🔥 GROUP DATA
  const grouped = useMemo(() => {
    const map = new Map();

    DAYS.forEach((d) => {
      map.set(
        d,
        classes
          .filter((c) => c.day === d)
          .sort((a, b) => a.start.localeCompare(b.start))
      );
    });

    return map;
  }, [classes]);

  // ✅ ADD CLASS
  const handleAdd = () => {
    const res = addClass(form);

    if (!res.ok) {
      alert(res.error);
      return;
    }

    alert("Class added successfully ✅");

    setForm({
      subject: "",
      faculty: "",
      room: "",
      start: "",
      end: "",
      day: "Mon",
    });
  };

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Weekly Schedule"
        description="Manage classes"
      />

      {/* ADD CLASS */}
      {role !== "student" && (
        <div className="border rounded-lg p-5 mb-6 bg-white shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Add Class</h2>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">

            <input
              placeholder="Subject"
              className="border p-2 rounded"
              value={form.subject}
              onChange={(e) =>
                setForm({ ...form, subject: e.target.value })
              }
            />

            <input
              placeholder="Faculty"
              className="border p-2 rounded"
              value={form.faculty}
              onChange={(e) =>
                setForm({ ...form, faculty: e.target.value })
              }
            />

            <input
              placeholder="Room (A101)"
              className="border p-2 rounded"
              value={form.room}
              onChange={(e) =>
                setForm({ ...form, room: e.target.value })
              }
            />

            <input
              type="time"
              className="border p-2 rounded"
              value={form.start}
              onChange={(e) =>
                setForm({ ...form, start: e.target.value })
              }
            />

            <input
              type="time"
              className="border p-2 rounded"
              value={form.end}
              onChange={(e) =>
                setForm({ ...form, end: e.target.value })
              }
            />

            <select
              className="border p-2 rounded"
              value={form.day}
              onChange={(e) =>
                setForm({ ...form, day: e.target.value })
              }
            >
              {DAYS.map((d) => (
                <option key={d}>{d}</option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleAdd}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
          >
            + Add Class
          </button>
        </div>
      )}

      {/* SCHEDULE */}
      <div className="space-y-6">
        {DAYS.map((d) => {
          const list = grouped.get(d) || [];

          return (
            <div key={d} className="border rounded-lg bg-white shadow-sm">
              
              <div className="px-5 py-3 bg-gray-100 font-medium">
                {d}
              </div>

              {list.length === 0 ? (
                <div className="p-5 text-gray-500">
                  No classes scheduled.
                </div>
              ) : (
                list.map((c) => (
                  <div
                    key={c.id}
                    className="grid grid-cols-12 px-5 py-4 border-t"
                  >
                    <div className="col-span-3">
                      {c.start}–{c.end}
                    </div>

                    <div className="col-span-2">
                      <span className="bg-gray-200 px-2 py-1 rounded">
                        {c.room}
                      </span>
                    </div>

                    <div className="col-span-4">
                      {c.subject}
                    </div>

                    <div className="col-span-3 text-gray-500">
                      {c.faculty}
                    </div>

                    {/* 🔥 CANCEL + AUTO NOTICE */}
                    {role !== "student" && (
                      <div className="col-span-12 mt-2">
                        <button
                          onClick={() => {
                            removeClass(c.id);

                            // 🔥 AUTO NOTICE
                            addNotice({
                              title: "Class Cancelled ❌",
                              description: `${c.subject} (${c.start}-${c.end}) in ${c.room} has been cancelled`,
                              priority: "high",
                              author: c.faculty,
                            });
                          }}
                          className="text-red-500 text-sm"
                        >
                          Cancel Class
                        </button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          );
        })}
      </div>
    </>
  );
}