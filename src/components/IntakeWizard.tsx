"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export const STEPS = [
  { id: "basics", label: "Basics", short: "Basics" },
  { id: "academics", label: "Academics", short: "Academics" },
  { id: "activities", label: "Activities", short: "Activities" },
  { id: "goals", label: "Goals", short: "Goals" },
  { id: "colleges", label: "Colleges", short: "Colleges" },
] as const;

interface IntakeWizardProps {
  currentStep: number;
  onStepChange: (step: number) => void;
  children: React.ReactNode;
  canGoNext?: boolean;
  canGoPrev?: boolean;
  isLastStep?: boolean;
}

export function IntakeWizard({
  currentStep,
  onStepChange,
  children,
  canGoNext = true,
  canGoPrev = true,
  isLastStep = false,
}: IntakeWizardProps) {
  const progress = ((currentStep + 1) / STEPS.length) * 100;

  return (
    <div className="space-y-8">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">
            Step {currentStep + 1} of {STEPS.length}
          </span>
          <span className="text-indigo-400 font-medium">{STEPS[currentStep].label}</span>
        </div>
        <div className="h-2 rounded-full bg-slate-800 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {/* Step dots */}
        <div className="flex justify-between pt-1">
          {STEPS.map((step, i) => (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepChange(i)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                i <= currentStep ? "text-indigo-400" : "text-slate-600"
              )}
            >
              <span
                className={cn(
                  "w-2 h-2 rounded-full transition-all duration-300",
                  i < currentStep && "bg-indigo-500",
                  i === currentStep && "bg-indigo-400 ring-4 ring-indigo-400/30 scale-125",
                  i > currentStep && "bg-slate-700"
                )}
              />
              <span className="text-[10px] font-medium hidden sm:block">{step.short}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content with animation */}
      <div
        key={currentStep}
        className="animate-in fade-in-50 slide-in-from-right-4 duration-300"
      >
        {children}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={() => onStepChange(currentStep - 1)}
          disabled={currentStep === 0 || !canGoPrev}
          className="gap-2"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
        {!isLastStep ? (
          <Button
            type="button"
            onClick={() => onStepChange(currentStep + 1)}
            disabled={!canGoNext}
            className="gap-2"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        ) : null}
      </div>
    </div>
  );
}

// Need to add Button import
import { Button } from "@/components/ui/Button";
