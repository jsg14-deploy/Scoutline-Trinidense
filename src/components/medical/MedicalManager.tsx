"use client";

import { useState, useTransition } from "react";
import { HeartPulse, Activity, Plus } from "lucide-react";
import { createInjury, createSkinfoldMeasurement } from "@/app/actions/medical";
import { VisibilitySelector } from "@/components/ui/VisibilitySelector";
import type { InjurySeverity } from "@/generated/prisma/enums";

interface MedicalManagerProps {
  players: { id: string; name: string }[];
}

export function MedicalManager({ players }: MedicalManagerProps) {
  const [activeTab, setActiveTab] = useState<"injury" | "skinfold">("injury");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedPlayerId, setSelectedPlayerId] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Form states for Injury
  const [diagnosis, setDiagnosis] = useState("");
  const [bodyPart, setBodyPart] = useState("");
  const [severity, setSeverity] = useState<InjurySeverity>("mild");
  const [occurredAt, setOccurredAt] = useState("");
  const [expectedReturnAt, setExpectedReturnAt] = useState("");
  const [injuryNotes, setInjuryNotes] = useState("");

  // Form states for Skinfolds
  const [measuredAt, setMeasuredAt] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [tricepsMm, setTricepsMm] = useState("");
  const [subscapularMm, setSubscapularMm] = useState("");
  const [suprailiacMm, setSuprailiacMm] = useState("");
  const [abdominalMm, setAbdominalMm] = useState("");
  const [thighMm, setThighMm] = useState("");
  const [calfMm, setCalfMm] = useState("");
  const [skinfoldNotes, setSkinfoldNotes] = useState("");

  function resetForm() {
    setSelectedPlayerId("");
    setIsPublic(true);
    setError(null);
    
    // reset injury
    setDiagnosis("");
    setBodyPart("");
    setSeverity("mild");
    setOccurredAt("");
    setExpectedReturnAt("");
    setInjuryNotes("");

    // reset skinfolds
    setMeasuredAt("");
    setWeightKg("");
    setHeightCm("");
    setTricepsMm("");
    setSubscapularMm("");
    setSuprailiacMm("");
    setAbdominalMm("");
    setThighMm("");
    setCalfMm("");
    setSkinfoldNotes("");
  }

  async function handleInjurySubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId || !diagnosis || !bodyPart || !occurredAt) {
      setError("Faltan datos obligatorios.");
      return;
    }
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await createInjury({
          playerId: selectedPlayerId,
          diagnosis,
          bodyPart,
          severity,
          occurredAt,
          expectedReturnAt: expectedReturnAt || undefined,
          notes: injuryNotes || undefined,
          isPublic,
        });
        setSuccess("Lesión registrada con éxito.");
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar el registro.");
      }
    });
  }

  async function handleSkinfoldSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedPlayerId || !measuredAt) {
      setError("El jugador y la fecha de medición son obligatorios.");
      return;
    }
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        await createSkinfoldMeasurement({
          playerId: selectedPlayerId,
          measuredAt,
          weightKg: weightKg ? parseFloat(weightKg) : undefined,
          heightCm: heightCm ? parseFloat(heightCm) : undefined,
          tricepsMm: tricepsMm ? parseFloat(tricepsMm) : undefined,
          subscapularMm: subscapularMm ? parseFloat(subscapularMm) : undefined,
          suprailiacMm: suprailiacMm ? parseFloat(suprailiacMm) : undefined,
          abdominalMm: abdominalMm ? parseFloat(abdominalMm) : undefined,
          thighMm: thighMm ? parseFloat(thighMm) : undefined,
          calfMm: calfMm ? parseFloat(calfMm) : undefined,
          notes: skinfoldNotes || undefined,
          isPublic,
        });
        setSuccess("Medición de pliegues registrada con éxito.");
        resetForm();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al guardar el registro.");
      }
    });
  }

  return (
    <div className="grid gap-4 rounded-2xl border border-border bg-card p-5">
      {/* Tabs */}
      <div className="flex border-b border-border pb-3 gap-4">
        <button
          onClick={() => {
            setActiveTab("injury");
            setError(null);
            setSuccess(null);
          }}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "injury"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <HeartPulse size={16} />
          Registrar Lesión
        </button>
        <button
          onClick={() => {
            setActiveTab("skinfold");
            setError(null);
            setSuccess(null);
          }}
          className={`flex items-center gap-1.5 pb-2 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "skinfold"
              ? "border-accent text-accent"
              : "border-transparent text-muted hover:text-text"
          }`}
        >
          <Activity size={16} />
          Registrar Pliegues / Antropometría
        </button>
      </div>

      {activeTab === "injury" ? (
        <form onSubmit={handleInjurySubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1">
              <label htmlFor="player" className="text-xs font-semibold text-muted">
                Jugador *
              </label>
              <select
                id="player"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              >
                <option value="">Seleccioná un jugador</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label htmlFor="diagnosis" className="text-xs font-semibold text-muted">
                Diagnóstico / Lesión *
              </label>
              <input
                id="diagnosis"
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                required
                placeholder="Ej: Desgarro en isquiotibial"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="bodyPart" className="text-xs font-semibold text-muted">
                Zona del cuerpo *
              </label>
              <input
                id="bodyPart"
                value={bodyPart}
                onChange={(e) => setBodyPart(e.target.value)}
                required
                placeholder="Ej: Muslo derecho"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="severity" className="text-xs font-semibold text-muted">
                Severidad
              </label>
              <select
                id="severity"
                value={severity}
                onChange={(e) => setSeverity(e.target.value as InjurySeverity)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              >
                <option value="mild">Leve (mild)</option>
                <option value="moderate">Moderada (moderate)</option>
                <option value="severe">Grave (severe)</option>
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="grid gap-1">
              <label htmlFor="occurredAt" className="text-xs font-semibold text-muted">
                Fecha de lesión *
              </label>
              <input
                id="occurredAt"
                type="date"
                value={occurredAt}
                onChange={(e) => setOccurredAt(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="expectedReturnAt" className="text-xs font-semibold text-muted">
                Fecha estimada de alta
              </label>
              <input
                id="expectedReturnAt"
                type="date"
                value={expectedReturnAt}
                onChange={(e) => setExpectedReturnAt(e.target.value)}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="injuryNotes" className="text-xs font-semibold text-muted">
                Notas / Tratamiento
              </label>
              <input
                id="injuryNotes"
                value={injuryNotes}
                onChange={(e) => setInjuryNotes(e.target.value)}
                placeholder="Ej: Fisioterapia, hielo, reposo deportivo."
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="max-w-[300px]">
            <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}
          {success && <p className="text-sm text-positive">{success}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 justify-self-start rounded-lg bg-navy px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={14} />
            {isPending ? "Guardando..." : "Registrar Lesión"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSkinfoldSubmit} className="grid gap-4">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="grid gap-1">
              <label htmlFor="playerS" className="text-xs font-semibold text-muted">
                Jugador *
              </label>
              <select
                id="playerS"
                value={selectedPlayerId}
                onChange={(e) => setSelectedPlayerId(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              >
                <option value="">Seleccioná un jugador</option>
                {players.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-1">
              <label htmlFor="measuredAt" className="text-xs font-semibold text-muted">
                Fecha de medición *
              </label>
              <input
                id="measuredAt"
                type="date"
                value={measuredAt}
                onChange={(e) => setMeasuredAt(e.target.value)}
                required
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="weightKg" className="text-xs font-semibold text-muted">
                Peso (kg)
              </label>
              <input
                id="weightKg"
                type="number"
                step="0.1"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
                placeholder="Ej: 75.5"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>

            <div className="grid gap-1">
              <label htmlFor="heightCm" className="text-xs font-semibold text-muted">
                Altura (cm)
              </label>
              <input
                id="heightCm"
                type="number"
                step="1"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="Ej: 180"
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid gap-4 grid-cols-3 sm:grid-cols-6">
            <SkinfoldInput label="Tríceps (mm)" value={tricepsMm} onChange={setTricepsMm} />
            <SkinfoldInput label="Subescapular (mm)" value={subscapularMm} onChange={setSubscapularMm} />
            <SkinfoldInput label="Suprailíaco (mm)" value={suprailiacMm} onChange={setSuprailiacMm} />
            <SkinfoldInput label="Abdominal (mm)" value={abdominalMm} onChange={setAbdominalMm} />
            <SkinfoldInput label="Muslo (mm)" value={thighMm} onChange={setThighMm} />
            <SkinfoldInput label="Pantorrilla (mm)" value={calfMm} onChange={setCalfMm} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-1">
              <label htmlFor="skinfoldNotes" className="text-xs font-semibold text-muted">
                Notas / Observaciones
              </label>
              <input
                id="skinfoldNotes"
                value={skinfoldNotes}
                onChange={(e) => setSkinfoldNotes(e.target.value)}
                placeholder="Ej: Medición realizada post-entrenamiento de fuerza."
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-text focus:border-accent-2 focus:outline-none"
              />
            </div>
            <div className="max-w-[300px]">
              <VisibilitySelector isPublic={isPublic} onChange={setIsPublic} />
            </div>
          </div>

          {error && <p className="text-sm text-negative">{error}</p>}
          {success && <p className="text-sm text-positive">{success}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="flex items-center gap-1.5 justify-self-start rounded-lg bg-navy px-5 py-2 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            <Plus size={14} />
            {isPending ? "Guardando..." : "Registrar Pliegues"}
          </button>
        </form>
      )}
    </div>
  );
}

function SkinfoldInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="grid gap-1">
      <label className="text-[10px] font-semibold text-muted truncate">{label}</label>
      <input
        type="number"
        step="0.1"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="0.0"
        className="rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs text-text focus:border-accent-2 focus:outline-none"
      />
    </div>
  );
}
