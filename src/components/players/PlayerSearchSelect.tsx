"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2 } from "lucide-react";

type SearchResult = {
  id: string;
  name: string;
  positionGroup: string;
  currentTeam: { name: string } | null;
};

export function PlayerSearchSelect({
  onSelect,
  placeholder = "Buscar jugador...",
  className = "",
}: {
  onSelect: (playerId: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    if (query.length < 2) {
      setTimeout(() => {
        setResults([]);
        setIsOpen(false);
      }, 0);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/players/search?q=${encodeURIComponent(query)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.players || []);
          setIsOpen(true);
        }
      } catch (error) {
        console.error("Search error:", error);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          {isLoading ? (
            <Loader2 size={16} className="animate-spin text-muted" />
          ) : (
            <Search size={16} className="text-muted" />
          )}
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (results.length > 0) setIsOpen(true);
          }}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-surface py-2.5 pl-10 pr-4 text-sm text-text outline-none focus:border-accent focus:ring-2 focus:ring-accent/15"
        />
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute z-50 mt-1 w-full overflow-hidden rounded-lg border border-border bg-card shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
          <ul className="max-h-60 overflow-y-auto py-1 custom-scrollbar">
            {results.map((player) => (
              <li key={player.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelect(player.id);
                    setQuery("");
                    setIsOpen(false);
                  }}
                  className="flex w-full items-center justify-between px-4 py-2.5 text-left hover:bg-surface transition-colors"
                >
                  <div>
                    <div className="font-semibold text-sm text-text">{player.name}</div>
                    <div className="text-xs text-muted">
                      {player.currentTeam?.name || "Sin equipo"}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase text-muted tracking-wider px-2 py-0.5 rounded bg-surface border border-border">
                    {player.positionGroup}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
