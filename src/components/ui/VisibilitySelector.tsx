"use client";

import { Eye, EyeOff } from "lucide-react";

interface VisibilitySelectorProps {
  isPublic: boolean;
  onChange: (val: boolean) => void;
}

export function VisibilitySelector({ isPublic, onChange }: VisibilitySelectorProps) {
  return (
    <div className="grid gap-1">
      <label className="text-xs font-semibold text-muted">
        Visibilidad del registro
      </label>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            isPublic
              ? "border-accent bg-accent/15 text-text"
              : "border-border text-muted hover:border-border-2 hover:text-text"
          }`}
        >
          <Eye size={14} />
          Público (Club)
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={`flex flex-1 items-center justify-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
            !isPublic
              ? "border-accent bg-accent/15 text-text"
              : "border-border text-muted hover:border-border-2 hover:text-text"
          }`}
        >
          <EyeOff size={14} />
          Privado (Solo yo)
        </button>
      </div>
      <input type="hidden" name="is_public" value={isPublic ? "true" : "false"} />
    </div>
  );
}
