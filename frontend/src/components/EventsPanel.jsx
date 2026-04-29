export default function EventsPanel({ events }) {
  if (!events.length) {
    return (
      <div style={s.empty}>
        <span style={s.emptyIcon}>📡</span>
        <p style={s.emptyText}>ESPERANDO EVENTOS...</p>
      </div>
    );
  }

  return (
    <div style={s.container}>
      {events
        .slice()
        .reverse()
        .map((e, i) => {
         const eventData = e.data?.data || e.data;
         const hasAlerts = eventData?.alerts?.length > 0;
          return (
            <div key={i} style={hasAlerts.length > 0 ? s.cardAlert : s.cardOk}>
              <div style={s.cardHeader}>
                <span style={hasAlerts.length > 0 ? s.badgeAlert : s.badgeOk}>
                  {hasAlerts.length ? "⚠ ALERTA" : "✓ OK"}
                </span>
                <span style={s.time}>
                  {new Date(e.timestamp).toLocaleTimeString("es-CO")}
                </span>
              </div>

              <div style={s.stats}>
                <span style={s.stat}>
                  👷 {eventData?.result?.persons ?? 0} personas
                </span>
                <span style={s.stat}>
                  🪖 {eventData?.result?.helmet_status ?? "N/A"}
                </span>
              </div>

              {hasAlerts.length > 0 &&
                hasAlerts.map((a, idx) => (
                  <div key={idx} style={s.alertLine}>
                    {a}
                  </div>
                ))}
            </div>
          );
        })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@600;700&family=JetBrains+Mono:wght@400&display=swap');
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

const s = {
  container: {
    maxHeight: 480,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingRight: 4,
    scrollbarWidth: "thin",
    scrollbarColor: "rgba(255,120,0,0.3) transparent",
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 12,
    padding: "40px 0",
    opacity: 0.4,
  },
  emptyIcon: { fontSize: 32 },
  emptyText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 3,
    margin: 0,
  },
  cardAlert: {
    background: "rgba(255,60,0,0.06)",
    border: "1px solid rgba(255,60,0,0.3)",
    borderLeft: "3px solid #ff3c00",
    borderRadius: 2,
    padding: "12px 14px",
    animation: "slideIn 0.3s ease",
  },
  cardOk: {
    background: "rgba(34,197,94,0.04)",
    border: "1px solid rgba(34,197,94,0.15)",
    borderLeft: "3px solid #22c55e",
    borderRadius: 2,
    padding: "12px 14px",
    animation: "slideIn 0.3s ease",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  badgeAlert: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    color: "#ff3c00",
    letterSpacing: 2,
  },
  badgeOk: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 11,
    color: "#22c55e",
    letterSpacing: 2,
  },
  time: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
  },
  stats: {
    display: "flex",
    gap: 16,
    marginBottom: 6,
  },
  stat: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.6)",
  },
  alertLine: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#ff6b4a",
    marginTop: 4,
    paddingLeft: 8,
    borderLeft: "1px solid rgba(255,60,0,0.3)",
  },
};
