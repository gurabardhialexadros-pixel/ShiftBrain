import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

type ShiftStatus = "confirmed" | "pending" | "open";

interface Shift {
  id: number;
  role: string;
  date: string;
  time: string;
  location: string;
  status: ShiftStatus;
}

const shifts: Shift[] = [
  {
    id: 1,
    role: "Floor Lead",
    date: "Sun, Mar 30",
    time: "08:00 – 16:00",
    location: "Store A",
    status: "confirmed",
  },
  {
    id: 2,
    role: "Cashier",
    date: "Mon, Mar 31",
    time: "12:00 – 20:00",
    location: "Store B",
    status: "pending",
  },
  {
    id: 3,
    role: "Supervisor",
    date: "Wed, Apr 2",
    time: "06:00 – 14:00",
    location: "Store A",
    status: "confirmed",
  },
  {
    id: 4,
    role: "Stocking",
    date: "Thu, Apr 3",
    time: "20:00 – 04:00",
    location: "Warehouse",
    status: "open",
  },
  {
    id: 5,
    role: "Floor Lead",
    date: "Sat, Apr 5",
    time: "10:00 – 18:00",
    location: "Store A",
    status: "confirmed",
  },
];

const statusVariant: Record<ShiftStatus, "success" | "warning" | "info"> = {
  confirmed: "success",
  pending: "warning",
  open: "info",
};

const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const today = 0; // Sunday index for demo

export default function ShiftsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="My Shifts"
        subtitle="March 2026"
        action={
          <Button size="sm" variant="secondary">
            + Add
          </Button>
        }
      />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-6">
        {/* Week Strip */}
        <div className="flex items-center justify-between gap-1">
          {weekDays.map((day, i) => (
            <div
              key={day}
              className={[
                "flex flex-1 flex-col items-center gap-1 rounded-xl py-2 text-xs font-medium transition-colors",
                i === today
                  ? "bg-brand text-white"
                  : "text-zinc-500 hover:bg-surface-card",
              ].join(" ")}
            >
              <span>{day}</span>
              <span
                className={[
                  "text-sm font-semibold",
                  i === today ? "text-white" : "text-zinc-300",
                ].join(" ")}
              >
                {29 + i}
              </span>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {["All", "Confirmed", "Pending", "Open"].map((tab, i) => (
            <button
              key={tab}
              className={[
                "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                i === 0
                  ? "bg-brand text-white"
                  : "bg-surface-card text-zinc-400 hover:text-zinc-200 border border-zinc-800",
              ].join(" ")}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Shift List */}
        <section className="space-y-3">
          {shifts.map((shift) => (
            <Card key={shift.id} className="flex items-start gap-3">
              {/* Time Column */}
              <div className="flex-shrink-0 w-16 text-center">
                <p className="text-xs font-semibold text-zinc-100">
                  {shift.time.split("–")[0].trim()}
                </p>
                <p className="text-xs text-zinc-600">–</p>
                <p className="text-xs font-semibold text-zinc-400">
                  {shift.time.split("–")[1].trim()}
                </p>
              </div>

              {/* Divider */}
              <div className="w-px self-stretch bg-zinc-800" />

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <p className="text-sm font-semibold text-zinc-100 truncate">
                    {shift.role}
                  </p>
                  <Badge variant={statusVariant[shift.status]}>
                    {shift.status}
                  </Badge>
                </div>
                <p className="text-xs text-zinc-500">
                  {shift.date} · {shift.location}
                </p>
              </div>
            </Card>
          ))}
        </section>

        {/* Empty state (hidden when shifts exist, shown for demo awareness) */}
        <div className="hidden flex-col items-center justify-center py-12 text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-card">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-7 w-7 text-zinc-600"
            >
              <path
                fillRule="evenodd"
                d="M6.75 2.25A.75.75 0 0 1 7.5 3v1.5h9V3A.75.75 0 0 1 18 3v1.5h.75a3 3 0 0 1 3 3v11.25a3 3 0 0 1-3 3H5.25a3 3 0 0 1-3-3V7.5a3 3 0 0 1 3-3H6V3a.75.75 0 0 1 .75-.75Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-zinc-400">No shifts yet</p>
          <p className="mt-1 text-xs text-zinc-600">
            Add your first shift to get started
          </p>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
