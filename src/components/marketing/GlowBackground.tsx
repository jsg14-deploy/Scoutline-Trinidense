export function GlowBackground() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute -top-32 left-1/3 h-[440px] w-[440px] rounded-full bg-navy-2/50 blur-[130px]" />
      <div className="absolute top-10 right-0 h-[380px] w-[380px] rounded-full bg-accent/20 blur-[120px]" />
    </div>
  );
}
