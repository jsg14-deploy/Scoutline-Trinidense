import { MOCK_PLAYER_CARDS } from "./mockPlayers";
import { PlayerCard } from "./PlayerCard";

// Carrusel vertical en loop continuo (CSS puro, sin JS de cliente). La lista
// se duplica para que la animación cierre sin salto; se pausa en hover y se
// desactiva con prefers-reduced-motion.
export function PlayerTicker() {
  const cards = [...MOCK_PLAYER_CARDS, ...MOCK_PLAYER_CARDS];

  return (
    <div className="relative h-[560px] overflow-hidden rounded-[28px] border border-border bg-surface/70 p-1 shadow-[0_24px_60px_-24px_rgba(0,0,0,0.6)]">
      <div className="relative h-full overflow-hidden rounded-[24px] [mask-image:linear-gradient(to_bottom,transparent,black_8%,black_92%,transparent)]">
      <div className="player-ticker-track flex flex-col gap-4 p-4">
        {cards.map((player, i) => (
          <PlayerCard key={`${player.name}-${i}`} player={player} />
        ))}
      </div>

      <style>{`
        .player-ticker-track {
          animation: player-ticker-scroll 40s linear infinite;
        }
        .player-ticker-track:hover {
          animation-play-state: paused;
        }
        @keyframes player-ticker-scroll {
          from { transform: translateY(0); }
          to { transform: translateY(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .player-ticker-track {
            animation: none;
          }
        }
      `}</style>
      </div>
    </div>
  );
}
