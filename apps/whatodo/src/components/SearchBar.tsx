"use client";

import { Search, X, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onFilterToggle?: () => void;
  showFilters?: boolean;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = "장소, 음식, 태그 검색...",
  onFilterToggle,
  showFilters,
  className,
}: SearchBarProps) {
  return (
    <div className={cn("flex gap-3", className)}>
      <div className="flex-1 flex items-center gap-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-4 py-3">
        <Search size={18} className="text-white/60 shrink-0" />
        <input
          type="text"
          placeholder={placeholder}
          className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-label="검색"
        />
        {value && (
          <button onClick={() => onChange("")} aria-label="검색어 지우기">
            <X size={16} className="text-white/60 hover:text-white" />
          </button>
        )}
      </div>
      {onFilterToggle && (
        <button
          onClick={onFilterToggle}
          className={cn(
            "flex items-center gap-2 px-4 py-3 rounded-2xl text-sm font-semibold border transition-all",
            showFilters
              ? "bg-white text-slate-900 border-white"
              : "bg-white/10 text-white border-white/20 hover:bg-white/20"
          )}
          aria-label="필터"
        >
          <SlidersHorizontal size={16} />
          필터
        </button>
      )}
    </div>
  );
}
