const BASE_URL = import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8000";

export default function LiveFeed({ latest }) {
  if (!latest) {
    return (
      <div style={s.empty}>
        <div style={s.scanLine} />
        <span style={s.emptyText}>SIN SEÑAL</span>
        <span style={s.emptySubText}>Esperando imagen del ESP32-CAM...</span>
      </div>
    );
  }

 const BASE_URL = "http://127.0.0.1:8000";

const result = latest?.data?.result;

const imgPath =
  latest?.data?.processed_image ||
  result?.processed_image;

const imgUrl = imgPath
  ? imgPath.startsWith("http")
    ? imgPath
    : `${BASE_URL}${imgPath}`
  : null;

const hasAlert =
  result?.helmet_status === "not_detected" ||
  (latest?.data?.alerts?.length ?? 0) > 0;

// Métricas
const persons = result?.persons ?? 0;
const helmetStatus = result?.helmet_status ?? "unknown";
  return (
    <div style={s.wrap}>
      {/* imagen */}
      <div style={s.imgWrap}>
        <div style={hasAlert ? s.frameDanger : s.frameOk} />
        {imgUrl ? (
          <img src={imgUrl} alt="Feed en vivo" style={s.img} />
        ) : (
          <div style={s.noImg}>
            <span style={{ fontSize: 32 }}>📷</span>
            <span style={s.noImgText}>Sin imagen procesada</span>
          </div>
        )}
        <div style={s.liveBadge}>
          <span style={s.liveDot} />
          LIVE
        </div>
      </div>

      {/* meta */}
      <div style={s.meta}>
        <div style={s.metaItem}>
          <span style={s.metaLabel}>TIMESTAMP</span>
          <span style={s.metaVal}>
            {latest.timestamp
              ? new Date(latest.timestamp).toLocaleString("es-CO")
              : "—"}
          </span>
        </div>
        <div style={s.metaItem}>
          <span style={s.metaLabel}>PERSONAS</span>
          <span style={{ ...s.metaVal, color: result?.persons > 0 ? "#ff7800" : "#22c55e" }}>
            {result?.persons ?? 0}
          </span>
        </div>
        <div style={s.metaItem}>
          <span style={s.metaLabel}>CASCO</span>
          <span style={{
            ...s.metaVal,
            color: hasAlert ? "#ff3c00" : "#22c55e"
          }}>
            {result?.helmet_status ?? "N/A"}
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scan {
          0% { top: 0; opacity: 0.8; }
          100% { top: 100%; opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 12 },
  imgWrap: {
    position: "relative",
    borderRadius: 2,
    overflow: "hidden",
    background: "#000",
    aspectRatio: "4/3",
  },
  frameOk: {
    position: "absolute",
    inset: 0,
    border: "2px solid rgba(34,197,94,0.4)",
    zIndex: 2,
    pointerEvents: "none",
    borderRadius: 2,
  },
  frameDanger: {
    position: "absolute",
    inset: 0,
    border: "2px solid rgba(255,60,0,0.7)",
    zIndex: 2,
    pointerEvents: "none",
    borderRadius: 2,
    boxShadow: "inset 0 0 20px rgba(255,60,0,0.15)",
  },
  img: {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    display: "block",
  },
  noImg: {
    width: "100%",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "rgba(255,255,255,0.02)",
  },
  noImgText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.3)",
    letterSpacing: 2,
  },
  liveBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(0,0,0,0.8)",
    border: "1px solid rgba(255,120,0,0.4)",
    borderRadius: 2,
    padding: "4px 10px",
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#ff7800",
    letterSpacing: 3,
    display: "flex",
    alignItems: "center",
    gap: 6,
    zIndex: 3,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff3c00",
    animation: "pulse 1s ease-in-out infinite",
  },
  empty: {
    aspectRatio: "4/3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    background: "rgba(255,255,255,0.02)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 2,
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    background: "linear-gradient(90deg, transparent, rgba(255,120,0,0.4), transparent)",
    animation: "scan 2s linear infinite",
  },
  emptyText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontWeight: 500,
    fontSize: 18,
    color: "rgba(255,255,255,0.15)",
    letterSpacing: 6,
  },
  emptySubText: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.1)",
    letterSpacing: 2,
  },
  meta: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 8,
  },
  metaItem: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 2,
    padding: "8px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  metaLabel: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: "rgba(255,120,0,0.6)",
    letterSpacing: 2,
  },
  metaVal: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 13,
    fontWeight: 500,
    color: "#f0f0f0",
  },
};
