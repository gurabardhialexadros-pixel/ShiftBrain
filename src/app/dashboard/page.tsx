import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import Card from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";

const stats = [
  { label: "This Week", value: "38h", sub: "scheduled" },
  { label: "Open Slots", value: "3", sub: "need coverage" },
  { label: "Team Size", value: "12", sub: "active members" },
];

const upcomingShifts = [
  {
    id: 1,
    role: "Floor Lead",
    date: "Today",
    time: "08:00 – 16:00",
    status: "confirmed" as const,
  },
  {
    id: 2,
    role: "Cashier",
    date: "Tomorrow",
    time: "12:00 – 20:00",
    status: "pending" as const,
  },
  {
    id: 3,
    role: "Supervisor",
    date: "Wed, Apr 2",
    time: "06:00 – 14:00",
    status: "confirmed" as const,
  },
];

const statusVariant: Record<string, "success" | "warning"> = {
  confirmed: "success",
  pending: "warning",
};

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <Header
        title="Dashboard"
        subtitle="Sunday, March 29"
        action={
          <div className="h-8 w-8 rounded-full bg-brand flex items-center justify-center text-xs font-semibold text-white">
            JD
          </div>
        }
      />

      <main className="flex-1 px-4 py-5 pb-28 max-w-md mx-auto w-full space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-3">
          {stats.map((stat) => (
            <Card key={stat.label} className="text-center py-4 px-2">
              <p className="text-xl font-bold text-zinc-100">{stat.value}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{stat.label}</p>
            </Card>
          ))}
        </div>

        {/* Next Shift Spotlight */}
        <Card elevated className="flex items-center gap-4">
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-brand/20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-6 w-6 text-brand-light"
            >
              <path
                fillRule="evenodd"
                d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25ZM12.75 6a.75.75 0 0 0-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 0 0 0-1.5h-3.75V6Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-zinc-500 mb-0.5">Next shift starts</p>
            <p className="text-sm font-semibold text-zinc-100 truncate">
              Floor Lead — 08:00 today
            </p>
          </div>
          <Badge variant="success">In 2h</Badge>
        </Card>

        {/* Upcoming Shifts */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-zinc-300">
              Upcoming Shifts
            </h2>
            <Button variant="ghost" size="sm">
              View all
            </Button>
          </div>
          <div className="space-y-2">
            {upcomingShifts.map((shift) => (
              <Card key={shift.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-100 truncate">
                    {shift.role}
                  </p>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {shift.date} · {shift.time}
                  </p>
                </div>
                <Badge variant={statusVariant[shift.status]}>
                  {shift.status}
                </Badge>
              </Card>
            ))}
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h2 className="text-sm font-semibold text-zinc-300 mb-3">
            Quick Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" size="md" fullWidth>
              + Add Shift
            </Button>
            <Button variant="secondary" size="md" fullWidth>
              Swap Request
            </Button>
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  );
}
