/** Static, WebGL-free stand-in for a 3D scene: a soft accent glow with fine rings. */
export function SceneFallback({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <div className="absolute top-1/2 left-1/2 size-[70%] max-w-[720px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgb(198_255_61/0.10),transparent_65%)]" />
      {[38, 56, 74].map((size) => (
        <div
          key={size}
          className="absolute top-1/2 left-1/2 aspect-square -translate-x-1/2 -translate-y-1/2 rounded-full border border-[var(--color-line)]"
          style={{ width: `${size}%`, maxWidth: size * 12 }}
        />
      ))}
    </div>
  );
}
