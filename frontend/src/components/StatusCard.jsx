export default function StatusCard({ icon, label, value, accent = false, danger = false, sublabel = "" }) {
  const getColors = () => {
    if (danger) return { main: "#ff073a", glow: "rgba(255, 7, 58, 0.6)", bg: "rgba(255, 7, 58, 0.08)" };
    if (accent) return { main: "#ff7800", glow: "rgba(255, 120, 0, 0.6)", bg: "rgba(255, 120, 0, 0.08)" };
    return { main: "#00ff41", glow: "rgba(0, 255, 65, 0.6)", bg: "rgba(0, 255, 65, 0.05)" };
  };

  const colors = getColors();

  return (
    <div style={{ 
      ...s.card, 
      borderColor: colors.main + "40",
      background: `linear-gradient(135deg, ${colors.bg} 0%, rgba(0,0,0,0.8) 100%)`,
      boxShadow: `0 0 20px ${colors.glow}20, inset 0 0 30px ${colors.glow}10`
    }}>
      <div style={s.top}>
        <span style={s.icon}>{icon}</span>
        <div style={{ 
          ...s.indicator, 
          background: colors.main,
          boxShadow: `0 0 10px ${colors.main}`
        }} />
      </div>
      <div style={{ ...s.value, color: colors.main, textShadow: `0 0 20px ${colors.glow}` }}>
        {value}
      </div>
      <div style={s.label}>
        <span style={{ color: colors.main }}>{label}</span>
        {sublabel && <span style={s.sublabel}> · {sublabel}</span>}
      </div>
    </div>
  );
}

const s = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 4,
    padding: "18px 18px 14px",
    display: "flex",
    flexDirection: "column",
    gap: 6,
    transition: "all 0.3s ease",
    position: "relative",
    overflow: "hidden",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { 
    fontSize: 24,
    filter: "grayscale(0.2)",
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    animation: "pulse 2s ease-in-out infinite",
  },
  value: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 42,
    lineHeight: 1,
    letterSpacing: -1,
  },
  label: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.4)",
    letterSpacing: 2,
    display: "flex",
    alignItems: "center",
    marginTop: 2,
  },
  sublabel: {
    color: "rgba(255,255,255,0.2)",
  },
};