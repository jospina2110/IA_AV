export default function EventsPanel({ events }) {
  if (!events.length) {
    return (
      <div style={s.empty}>
        <div style={s.emptyIcon}>◌</div>
        <p style={s.emptyText}>AWAITING EVENTS...</p>
        <p style={s.emptySub}>System monitoring in standby mode</p>
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
          const hasAlerts = (eventData?.alerts?.length ?? 0) > 0;
          const persons = eventData?.result?.persons ?? 0;
          const helmet = eventData?.result?.helmet_status ?? "N/A";
          
          return (
            <div 
              key={i} 
              style={hasAlerts ? s.cardAlert : s.cardOk}
            >
              <div style={s.cardTop}>
                <div style={s.cardLeft}>
                  <span style={hasAlerts ? s.badgeAlert : s.badgeOk}>
                    <span style={s.badgeDot} />
                    {hasAlerts ? "ALERT" : "OK"}
                  </span>
                  <span style={s.eventId}>#{events.length - i}</span>
                </div>
                <span style={s.time}>
                  {new Date(e.timestamp).toLocaleTimeString("es-CO")}
                </span>
              </div>

              <div style={s.stats}>
                <div style={s.stat}>
                  <span style={s.statLabel}>PPL</span>
                  <span style={{
                    ...s.statValue,
                    color: persons > 0 ? "#ff7800" : "#00ff41"
                  }}>
                    {persons}
                  </span>
                </div>
                <div style={s.stat}>
                  <span style={s.statLabel}>HELMET</span>
                  <span style={{
                    ...s.statValue,
                    color: hasAlerts ? "#ff073a" : "#00ff41"
                  }}>
                    {helmet.toUpperCase()}
                  </span>
                </div>
              </div>

              {hasAlerts && (
                <div style={s.alertsContainer}>
                  {(eventData?.alerts || []).map((a, idx) => (
                    <div key={idx} style={s.alertLine}>
                      <span style={s.alertArrow}>→</span>
                      {a}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700&display=swap');
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const s = {
  container: {
    maxHeight: 420,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 8,
    paddingRight: 4,
  },
  empty: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    padding: "50px 0",
    opacity: 0.4,
  },
  emptyIcon: { 
    fontSize: 40, 
    color: "rgba(255,120,0,0.3)",
    animation: "pulse 2s ease-in-out infinite",
  },
  emptyText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: "rgba(255,120,0,0.5)",
    letterSpacing: 4,
    margin: 0,
  },
  emptySub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 2,
    margin: 0,
  },
  cardAlert: {
    background: "linear-gradient(135deg, rgba(255,7,58,0.08) 0%, rgba(0,0,0,0.4) 100%)",
    border: "1px solid rgba(255,7,58,0.3)",
    borderLeft: "3px solid #ff073a",
    borderRadius: 3,
    padding: "12px 14px",
    animation: "slideIn 0.3s ease",
  },
  cardOk: {
    background: "linear-gradient(135deg, rgba(0,255,65,0.04) 0%, rgba(0,0,0,0.3) 100%)",
    border: "1px solid rgba(0,255,65,0.15)",
    borderLeft: "3px solid #00ff41",
    borderRadius: 3,
    padding: "12px 14px",
    animation: "slideIn 0.3s ease",
  },
  cardTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  cardLeft: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  badgeAlert: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    fontSize: 10,
    color: "#ff073a",
    letterSpacing: 2,
    textShadow: "0 0 10px rgba(255,7,58,0.5)",
  },
  badgeOk: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    fontSize: 10,
    color: "#00ff41",
    letterSpacing: 2,
    textShadow: "0 0 10px rgba(0,255,65,0.5)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "currentColor",
  },
  eventId: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 1,
  },
  time: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 1,
  },
  stats: {
    display: "flex",
    gap: 16,
  },
  stat: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  statLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 8,
    color: "rgba(255,120,0,0.4)",
    letterSpacing: 2,
  },
  statValue: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 13,
    fontWeight: 600,
    letterSpacing: 1,
  },
  alertsContainer: {
    marginTop: 8,
    paddingTop: 8,
    borderTop: "1px solid rgba(255,7,58,0.15)",
  },
  alertLine: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "#ff6b4a",
    paddingLeft: 4,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  alertArrow: {
    color: "rgba(255,7,58,0.5)",
  },
};