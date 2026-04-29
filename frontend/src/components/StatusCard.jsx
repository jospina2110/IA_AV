export default function StatusCard({ icon, label, value, accent = false, danger = false }) {
  const color = danger ? "#ff3c00" : accent ? "#ff7800" : "#22c55e";

  return (
    <div style={{ ...s.card, borderColor: `${color}22` }}>
      <div style={s.top}>
        <span style={s.icon}>{icon}</span>
        <div style={{ ...s.indicator, background: color }} />
      </div>
      <div style={{ ...s.value, color }}>{value}</div>
      <div style={s.label}>{label}</div>
    </div>
  );
}

const s = {
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid",
    borderRadius: 2,
    padding: "20px 20px 16px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
    transition: "background 0.2s",
  },
  top: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  icon: { fontSize: 22 },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: "50%",
  },
  value: {
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 800,
    fontSize: 36,
    lineHeight: 1,
    letterSpacing: -1,
  },
  label: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 3,
    marginTop: 4,
  },
};