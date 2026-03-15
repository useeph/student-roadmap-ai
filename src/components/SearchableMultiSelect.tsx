"use client";

import * as React from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Option {
  value: string;
  label: string;
  group?: string;
}

interface SearchableMultiSelectProps {
  value: string[];
  onChange: (value: string[]) => void;
  options: Option[];
  placeholder?: string;
  label?: string;
  helperText?: string;
  maxSelections?: number;
  allowCustom?: boolean;
  emptyMessage?: string;
  className?: string;
}

export function SearchableMultiSelect({
  value,
  onChange,
  options,
  placeholder = "Search or select...",
  label,
  helperText,
  maxSelections = 20,
  allowCustom = true,
  emptyMessage = "No matches found. Type to add custom.",
  className,
}: SearchableMultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [highlightedIndex, setHighlightedIndex] = React.useState(0);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const groups = React.useMemo(() => {
    const hasGroups = options.some((o) => o.group);
    if (!hasGroups) return [{ group: "", options }];
    const map = new Map<string, Option[]>();
    for (const o of options) {
      const g = o.group ?? "";
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(o);
    }
    return Array.from(map.entries()).map(([group, opts]) => ({ group, options: opts }));
  }, [options]);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return groups;
    }
    return groups
      .map((g) => ({
        ...g,
        options: g.options.filter((o) => o.label.toLowerCase().includes(q)),
      }))
      .filter((g) => g.options.length > 0);
  }, [groups, search]);

  const flatFilteredOptions = React.useMemo(
    () => filtered.flatMap((g) => g.options),
    [filtered]
  );

  const add = (opt: string) => {
    if (!value.includes(opt) && value.length < maxSelections) {
      onChange([...value, opt]);
    }
    setSearch("");
    setHighlightedIndex(0);
  };

  const remove = (opt: string) => {
    onChange(value.filter((v) => v !== opt));
  };

  const addCustom = () => {
    const trimmed = search.trim();
    if (trimmed && allowCustom && !value.includes(trimmed) && value.length < maxSelections) {
      onChange([...value, trimmed]);
    }
    setSearch("");
  };

  React.useEffect(() => {
    if (!open) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.min(i + 1, flatFilteredOptions.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setHighlightedIndex((i) => Math.max(i - 1, 0));
      } else if (e.key === "Enter") {
        e.preventDefault();
        const opt = flatFilteredOptions[highlightedIndex];
        if (opt) add(opt.value);
        else if (search.trim() && allowCustom) addCustom();
      }
    };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [open, flatFilteredOptions, highlightedIndex, search, allowCustom]);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        if (search.trim() && allowCustom) addCustom();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [search, allowCustom]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {label && (
        <label className="block text-sm font-medium text-slate-200 mb-1.5">{label}</label>
      )}
      {helperText && <p className="text-xs text-slate-500 mb-1.5">{helperText}</p>}
      <div
        className={cn(
          "min-h-10 w-full rounded-lg border bg-slate-800/80 transition-colors",
          "focus-within:ring-2 focus-within:ring-indigo-500/50 focus-within:border-indigo-500/50",
          open ? "border-indigo-500/50 ring-2 ring-indigo-500/20" : "border-slate-600 hover:border-slate-500"
        )}
      >
        <div className="flex flex-wrap gap-2 p-2">
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-md bg-indigo-500/20 text-indigo-200 px-2.5 py-1 text-sm border border-indigo-500/30"
            >
              {v}
              <button
                type="button"
                onClick={() => remove(v)}
                className="rounded p-0.5 hover:bg-indigo-500/30 transition-colors"
                aria-label={`Remove ${v}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
          {value.length < maxSelections && (
            <div className="flex-1 min-w-[140px] flex items-center">
              <input
                ref={inputRef}
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setOpen(true);
                  setHighlightedIndex(0);
                }}
                onFocus={() => setOpen(true)}
                placeholder={value.length === 0 ? placeholder : ""}
                className="flex-1 min-w-0 bg-transparent text-white placeholder:text-slate-400 text-sm focus:outline-none py-1 px-1"
              />
              <button
                type="button"
                onClick={() => setOpen(!open)}
                className="p-1.5 rounded hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                aria-label="Toggle dropdown"
              >
                <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
              </button>
            </div>
          )}
        </div>
        {open && (
          <div className="border-t border-slate-700 max-h-56 overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="py-4 px-3 text-sm text-slate-500 text-center">
                {emptyMessage}
                {allowCustom && search.trim() && (
                  <button
                    type="button"
                    onClick={addCustom}
                    className="mt-2 block w-full text-indigo-400 hover:text-indigo-300 font-medium"
                  >
                    Add &quot;{search.trim()}&quot;
                  </button>
                )}
              </div>
            ) : (
              <div className="py-1">
                {filtered.map(({ group, options: opts }) => (
                  <div key={group || "ungrouped"}>
                    {group && (
                      <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider sticky top-0 bg-slate-800/95">
                        {group}
                      </div>
                    )}
                    {opts.map((opt, idx) => {
                      const flatIdx = flatFilteredOptions.findIndex((o) => o.value === opt.value);
                      const isSelected = value.includes(opt.value);
                      const isHighlighted = flatIdx === highlightedIndex;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => add(opt.value)}
                          className={cn(
                            "w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between",
                            isHighlighted && "bg-indigo-500/20 text-white",
                            !isHighlighted && "text-slate-300 hover:bg-slate-700/50",
                            isSelected && "text-indigo-300"
                          )}
                        >
                          {opt.label}
                          {isSelected && <span className="text-indigo-400 text-xs">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                ))}
                {allowCustom && search.trim() && !options.some((o) => o.label === search.trim()) && (
                  <button
                    type="button"
                    onClick={addCustom}
                    className={cn(
                      "w-full text-left px-3 py-2 text-sm text-indigo-400 hover:bg-indigo-500/20 transition-colors flex items-center gap-2",
                      flatFilteredOptions.length === 0 && "border-t border-slate-700"
                    )}
                  >
                    <span className="text-slate-500">+</span> Add &quot;{search.trim()}&quot;
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
