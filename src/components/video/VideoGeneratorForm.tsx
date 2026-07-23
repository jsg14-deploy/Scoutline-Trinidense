"use client";

import { useState } from "react";
import { Plus, Trash2, Video, Smartphone, Sparkles } from "lucide-react";

type ClipItem = {
  sourceUrl: string;
  startSeconds: string;
  endSeconds: string;
  annotation: string;
};

type StatItem = {
  label: string;
  value: string;
  percent: number;
};

export function VideoGeneratorForm() {
  const [playerName, setPlayerName] = useState("");
  const [position, setPosition] = useState("");
  const [team, setTeam] = useState("Sportivo Trinidense");
  const [photoUrl, setPhotoUrl] = useState("/fernando_romero.png");
  
  const [stats, setStats] = useState<StatItem[]>([
    { label: "Goles", value: "8", percent: 80 },
    { label: "Asistencias", value: "4", percent: 60 },
    { label: "Posesión", value: "54%", percent: 54 },
  ]);

  const [strengths, setStrengths] = useState<string[]>([
    "Velocidad mental y desmarque",
    "Excelente pegada de media distancia",
  ]);
  const [newStrength, setNewStrength] = useState("");

  const [weaknesses, setWeaknesses] = useState<string[]>([
    "Juego aéreo defensivo",
    "Precisión en perfil no hábil",
  ]);
  const [newWeakness, setNewWeakness] = useState("");

  // Inicializar con un clip de prueba mp4 directo
  const [clips, setClips] = useState<ClipItem[]>([
    {
      sourceUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
      startSeconds: "2",
      endSeconds: "8",
      annotation: "Buena lectura de juego y desmarque al espacio vacío.",
    },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ horizontalUrl: string; verticalUrl: string } | null>(null);

  // Handlers para Stats
  function handleAddStat() {
    setStats([...stats, { label: "", value: "", percent: 50 }]);
  }
  function handleRemoveStat(idx: number) {
    setStats(stats.filter((_, i) => i !== idx));
  }
  function handleStatChange(idx: number, field: keyof StatItem, val: string | number) {
    const next = [...stats];
    next[idx] = { ...next[idx], [field]: val };
    setStats(next);
  }

  // Handlers para Fortalezas y Debilidades
  function handleAddStrength() {
    if (newStrength.trim()) {
      setStrengths([...strengths, newStrength.trim()]);
      setNewStrength("");
    }
  }
  function handleRemoveStrength(idx: number) {
    setStrengths(strengths.filter((_, i) => i !== idx));
  }
  function handleAddWeakness() {
    if (newWeakness.trim()) {
      setWeaknesses([...weaknesses, newWeakness.trim()]);
      setNewWeakness("");
    }
  }
  function handleRemoveWeakness(idx: number) {
    setWeaknesses(weaknesses.filter((_, i) => i !== idx));
  }

  // Handlers para Clips
  function handleAddClip() {
    setClips([...clips, { sourceUrl: "", startSeconds: "0", endSeconds: "5", annotation: "" }]);
  }
  function handleRemoveClip(idx: number) {
    setClips(clips.filter((_, i) => i !== idx));
  }
  function handleClipChange(idx: number, field: keyof ClipItem, val: string) {
    const next = [...clips];
    next[idx] = { ...next[idx], [field]: val };
    setClips(next);
  }

  // Enviar generación al servidor
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const res = await fetch("/api/video/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerName,
          position,
          team,
          photoUrl,
          statistics: stats.filter((s) => s.label && s.value),
          strengths: strengths.filter(Boolean),
          weaknesses: weaknesses.filter(Boolean),
          clips: clips.filter((c) => c.sourceUrl && c.endSeconds),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Fallo en la generación de video.");
      }

      setResult({
        horizontalUrl: data.horizontalUrl,
        verticalUrl: data.verticalUrl,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Error al solicitar la renderización del video.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="grid gap-6 rounded-2xl border border-[#232a54] bg-[#0f1330] p-6">
        <h2 className="font-display text-base font-bold text-white uppercase tracking-wider border-b border-[#232a54]/50 pb-3 flex items-center gap-2">
          <Sparkles size={16} className="text-[#f2c230]" />
          Creador de Informes de Video
        </h2>

        {/* 1. Datos principales */}
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="grid gap-1">
            <label htmlFor="gen-name" className="text-xs font-semibold text-muted">Nombre del Jugador</label>
            <input
              id="gen-name"
              required
              placeholder="Ej: Fernando Romero"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-sm text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] focus:border-[#f2c230] outline-none transition-colors"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="gen-pos" className="text-xs font-semibold text-muted">Posición</label>
            <input
              id="gen-pos"
              required
              placeholder="Ej: Centrodelantero"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-sm text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] focus:border-[#f2c230] outline-none transition-colors"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="gen-team" className="text-xs font-semibold text-muted">Equipo</label>
            <input
              id="gen-team"
              required
              value={team}
              onChange={(e) => setTeam(e.target.value)}
              className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-sm text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] focus:border-[#f2c230] outline-none transition-colors"
            />
          </div>
          <div className="grid gap-1">
            <label htmlFor="gen-photo" className="text-xs font-semibold text-muted">Fotografía (path o URL)</label>
            <input
              id="gen-photo"
              required
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-sm text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] focus:border-[#f2c230] outline-none transition-colors"
            />
          </div>
        </div>

        {/* 2. Estadísticas */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Estadísticas Clave</span>
            <button
              type="button"
              onClick={handleAddStat}
              className="text-xs font-bold text-[#f2c230] hover:text-[#f7d35c] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none rounded px-1"
            >
              <Plus size={12} /> Agregar Métrica
            </button>
          </div>

          <div className="grid gap-3.5">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex flex-wrap items-center gap-3 bg-[#090c1f]/45 p-3 rounded-xl border border-[#232a54]/50">
                <input
                  aria-label="Nombre de métrica"
                  placeholder="Métrica (ej: Goles)"
                  required
                  value={stat.label}
                  onChange={(e) => handleStatChange(idx, "label", e.target.value)}
                  className="flex-1 min-w-[120px] rounded-lg border border-[#232a54] bg-[#090c1f] px-3 py-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
                />
                <input
                  aria-label="Valor de métrica"
                  placeholder="Valor (ej: 8)"
                  required
                  value={stat.value}
                  onChange={(e) => handleStatChange(idx, "value", e.target.value)}
                  className="w-20 rounded-lg border border-[#232a54] bg-[#090c1f] px-3 py-1.5 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none text-center"
                />
                <div className="flex items-center gap-2 min-w-[150px]">
                  <span className="text-[10px] text-muted w-10 text-right font-mono tabular-nums">{stat.percent}%</span>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    aria-label="Porcentaje de relleno de barra"
                    value={stat.percent}
                    onChange={(e) => handleStatChange(idx, "percent", Number(e.target.value))}
                    className="flex-1 h-1.5 bg-[#141a3d] rounded-lg appearance-none cursor-pointer accent-[#f2c230]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveStat(idx)}
                  className="text-muted hover:text-[#f87171] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none p-1 rounded transition-colors"
                  aria-label={`Eliminar estadística ${stat.label}`}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Fortalezas y Debilidades */}
        <div className="grid gap-5 md:grid-cols-2">
          {/* Fortalezas */}
          <div className="grid gap-2.5">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Fortalezas</span>
            <div className="flex gap-2">
              <input
                id="strength-input"
                placeholder="Ej: Buena visión de pase…"
                value={newStrength}
                onChange={(e) => setNewStrength(e.target.value)}
                className="flex-1 rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-xs text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddStrength}
                className="rounded-lg bg-[#232a54] px-3 py-2 text-xs font-bold text-white hover:bg-[#2c3d7e] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
              >
                Agregar
              </button>
            </div>
            <ul className="grid gap-1.5 mt-1">
              {strengths.map((str, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs bg-[#090c1f]/40 px-3 py-2 rounded-lg border border-[#232a54]/30">
                  <span className="text-white">• {str}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveStrength(idx)}
                    className="text-muted hover:text-[#f87171] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none rounded p-0.5"
                    aria-label={`Eliminar fortaleza ${str}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Debilidades */}
          <div className="grid gap-2.5">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Aspectos a Mejorar</span>
            <div className="flex gap-2">
              <input
                id="weakness-input"
                placeholder="Ej: Retorno defensivo lento…"
                value={newWeakness}
                onChange={(e) => setNewWeakness(e.target.value)}
                className="flex-1 rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-xs text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
              />
              <button
                type="button"
                onClick={handleAddWeakness}
                className="rounded-lg bg-[#232a54] px-3 py-2 text-xs font-bold text-white hover:bg-[#2c3d7e] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
              >
                Agregar
              </button>
            </div>
            <ul className="grid gap-1.5 mt-1">
              {weaknesses.map((weak, idx) => (
                <li key={idx} className="flex items-center justify-between text-xs bg-[#090c1f]/40 px-3 py-2 rounded-lg border border-[#232a54]/30">
                  <span className="text-white">• {weak}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveWeakness(idx)}
                    className="text-muted hover:text-[#f87171] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none rounded p-0.5"
                    aria-label={`Eliminar aspecto a mejorar ${weak}`}
                  >
                    <Trash2 size={12} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 4. Clips del Partido */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white uppercase tracking-wider">Clips de Partido (Vídeos directos MP4/WebM)</span>
            <button
              type="button"
              onClick={handleAddClip}
              className="text-xs font-bold text-[#f2c230] hover:text-[#f7d35c] flex items-center gap-1 focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none rounded px-1"
            >
              <Plus size={12} /> Agregar Clip
            </button>
          </div>

          <div className="grid gap-4">
            {clips.map((clip, idx) => (
              <div key={idx} className="grid gap-3 bg-[#090c1f]/50 p-4 rounded-xl border border-[#232a54] relative">
                <button
                  type="button"
                  onClick={() => handleRemoveClip(idx)}
                  className="absolute top-3 right-3 text-muted hover:text-[#f87171] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none p-1 rounded"
                  aria-label={`Eliminar clip ${idx + 1}`}
                >
                  <Trash2 size={14} />
                </button>

                <span className="text-[10px] font-bold text-[#f2c230] uppercase">Clip #{idx + 1}</span>

                <div className="grid gap-3 sm:grid-cols-[1fr_100px_100px]">
                  <div className="grid gap-1">
                    <label htmlFor={`clip-url-${idx}`} className="text-[10px] text-muted font-bold">Link del video MP4 directo</label>
                    <input
                      id={`clip-url-${idx}`}
                      type="url"
                      required
                      placeholder="https://ejemplo.com/partido.mp4"
                      value={clip.sourceUrl}
                      onChange={(e) => handleClipChange(idx, "sourceUrl", e.target.value)}
                      className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-xs text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={`clip-start-${idx}`} className="text-[10px] text-muted font-bold text-center">Inicio (segundos)</label>
                    <input
                      id={`clip-start-${idx}`}
                      type="number"
                      min="0"
                      required
                      placeholder="0"
                      value={clip.startSeconds}
                      onChange={(e) => handleClipChange(idx, "startSeconds", e.target.value)}
                      className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none text-center"
                    />
                  </div>
                  <div className="grid gap-1">
                    <label htmlFor={`clip-end-${idx}`} className="text-[10px] text-muted font-bold text-center">Fin (segundos)</label>
                    <input
                      id={`clip-end-${idx}`}
                      type="number"
                      min="1"
                      required
                      placeholder="5"
                      value={clip.endSeconds}
                      onChange={(e) => handleClipChange(idx, "endSeconds", e.target.value)}
                      className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none text-center"
                    />
                  </div>
                </div>

                <div className="grid gap-1">
                  <label htmlFor={`clip-note-${idx}`} className="text-[10px] text-muted font-bold">Subtítulo / Análisis táctico para este momento</label>
                  <input
                    id={`clip-note-${idx}`}
                    placeholder="Ej: Buena habilitación entre líneas para la carrera del extremo…"
                    value={clip.annotation}
                    onChange={(e) => handleClipChange(idx, "annotation", e.target.value)}
                    className="rounded-lg border border-[#232a54] bg-[#090c1f] px-3.5 py-2 text-xs text-white focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-colors"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Acciones de Envío */}
        <div className="border-t border-[#232a54]/50 pt-4 flex flex-col items-center gap-3">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2.5 rounded-xl bg-[#f2c230] px-7 py-4 text-xs font-black uppercase tracking-wider text-[#090c1f] shadow-[0_8px_24px_-8px_rgba(242,194,48,0.4)] hover:opacity-90 disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-[#f2c230] outline-none transition-all"
          >
            {loading ? "Generando videos…" : "Generar Informes de Video"}
          </button>

          {loading && (
            <p className="text-xs text-muted text-center animate-pulse" aria-live="polite">
              Esto recortará los clips con FFmpeg y renderizará las composiciones en 1080p.
              <span className="block mt-1 font-semibold text-[#f2c230]">Suele tardar entre 1 y 2 minutos…</span>
            </p>
          )}
        </div>
      </form>

      {/* Resultados */}
      {error && (
        <div className="rounded-2xl border border-dashed border-[#f87171]/40 bg-[#f87171]/5 p-4 text-xs text-[#f87171] leading-relaxed text-center" aria-live="polite">
          {error}
        </div>
      )}

      {result && (
        <div className="grid gap-4 rounded-2xl border border-[#f2c230]/40 bg-[#f2c230]/5 p-6" aria-live="polite">
          <div className="text-center">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-center gap-2">
              🎉 ¡Videos Generados con Éxito!
            </h3>
            <p className="text-xs text-muted mt-1">El motor de Remotion compiló los MP4 a 1080p.</p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 mt-2">
            <a
              href={result.horizontalUrl}
              download
              className="flex items-center justify-center gap-2.5 rounded-xl bg-[#232a54] hover:bg-[#2c3d7e] p-4 text-xs font-bold text-white border border-[#232a54] transition-all"
            >
              <Video size={16} className="text-[#f2c230]" />
              Descargar Video Horizontal (16:9)
            </a>
            <a
              href={result.verticalUrl}
              download
              className="flex items-center justify-center gap-2.5 rounded-xl bg-[#232a54] hover:bg-[#2c3d7e] p-4 text-xs font-bold text-white border border-[#232a54] transition-all"
            >
              <Smartphone size={16} className="text-[#f2c230]" />
              Descargar Reel Vertical (9:16)
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
