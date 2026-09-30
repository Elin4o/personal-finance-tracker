"use client";

import { Link } from "@/i18n/navigation";
import { Check, Circle, ChevronRight } from "lucide-react";

interface OnboardingStep {
  label: string;
  href: string;
  done: boolean;
}

interface OnboardingChecklistProps {
  steps: OnboardingStep[];
}

export default function OnboardingChecklist({
  steps,
}: OnboardingChecklistProps) {
  const allDone = steps.every((s) => s.done);
  if (allDone) return null;

  const doneCount = steps.filter((s) => s.done).length;

  return (
    <div className="rounded-lg border p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="font-medium">Get started</h2>
        <span className="text-xs text-muted-foreground">
          {doneCount} of {steps.length} done
        </span>
      </div>

      <ul className="space-y-1">
        {steps.map((step) => (
          <li key={step.href}>
            {step.done ? (
              <div className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-muted-foreground">
                <Check className="size-4 text-success" />
                <span className="line-through">{step.label}</span>
              </div>
            ) : (
              <Link
                href={step.href}
                className="flex items-center gap-2 rounded-md px-2 py-2 text-sm transition-colors hover:bg-muted/50"
              >
                <Circle className="size-4 text-muted-foreground" />
                <span className="flex-1">{step.label}</span>
                <ChevronRight className="size-4 text-muted-foreground" />
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
