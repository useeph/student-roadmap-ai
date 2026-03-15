"use client";

import * as React from "react";
import { ChevronDown, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SingleSelectOption {
  label: string;
  value: string;
}

interface SearchableSingleSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SingleSelectOption[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  allowCustom?: boolean;
  className?: string;
}

export function SearchableSingleSelect({
  value,
  onChange,
  options,
  placeholder = "Select...",
  label,
  helperText,
  allowCustom = false,
  className,
}: SearchableSingleSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightIndex, setHighlightIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (o) => o.label.toLowerCase().includes(q) || o.value.toLowerCase().includes(q)
    );
  }, [options, search]);

  const selectedOption = options.find((o) => o.value === value) ?? null;

  React.useEffect(() => {
    if (!open) return;
    setHighlightIndex(0);
  }, [open, search, filtered.length]);

  React.useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", fn);
    return () => document.removeEventListener("mousedown", fn);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!open) {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === "Escape") {
      setOpen(false);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, filtered.length));
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
      return;
    }
    if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[highlightIndex]) {
        onChange(filtered[highlightIndex].value);
        setOpen(false);
        setSearch("");
      } else if (allowCustom && search.trim()) {
        onChange(search.trim());
        setOpen(false);
        setSearch("");
      }
    }
  };

  const handleSelect = (opt: SingleSelectOption) => {
    onChange(opt.value);
    setOpen(false);
    setSearch("");
  };

  return (
    <div ref={containerRef} className={cn("space-y-1.5", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-200">{label}</label>
      )}
      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
      <div className="relative">
        <div
          role="button"
          tabIndex={0}
          onClick={() => setOpen(!open)}
          onKeyDown={handleKeyDown}
          className={cn(
            "flex w-full items-center justify-between gap-2 rounded-lg border border-slate-600 bg-slate-800 px-3 py-2.5 text-left text-sm text-white cursor-pointer",
            "hover:border-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900",
            open && "ring-2 ring-indigo-500 ring-offset-2 ring-offset-slate-900"
          )}
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-label={label ?? placeholder}
        >
          <span className={selectedOption ? "" : "text-slate-500"}>
            {selectedOption?.label ?? placeholder}
          </span>
          <span className="flex items-center gap-1">
            {value && (
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => {
                  e.stopPropagation();
                  onChange("");
                }}
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onChange(""))}
                className="rounded p-0.5 hover:bg-slate-600 text-slate-400 hover:text-white"
                aria-label="Clear"
              >
                <X className="h-4 w-4" />
              </span>
            )}
            <ChevronDown
              className={cn("h-4 w-4 text-slate-400 shrink-0", open && "rotate-180")}
            />
          </span>
        </div>

        {open && (
          <div
            className="absolute z-50 mt-1 w-full rounded-lg border border-slate-600 bg-slate-800 py-1 shadow-xl shadow-black/20"
            role="listbox"
          >
            <div className="border-b border-slate-600 px-2 py-1.5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search..."
                className="w-full bg-transparent text-sm text-white placeholder:text-slate-400 focus:outline-none"
                autoFocus
              />
            </div>
            <ul className="max-h-56 overflow-auto py-1">
              {filtered.length === 0 ? (
                <li className="px-3 py-2 text-sm text-slate-500">
                  {allowCustom && search.trim() ? (
                    <button
                      type="button"
                      className="w-full text-left hover:bg-slate-700/50 rounded px-2 py-1.5"
                      onClick={() => {
                        onChange(search.trim());
                        setOpen(false);
                        setSearch("");
                      }}
                    >
                      Use &quot;{search.trim()}&quot;
                    </button>
                  ) : (
                    "No matches"
                  )}
                </li>
              ) : (
                filtered.map((opt, i) => (
                  <li key={opt.value}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={opt.value === value}
                      className={cn(
                        "flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition-colors",
                        opt.value === value
                          ? "bg-indigo-500/20 text-indigo-200"
                          : "text-slate-200 hover:bg-slate-700/50",
                        i === highlightIndex && "bg-slate-700/50"
                      )}
                      onClick={() => handleSelect(opt)}
                    >
                      {opt.value === value ? (
                        <Check className="h-4 w-4 shrink-0 text-indigo-400" />
                      ) : (
                        <span className="w-4" />
                      )}
                      {opt.label}
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
