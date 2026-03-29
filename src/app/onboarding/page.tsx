import Link from "next/link";
import Button from "@/components/ui/Button";

const steps = [
  {
    icon: "🧠",
    title: "Smarter Scheduling",
    description:
      "ShiftBrain learns your team's patterns and helps build fair, efficient schedules automatically.",
  },
  {
    icon: "📅",
    title: "Shift Visibility",
    description:
      "Everyone sees their shifts in real-time. No more confusion or missed updates.",
  },
  {
    icon: "⚡",
    title: "Instant Alerts",
    description:
      "Get notified about shift changes, open slots, and coverage gaps the moment they happen.",
  },
];

export default function OnboardingPage() {
  return (
    <main className="flex min-h-screen flex-col bg-surface px-6 py-12">
      {/* Logo / Brand */}
      <div className="mb-12 text-center">
        <span className="inline-flex items-center gap-2 rounded-2xl bg-surface-card px-4 py-2 text-sm font-semibold text-zinc-300 border border-zinc-800">
          <span className="text-brand-light text-base">●</span> ShiftBrain
        </span>
      </div>

      {/* Headline */}
      <div className="mb-10 text-center">
        <h1 className="text-3xl font-bold leading-tight text-zinc-100 mb-3">
          Work smarter,{" "}
          <span className="text-brand-light">not harder</span>
        </h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs mx-auto">
          The intelligent shift management app built for teams that move fast.
        </p>
      </div>

      {/* Feature Cards */}
      <div className="mb-10 space-y-3 max-w-sm mx-auto w-full">
        {steps.map((step) => (
          <div
            key={step.title}
            className="flex items-start gap-4 rounded-2xl bg-surface-card border border-zinc-800 p-4"
          >
            <span className="text-2xl">{step.icon}</span>
            <div>
              <h3 className="text-sm font-semibold text-zinc-100 mb-0.5">
                {step.title}
              </h3>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-auto max-w-sm mx-auto w-full space-y-3">
        <Link href="/dashboard" className="block">
          <Button size="lg" fullWidth>
            Get Started
          </Button>
        </Link>
        <Link href="/dashboard" className="block">
          <Button variant="ghost" size="lg" fullWidth>
            I already have an account
          </Button>
        </Link>
      </div>
    </main>
  );
}
