// Versión más sutil de GlowBackground (marketing) para el panel interno:
// fixed en vez de absolute (no se mueve con el scroll de páginas largas) y
// con menos opacidad para no competir con tablas/datos densos.
export function InteriorGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <div className="absolute -top-40 left-1/4 h-[420px] w-[420px] rounded-full bg-navy-2/25 blur-[140px]" />
      <div className="absolute top-0 right-0 h-[320px] w-[320px] rounded-full bg-accent/10 blur-[130px]" />
    </div>
  );
}
