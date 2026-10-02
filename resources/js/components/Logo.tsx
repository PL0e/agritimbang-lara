export default function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`logo ${compact ? "logo-compact" : ""}`}>
      <div className="logo-mark" aria-hidden="true">
        <span className="leaf leaf-one" />
        <span className="leaf leaf-two" />
        <span className="scale-line" />
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
