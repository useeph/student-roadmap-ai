"use client";

import { useRef, useEffect, useState } from "react";
import {
  Target,
  FolderKanban,
  Users,
  GraduationCap,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { RoadmapSectionId } from "@/lib/ai/chat-roadmap";
import { ROADMAP_SECTIONS } from "@/lib/ai/chat-roadmap";

const SECTION_ICONS: Record<RoadmapSectionId, LucideIcon> = {
  strategy: Target,
  projects: FolderKanban,
  extracurriculars: Users,
  college: GraduationCap,
  essay: PenLine,
};

export interface RoadmapSectionTabsProps {
  /** Sections that have content (messages present) */
  availableSections: RoadmapSectionId[];
  /** Currently focused section based on scroll position */
  activeSection: RoadmapSectionId | null;
  /** Personalized college question, e.g. "How realistic is Stanford for me?" */
  collegeQuestion?: string;
  onTabClick: (section: RoadmapSectionId) => void;
  className?: string;
}

export function RoadmapSectionTabs({
  availableSections,
  activeSection,
  collegeQuestion,
  onTabClick,
  className,
}: RoadmapSectionTabsProps) {
  return (
    <div
      className={cn(
        "flex gap-1 p-1 rounded-xl bg-slate-900/60 border border-slate-700/50",
        className
      )}
      role="tablist"
      aria-label="Roadmap sections"
    >
      {ROADMAP_SECTIONS.map((section) => {
        const Icon = SECTION_ICONS[section.id];
        const isAvailable = availableSections.includes(section.id);
        const isActive = activeSection === section.id;

        const question =
          section.id === "college" && collegeQuestion
            ? collegeQuestion
            : section.defaultQuestion;

        return (
          <button
            key={section.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-disabled={!isAvailable}
            title={
              isAvailable
                ? `Jump to ${section.label}`
                : `Ask about ${section.label}: ${question}`
            }
            onClick={() => onTabClick(section.id)}
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950",
              isActive
                ? "bg-indigo-600/40 text-indigo-100 border border-indigo-500/40 shadow-sm"
                : isAvailable
                  ? "text-slate-300 hover:bg-slate-700/60 hover:text-white border border-transparent"
                  : "text-slate-500 border border-transparent hover:text-slate-400 hover:bg-slate-800/40"
            )}
          >
            <Icon
              className={cn(
                "h-4 w-4 shrink-0",
                isActive ? "text-indigo-300" : "text-slate-400"
              )}
            />
            <span className="hidden sm:inline">{section.label}</span>
          </button>
        );
      })}
    </div>
  );
}

/** Hook to track which section is in view for active tab state */
export function useSectionInView(
  scrollContainerRef: React.RefObject<HTMLElement | null>,
  availableSections: RoadmapSectionId[]
) {
  const [activeSection, setActiveSection] = useState<RoadmapSectionId | null>(
    null
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || availableSections.length === 0) return;

    const sectionIds = availableSections.map((s) => `section-${s}`);
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => {
            const aRect = a.boundingClientRect;
            const bRect = b.boundingClientRect;
            return aRect.top - bRect.top;
          });
        if (visible.length > 0) {
          const top = visible[0];
          const id = top.target.id.replace("section-", "") as RoadmapSectionId;
          if (availableSections.includes(id)) {
            setActiveSection(id);
          }
        }
      },
      {
        root: container,
        rootMargin: "-20% 0px -60% 0px",
        threshold: 0,
      }
    );

    elements.forEach((el) => observerRef.current?.observe(el));
    return () => {
      observerRef.current?.disconnect();
      observerRef.current = null;
    };
  }, [scrollContainerRef, availableSections.join(",")]);

  return activeSection;
}
