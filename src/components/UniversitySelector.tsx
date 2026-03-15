"use client";

import * as React from "react";
import { X, Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { RECOMMENDED_UNIVERSITIES, UNIVERSITIES } from "@/constants/universities";

interface UniversitySelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  label?: string;
  helperText?: string;
  maxSelections?: number;
  className?: string;
}

export function UniversitySelector({
  value,
  onChange,
  label = "Target colleges",
  helperText,
  maxSelections = 10,
  className,
}: UniversitySelectorProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const searchLower = search.toLowerCase().trim();
  const filtered = React.useMemo(() => {
    if (!searchLower) return [];
    return UNIVERSITIES.filter((u) => {
      const matchLabel = u.label.toLowerCase().includes(searchLower);
      const matchAliases = u.aliases.some((a) =>
        a.toLowerCase().includes(searchLower)
      );
      return matchLabel || matchAliases;
    }).slice(0, 12);
  }, [searchLower]);

  const recommended = RECOMMENDED_UNIVERSITIES.filter(
    (u) => !value.includes(u.value)
  );

  const displayResults = searchLower ? filtered : recommended.slice(0, 5);
  const showRecommended = !searchLower && recommended.length > 0;

  React.useEffect(() => {
    if (!open) return;
    setHighlightIndex(0);
    inputRef.current?.focus();
  }, [open, search, displayResults.length]);

  React.useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const addUniversity = (uniValue: string) => {
    if (!value.includes(uniValue) && value.length < maxSelections) {
      onChange([...value, uniValue]);
    }
    setSearch("");
    setHighlightIndex(0);
  };

  const removeUniversity = (uniValue: string) => {
    onChange(value.filter((v) => v !== uniValue));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      inputRef.current?.blur();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, displayResults.length - 1));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter" && displayResults[highlightIndex]) {
      e.preventDefault();
      addUniversity(displayResults[highlightIndex].value);
    }
  };

  return (
    <div ref={containerRef} className={cn("relative space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-200">{label}</label>
      )}
      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}

      <div
        className={cn(
          "min-h-[42px] rounded-lg border border-slate-600 bg-slate-800 px-2 py-2",
          "focus-within:ring-2 focus-within:ring-indigo-500 focus-within:ring-offset-2 focus-within:ring-offset-slate-900",
          open && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
        )}
      >
        <div className="flex flex-wrap gap-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 px-2 py-1 text-sm text-indigo-200 border border-indigo-500/30"
            >
              {v}
              <button
                type="button"
                onClick={() => removeUniversity(v)}
                className="rounded p-0.5 hover:bg-indigo-500/30 text-indigo-300 hover:text-white transition-colors"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {value.length < maxSelections && (
            <div className="flex flex-1 min-w-[140px]">
              <Search className="h-4 w-4 text-slate-500 shrink-0 mt-2" />
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onFocus={() => setOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={value.length === 0 ? "Search universities..." : "Add more..."}
                className="flex-1 min-w-0 bg-transparent px-2 py-1 text-sm text-white placeholder:text-slate-500 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {open && (displayResults.length > 0 || searchLower) && (
        <div
          className="absolute z-50 mt-0.5 w-full max-w-[var(--input-width,100%)] rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl shadow-black/20"
          style={{ width: containerRef.current?.offsetWidth }}
        >
          {showRecommended && (
            <div className="px-2 py-1.5 border-b border-slate-600">
              <div className="flex items-center gap-1.5 text-xs font-medium text-amber-400/90">
                <Star className="h-3.5 w-3.5" />
                Popular choices
              </div>
            </div>
          )}
          <ul className="max-h-60 overflow-auto py-1">
            {displayResults.length === 0 ? (
              <li className="px-3 py-4 text-sm text-slate-500 text-center">
                No universities match &quot;{search}&quot;
              </li>
            ) : (
              displayResults.map((u, i) => (
                <li key={u.value}>
                  <button
                    type="button"
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                      "text-slate-200 hover:bg-slate-700/50",
                      value.includes(u.value) && "opacity-60",
                      i === highlightIndex && "bg-slate-700/50"
                    )}
                    onClick={() => addUniversity(u.value)}
                    disabled={value.includes(u.value)}
                  >
                    {u.recommended && (
                      <Star className="h-3.5 w-3.5 text-amber-400/80 shrink-0" />
                    )}
                    <span className={u.recommended ? "" : "pl-5"}>{u.label}</span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      )}

      {value.length >= maxSelections && (
        <p className="text-xs text-slate-500">
          Maximum {maxSelections} colleges. Remove one to add another.
        </p>
      )}
    </div>
  );
}
