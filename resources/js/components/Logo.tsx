export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`}>
      <div className="logo-mark" aria-hidden="true">
        <svg viewBox="0 0 64 64" focusable="false">
          <path className="scale-beam" d="M11 17Q32 7 53 17" />
          <path className="scale-stem" d="M32 16v35" />
          <path className="scale-chain" d="M12 18 5 40m7-22 8 22m32-22-8 22m8-22 7 22" />
          <path className="scale-pan" d="M3 40q9 13 19 0H3Zm28 0q9 13 19 0H31Z" />
          <path className="scale-base" d="M24 51h16l5 5H19l5-5Z" />
          <circle className="scale-pivot" cx="32" cy="15" r="3.5" />
        </svg>
      </div>
      {!compact && (
        <div>
          <div className="logo-name">AgriTimbang</div>
          <div className="logo-tagline">Presyong patas. Timbang na tapat.</div>
        </div>
      )}
    </div>
  );
}
