"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect } from "react";
import {
  ArrowRight,
  TrendingUp,
  Sparkles,
  Play,
  Flame,
  Send,
  ChevronRight,
  Shield,
  Zap,
} from "lucide-react";
import { Logo } from "@/components/ui/Logo";

const TICKER_MATCHES = [
  { triStatus: "LIVE", triScore: "1 - 0", rival: "OLY", time: "87'" },
  { triStatus: "LIVE", triScore: "0 - 0", rival: "CER", time: "22'" },
  { triStatus: "FINAL", triScore: "2 - 1", rival: "SOL", time: "" },
  { triStatus: "LIVE", triScore: "1 - 0", rival: "OLY", time: "87'" },
  { triStatus: "LIVE", triScore: "3 - 2", rival: "LIB", time: "65'" },
];

export default function LandingPage() {
  // Estado para el contador del próximo partido
  const [countdown, setCountdown] = useState("01:14:22");

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => {
        const parts = prev.split(":").map(Number);
        let [h, m, s] = parts;
        
        s -= 1;
        if (s < 0) {
          s = 59;
          m -= 1;
          if (m < 0) {
            m = 59;
            h -= 1;
            if (h < 0) {
              h = 23;
            }
          }
        }
        
        return [h, m, s]
          .map((v) => String(v).padStart(2, "0"))
          .join(":");
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#090c1f] text-[#eef1fb] selection:bg-[#f2c230] selection:text-[#090c1f]">
      {/* 1. Live Match Ticker */}
      <div className="w-full bg-[#050714] border-b border-[#232a54] overflow-hidden py-2 px-4">
        <div className="mx-auto max-w-6xl flex items-center gap-6 overflow-x-auto scrollbar-none text-xs font-mono">
          {TICKER_MATCHES.map((match, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3.5 whitespace-nowrap shrink-0 border-r border-[#232a54]/50 pr-6 last:border-0"
            >
              <span
                className={`rounded-full px-2 py-0.5 text-[9px] font-bold ${
                  match.triStatus === "LIVE"
                    ? "bg-[#f87171]/20 text-[#f87171] animate-pulse border border-[#f87171]/30"
                    : "bg-[#8f9bc7]/20 text-[#8f9bc7] border border-[#8f9bc7]/30"
                }`}
              >
                {match.triStatus === "LIVE" ? "• LIVE" : match.triStatus}
              </span>
              <span className="font-bold tracking-wider text-[#eef1fb]">
                TRI <span className="text-[#f2c230]">{match.triScore}</span> {match.rival}
              </span>
              {match.time && (
                <span className="text-[10px] text-[#8f9bc7] font-semibold">
                  {match.time}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 2. Header / Navigation */}
      <header className="sticky top-0 z-40 border-b border-[#232a54] bg-[#090c1f]/80 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="flex items-center gap-3.5 group">
            <Logo size={36} className="rounded-xl border border-[#f2c230]/20 bg-[#0f1330] p-0.5 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-display text-lg font-black tracking-wider text-[#f2c230] leading-none uppercase">
                Trinidense
              </span>
              <span className="text-[9px] font-bold text-[#8f9bc7] uppercase tracking-widest mt-0.5 leading-none">
                Club Oficial
              </span>
            </div>
          </Link>

          <nav className="hidden items-center gap-6.5 text-xs font-bold tracking-widest text-[#8f9bc7] md:flex uppercase">
            <a href="#partidos" className="transition-colors hover:text-[#f2c230]">
              Partidos
            </a>
            <a href="#liga" className="transition-colors hover:text-[#f2c230]">
              Liga
            </a>
            <a href="#plantel" className="transition-colors hover:text-[#f2c230]">
              Plantel
            </a>
            <a href="#noticias" className="transition-colors hover:text-[#f2c230]">
              Noticias
            </a>
            <a href="#en-vivo" className="transition-colors hover:text-[#f2c230] flex items-center gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-[#f87171] animate-ping" />
              En Vivo
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-xs font-bold uppercase tracking-wider text-[#eef1fb] hover:text-[#f2c230] transition-colors"
            >
              Ingresar
            </Link>
            <Link
              href="/register"
              className="rounded-xl bg-[#f2c230] px-5 py-2.5 text-xs font-black uppercase tracking-wider text-[#090c1f] shadow-[0_8px_24px_-8px_rgba(242,194,48,0.4)] transition-all hover:-translate-y-px hover:shadow-[0_12px_28px_-8px_rgba(242,194,48,0.5)]"
            >
              Socio Pro
            </Link>
          </div>
        </div>
      </header>

      {/* 3. Hero Section */}
      <section className="relative overflow-hidden border-b border-[#232a54] bg-[#090c1f] py-16 lg:py-24">
        {/* Background Image with Mask */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/trinidense_hero_bg.png"
            alt="Estadio Martín Torres"
            fill
            priority
            className="object-cover object-center opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090c1f] via-[#090c1f]/85 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#090c1f] via-transparent to-[#090c1f]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(9,12,31,0)_20%,#090c1f_100%)]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="max-w-2xl">
            {/* Stadium Badge */}
            <span className="inline-flex items-center gap-2 rounded-xl border border-[#232a54] bg-[#0f1330]/90 px-4 py-2 text-xs font-bold text-[#f2c230] shadow-md backdrop-blur-md">
              <Shield size={14} className="text-[#f2c230]" />
              ESTADIO MARTÍN TORRES
            </span>

            {/* Main Headlines */}
            <h1 className="mt-8 font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl italic">
              <span className="text-[#f2c230] block not-italic">EL TRIQUI:</span>
              ESPÍRITU INDOMABLE
            </h1>
            
            <p className="mt-6 text-base leading-relaxed text-[#8f9bc7] max-w-lg">
              Análisis de rendimiento, big data aplicada al fútbol paraguayo y métricas exclusivas del orgullo de Santísima Trinidad.
            </p>

            {/* Countdown / Stats Row */}
            <div className="mt-10 flex flex-wrap items-center gap-6">
              <div className="flex flex-col">
                <span className="font-mono text-3xl font-black tracking-wider text-[#f2c230] tabular-nums">
                  {countdown}
                </span>
                <span className="text-[10px] font-bold text-[#8f9bc7] uppercase tracking-wider mt-1">
                  Para el próximo match
                </span>
              </div>

              <Link
                href="/login"
                className="group flex items-center gap-2.5 rounded-xl bg-[#f2c230] px-6 py-3.5 text-xs font-black uppercase tracking-wider text-[#090c1f] shadow-[0_8px_24px_-8px_rgba(242,194,48,0.45)] transition-all hover:-translate-y-0.5 hover:shadow-[0_12px_28px_-8px_rgba(242,194,48,0.55)]"
              >
                Ver Scouting
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Widgets Panel (Overlapping section) */}
      <section className="relative z-20 mx-auto -mt-10 w-full max-w-6xl px-4 sm:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          
          {/* Card 1: Win Probability */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#232a54] bg-[#0f1330]/95 p-6 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between border-b border-[#232a54]/50 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8f9bc7]">
                  Probabilidad de Victoria
                </span>
                <TrendingUp size={14} className="text-[#f2c230]" />
              </div>

              {/* Bar charts for probability */}
              <div className="mt-6 grid grid-cols-3 items-end gap-3.5 h-24">
                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#f2c230]/20 border border-[#f2c230]/30 rounded-lg flex items-end justify-center transition-all duration-500 h-[66%]" style={{ height: '66%' }}>
                    <div className="w-full bg-gradient-to-t from-[#f2c230] to-[#f7d35c] rounded-b-lg rounded-t-sm h-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#f2c230]">66%</span>
                  <span className="text-[9px] text-[#8f9bc7] uppercase">Triqui</span>
                </div>

                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#232a54]/30 border border-[#232a54]/40 rounded-lg flex items-end justify-center h-[20%]" style={{ height: '20%' }}>
                    <div className="w-full bg-[#232a54] rounded-lg h-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8f9bc7]">20%</span>
                  <span className="text-[9px] text-[#8f9bc7] uppercase">Empate</span>
                </div>

                <div className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="w-full bg-[#232a54]/30 border border-[#232a54]/40 rounded-lg flex items-end justify-center h-[15%]" style={{ height: '15%' }}>
                    <div className="w-full bg-[#232a54] rounded-lg h-full" />
                  </div>
                  <span className="text-[10px] font-bold text-[#8f9bc7]">15%</span>
                  <span className="text-[9px] text-[#8f9bc7] uppercase">Rival</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Featured Player (Fernando Romero) */}
          <div className="relative overflow-hidden rounded-2xl border border-[#f2c230]/40 bg-[#0f1330]/95 p-6 shadow-xl backdrop-blur-md ring-1 ring-[#f2c230]/25">
            <div className="absolute top-0 right-0 p-3">
              <span className="rounded-full bg-[#f2c230]/10 border border-[#f2c230]/20 px-2 py-0.5 text-[8px] font-black uppercase tracking-wider text-[#f2c230]">
                Estadísticas
              </span>
            </div>

            <div className="flex items-start gap-4">
              {/* Player Avatar */}
              <div className="relative h-14 w-14 shrink-0 rounded-2xl border border-[#232a54] overflow-hidden bg-black shadow-inner">
                <Image
                  src="/fernando_romero.png"
                  alt="Fernando Romero"
                  fill
                  className="object-cover"
                />
              </div>

              <div>
                <span className="text-[9px] font-bold uppercase tracking-widest text-[#f2c230]">
                  Jugador Destacado
                </span>
                <h3 className="font-display text-base font-black tracking-tight text-white uppercase italic">
                  Fernando Romero
                </h3>
              </div>
            </div>

            {/* Radar layout simulator & stats */}
            <div className="mt-5 grid grid-cols-[1fr_auto] items-center gap-4">
              {/* Custom SVG Radar chart simulation */}
              <div className="relative flex justify-center">
                <svg className="w-24 h-24 transform -rotate-90 text-[#f2c230]" viewBox="0 0 100 100">
                  {/* Outer Hexagon */}
                  <polygon points="50,10 85,30 85,70 50,90 15,70 15,30" fill="none" stroke="#232a54" strokeWidth="1" />
                  {/* Inner Hexagon */}
                  <polygon points="50,30 67,40 67,60 50,70 33,60 33,40" fill="none" stroke="#232a54" strokeWidth="1" />
                  {/* Web spokes */}
                  <line x1="50" y1="50" x2="50" y2="10" stroke="#232a54" strokeWidth="1" />
                  <line x1="50" y1="50" x2="85" y2="30" stroke="#232a54" strokeWidth="1" />
                  <line x1="50" y1="50" x2="85" y2="70" stroke="#232a54" strokeWidth="1" />
                  <line x1="50" y1="50" x2="50" y2="90" stroke="#232a54" strokeWidth="1" />
                  <line x1="50" y1="50" x2="15" y2="70" stroke="#232a54" strokeWidth="1" />
                  <line x1="50" y1="50" x2="15" y2="30" stroke="#232a54" strokeWidth="1" />
                  {/* Player Value Polygon */}
                  <polygon points="50,22 80,35 78,65 50,82 22,66 25,36" fill="rgba(242, 194, 48, 0.15)" stroke="#f2c230" strokeWidth="2" />
                  {/* Label helpers */}
                  <text x="50" y="8" textAnchor="middle" fill="#8f9bc7" fontSize="8" transform="rotate(90 50 8)">VEL</text>
                  <text x="89" y="32" textAnchor="middle" fill="#8f9bc7" fontSize="8" transform="rotate(90 89 32)">REG</text>
                  <text x="89" y="72" textAnchor="middle" fill="#8f9bc7" fontSize="8" transform="rotate(90 89 72)">FIS</text>
                  <text x="50" y="96" textAnchor="middle" fill="#8f9bc7" fontSize="8" transform="rotate(90 50 96)">DEF</text>
                </svg>
              </div>

              {/* Box stats */}
              <div className="grid gap-2 text-right">
                <div className="rounded-xl border border-[#232a54] bg-[#090c1f] p-2 min-w-[70px]">
                  <span className="block text-[8px] text-[#8f9bc7] uppercase font-bold">Goles</span>
                  <span className="font-mono text-base font-black text-[#f2c230]">8</span>
                </div>
                <div className="rounded-xl border border-[#232a54] bg-[#090c1f] p-2 min-w-[70px]">
                  <span className="block text-[8px] text-[#8f9bc7] uppercase font-bold">Asist.</span>
                  <span className="font-mono text-base font-black text-white">4</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: Club Trends */}
          <div className="flex flex-col justify-between rounded-2xl border border-[#232a54] bg-[#0f1330]/95 p-6 shadow-xl backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between border-b border-[#232a54]/50 pb-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#8f9bc7]">
                  Tendencias del Club
                </span>
                <TrendingUp size={14} className="text-[#f2c230]" />
              </div>

              <div className="mt-5 grid gap-3">
                <div className="flex items-center justify-between py-1.5 border-b border-[#232a54]/30 text-xs">
                  <span className="text-[#8f9bc7] font-medium">Posesión Media</span>
                  <span className="font-mono font-bold text-[#f2c230]">54%</span>
                </div>
                <div className="flex items-center justify-between py-1.5 border-b border-[#232a54]/30 text-xs">
                  <span className="text-[#8f9bc7] font-medium">Recuperaciones</span>
                  <span className="font-mono font-bold text-white">12.4</span>
                </div>
                <div className="flex items-center justify-between py-1.5 text-xs">
                  <span className="text-[#8f9bc7] font-medium">Pases Clave</span>
                  <span className="font-mono font-bold text-white">8.2</span>
                </div>
              </div>
            </div>

            <div className="mt-4 border-t border-[#232a54]/50 pt-3">
              <Link
                href="/login"
                className="text-[10px] font-bold uppercase tracking-wider text-[#f2c230] hover:text-[#f7d35c] transition-colors flex items-center justify-end gap-1"
              >
                Ver informe técnico completo
                <ChevronRight size={10} />
              </Link>
            </div>
          </div>

        </div>
      </section>

      {/* 5. News Section */}
      <section id="noticias" className="mx-auto w-full max-w-6xl px-4 py-24 sm:px-6">
        <div className="flex items-end justify-between mb-8 border-b border-[#232a54] pb-4">
          <h2 className="font-display text-2xl font-black italic tracking-wide text-[#f2c230] uppercase">
            Noticias de la Academia
          </h2>
          <Link
            href="/login"
            className="text-xs font-bold uppercase tracking-widest text-[#8f9bc7] hover:text-white transition-colors flex items-center gap-1"
          >
            Explorar
            <ChevronRight size={12} />
          </Link>
        </div>

        {/* News Grid */}
        <div className="grid gap-5 md:grid-cols-3">
          {/* Card Left: Large */}
          <div className="relative group overflow-hidden rounded-2xl border border-[#232a54] bg-[#0f1330] md:col-span-2 md:row-span-2 h-[340px] md:h-full">
            <Image
              src="/coach_strategy.png"
              alt="Estrategia táctica"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <span className="self-start rounded-md bg-[#f2c230] px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#090c1f] mb-3">
                Exclusivo
              </span>
              <h3 className="font-display text-xl md:text-2xl font-black text-white italic uppercase tracking-tight max-w-xl leading-tight">
                Estrategia táctica: así se prepara el triqui para el clásico
              </h3>
            </div>
          </div>

          {/* Card Top Right */}
          <div className="relative group overflow-hidden rounded-2xl border border-[#232a54] bg-[#0f1330] h-[180px]">
            <Image
              src="/match_ball.png"
              alt="Balón oficial"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="font-display text-sm font-black text-white italic uppercase tracking-tight">
                Balón oficial: edición centenario
              </h3>
            </div>
          </div>

          {/* Card Bottom Right */}
          <div className="relative group overflow-hidden rounded-2xl border border-[#232a54] bg-[#0f1330] h-[180px]">
            <Image
              src="/sports_lab.png"
              alt="Laboratorio de ciencia deportiva"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            <div className="absolute inset-0 p-5 flex flex-col justify-end">
              <h3 className="font-display text-sm font-black text-white italic uppercase tracking-tight">
                Laboratorio: ciencia deportiva en el martín torres
              </h3>
            </div>
          </div>

          {/* Bottom center stretched or right side full row */}
          <div className="relative group overflow-hidden rounded-2xl border border-[#232a54] bg-[#0f1330] md:col-span-3 h-[180px]">
            <Image
              src="/stadium_fans.png"
              alt="Hinchada de Trinidense"
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/35 to-transparent" />
            <div className="absolute inset-0 p-6 flex flex-col justify-end">
              <h3 className="font-display text-base md:text-lg font-black text-white italic uppercase tracking-tight max-w-xl">
                La hinchada de oro: color en las gradas
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Standings Section */}
      <section id="liga" className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 border-t border-[#232a54]/50">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.5fr] items-center">
          <div>
            <h2 className="font-display text-3xl font-black italic tracking-tight text-white uppercase">
              <span className="text-[#f2c230] block not-italic text-sm tracking-wider font-semibold mb-2">Clasificación</span>
              TABLA DE POSICIONES LIGA PARAGUAYA
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#8f9bc7]">
              El Triqui escala posiciones en la tabla del Apertura 2026 tras una racha invicta de 5 partidos. El objetivo internacional está cerca.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-flex items-center gap-2 rounded-xl border border-[#232a54] bg-[#0f1330] px-5 py-3 text-xs font-bold uppercase tracking-wider text-white hover:border-[#f2c230]/40 transition-colors"
            >
              Ver clasificación
            </Link>
          </div>

          {/* Standings Table card */}
          <div className="overflow-hidden rounded-2xl border border-[#232a54] bg-[#0f1330]/80 shadow-lg font-mono text-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-[#232a54] text-[#8f9bc7] uppercase tracking-wider text-[10px] text-left">
                    <th className="p-4">Pos</th>
                    <th className="p-4">Club</th>
                    <th className="p-4 text-center">PJ</th>
                    <th className="p-4 text-center">DG</th>
                    <th className="p-4 text-center">Pts</th>
                    <th className="p-4 text-center">Racha</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Row 4: Trinidense */}
                  <tr className="border-b border-[#232a54]/40 bg-[#f2c230]/5 text-white">
                    <td className="p-4 font-black text-[#f2c230]">04</td>
                    <td className="p-4 flex items-center gap-3.5 font-sans font-bold">
                      <Logo size={20} className="rounded" />
                      <span>Sportivo Trinidense</span>
                    </td>
                    <td className="p-4 text-center tabular-nums">14</td>
                    <td className="p-4 text-center font-bold text-[#34d399] tabular-nums">+6</td>
                    <td className="p-4 text-center font-black text-[#f2c230] tabular-nums">21</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#f2c230]" />
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                      </div>
                    </td>
                  </tr>
                  {/* Row 5: Olimpia */}
                  <tr className="text-white/85 hover:bg-[#0f1330] transition-colors">
                    <td className="p-4 font-bold text-[#8f9bc7]">05</td>
                    <td className="p-4 flex items-center gap-3.5 font-sans">
                      <div className="h-5 w-5 rounded-full bg-[#232a54] flex items-center justify-center border border-[#8f9bc7]/10" />
                      <span>Olimpia</span>
                    </td>
                    <td className="p-4 text-center tabular-nums">14</td>
                    <td className="p-4 text-center font-bold text-[#34d399] tabular-nums">+4</td>
                    <td className="p-4 text-center font-bold tabular-nums">21</td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-1">
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#f2c230]" />
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#34d399]" />
                        <span className="h-2 w-2 rounded-full bg-[#f2c230]" />
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Footer */}
      <footer className="border-t border-[#232a54] bg-[#050714] py-16 text-xs text-[#8f9bc7]">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6">
          <div className="grid gap-10 md:grid-cols-4">
            {/* Branding Column */}
            <div>
              <div className="flex items-center gap-3">
                <Logo size={28} className="rounded-lg bg-[#0f1330] p-0.5 border border-[#f2c230]/20" />
                <span className="font-display text-sm font-black tracking-wider text-[#f2c230] uppercase italic">
                  El Triqui
                </span>
              </div>
              <p className="mt-4 leading-relaxed text-[#8f9bc7]/80">
                La plataforma oficial de análisis para la comunidad de Sportivo Trinidense.
              </p>
            </div>

            {/* Club Links */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white uppercase tracking-wider">Club</span>
              <a href="#socio" className="hover:text-[#f2c230] transition-colors">Socio Digital</a>
              <a href="#tienda" className="hover:text-[#f2c230] transition-colors">Tienda Oficial</a>
              <a href="#prensa" className="hover:text-[#f2c230] transition-colors">Prensa</a>
            </div>

            {/* Support Links */}
            <div className="flex flex-col gap-3">
              <span className="font-bold text-white uppercase tracking-wider">Soporte</span>
              <a href="#privacidad" className="hover:text-[#f2c230] transition-colors">Privacidad</a>
              <a href="#terminos" className="hover:text-[#f2c230] transition-colors">Términos</a>
              <a href="#contacto" className="hover:text-[#f2c230] transition-colors">Contacto</a>
            </div>

            {/* Newsletter Column */}
            <div className="flex flex-col gap-3.5">
              <span className="font-bold text-white uppercase tracking-wider">Newsletter</span>
              <p className="leading-relaxed">
                Informes tácticos de Triqui en tu correo.
              </p>
              <form onSubmit={(e) => e.preventDefault()} className="flex items-center gap-2">
                <input
                  type="email"
                  required
                  placeholder="tu@email.com…"
                  className="flex-1 rounded-xl border border-[#232a54] bg-[#090c1f] px-3.5 py-2.5 text-xs text-[#eef1fb] focus-visible:ring-2 focus-visible:ring-accent-2 focus:border-accent-2 outline-none transition-colors"
                />
                <button
                  type="submit"
                  aria-label="Suscribirse a la newsletter"
                  className="rounded-xl bg-[#f2c230] p-2.5 text-[#090c1f] hover:opacity-90 transition-opacity focus-visible:ring-2 focus-visible:ring-accent-2 outline-none"
                >
                  <Send size={14} />
                </button>
              </form>
            </div>
          </div>

          <div className="mt-12 border-t border-[#232a54]/50 pt-8 text-center text-[10px] tracking-wide text-[#8f9bc7]/65">
            © {new Date().getFullYear()} SPORTIVO TRINIDENSE ANALYTICA. ORGULLO DE SANTÍSIMA TRINIDAD.
          </div>
        </div>
      </footer>
    </div>
  );
}
