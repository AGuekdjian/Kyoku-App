export function PageSkeleton() {
  return (
    <div
      className="skeleton-page"
      aria-busy="true"
      aria-label="Cargando contenido"
    >
      <span className="sr-only">Cargando…</span>
      <header className="skeleton-header">
        <div>
          <span className="skeleton skeleton-eyebrow" />
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-copy" />
        </div>
        <span className="skeleton skeleton-button" />
      </header>
      <div className="skeleton-metrics">
        {Array.from({ length: 3 }, (_, index) => (
          <div className="skeleton-card" key={index}>
            <span className="skeleton skeleton-label" />
            <span className="skeleton skeleton-value" />
            <span className="skeleton skeleton-copy short" />
          </div>
        ))}
      </div>
      <section className="panel skeleton-panel">
        {Array.from({ length: 6 }, (_, index) => (
          <div className="skeleton-row" key={index}>
            <span className="skeleton skeleton-avatar" />
            <div>
              <span className="skeleton skeleton-row-title" />
              <span className="skeleton skeleton-row-copy" />
            </div>
            <span className="skeleton skeleton-badge" />
          </div>
        ))}
      </section>
    </div>
  );
}
