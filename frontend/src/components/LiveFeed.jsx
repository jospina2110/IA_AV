const BASE_URL = import.meta.env.VITE_IMAGES_URL ?? import.meta.env.VITE_API_URL?.replace("/api", "") ?? "http://127.0.0.1:8000";

export default function LiveFeed({ latest, isDanger }) {
  if (!latest) {
    return (
      <div style={s.empty}>
        <div style={s.scanLine} />
        <div style={s.noSignal}>
          <div style={s.noSignalIcon}>◌</div>
          <div style={s.noSignalText}>NO SIGNAL</div>
          <div style={s.noSignalSub}>AWAITING ESP32-CAM FEED...</div>
        </div>
        <div style={s.hlines} />
      </div>
    );
  }

  const result = latest?.data?.result;
  const imgPath = latest?.data?.processed_image || result?.processed_image;
  
  let imgUrl = null;
  if (imgPath) {
    if (imgPath.startsWith("/")) {
      imgUrl = imgPath;
    } else if (imgPath.includes("/media/")) {
      const filename = imgPath.split("/media/")[1];
      imgUrl = `/media/${filename}`;
    } else {
      imgUrl = `${BASE_URL}${imgPath}`;
    }
  }

  const hasAlert = result?.helmet_status === "not_detected" || (latest?.data?.alerts?.length ?? 0) > 0;
  const persons = result?.persons ?? 0;
  const helmetStatus = result?.helmet_status ?? "unknown";

  return (
    <div style={s.wrap}>
      <div style={{...s.imgWrap, borderColor: hasAlert ? "#ff073a40" : "#ff780040"}}>
        <div style={s.gridOverlay} />
        {hasAlert && <div style={s.dangerOverlay} />}
        
        {imgUrl ? (
          <img src={imgUrl} alt="Live Feed" style={s.img} />
        ) : (
          <div style={s.noImg}>
            <span style={s.noImgIcon}>📷</span>
            <span style={s.noImgText}>NO IMAGE DATA</span>
          </div>
        )}
        
        <div style={{...s.liveBadge, borderColor: hasAlert ? "#ff073a" : "#ff7800"}}>
          <span style={{...s.liveDot, background: hasAlert ? "#ff073a" : "#00ff41"}} />
          <span style={{color: hasAlert ? "#ff073a" : "#ff7800"}}>LIVE</span>
        </div>
        
        <div style={s.cornerTL} />
        <div style={s.cornerTR} />
        <div style={s.cornerBL} />
        <div style={s.cornerBR} />
      </div>

      <div style={s.meta}>
        <div style={s.metaItem}>
          <div style={s.metaHeader}>
            <span style={s.metaLabel}>▸ TIMESTAMP</span>
          </div>
          <span style={s.metaVal}>
            {latest.timestamp
              ? new Date(latest.timestamp).toLocaleString("es-CO")
              : "—"}
          </span>
        </div>
        <div style={s.metaItem}>
          <div style={s.metaHeader}>
            <span style={s.metaLabel}>▸ DETECTED</span>
          </div>
          <span style={{ 
            ...s.metaVal, 
            color: persons > 0 ? "#ff7800" : "#00ff41",
            textShadow: persons > 0 ? "0 0 10px rgba(255,120,0,0.5)" : "0 0 10px rgba(0,255,65,0.5)"
          }}>
            {persons} PPL
          </span>
        </div>
        <div style={s.metaItem}>
          <div style={s.metaHeader}>
            <span style={s.metaLabel}>▸ HELMET</span>
          </div>
          <span style={{
            ...s.metaVal,
            color: hasAlert ? "#ff073a" : "#00ff41",
            textShadow: hasAlert ? "0 0 10px rgba(255,7,58,0.5)" : "0 0 10px rgba(0,255,65,0.5)"
          }}>
            {helmetStatus.toUpperCase()}
          </span>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes scan {
          0% { top: 0; opacity: 0.6; }
          100% { top: 100%; opacity: 0; }
        }
        @keyframes flicker {
          0%, 100% { opacity: 1; }
          92% { opacity: 1; }
          93% { opacity: 0.3; }
          94% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

const s = {
  wrap: { display: "flex", flexDirection: "column", gap: 14 },
  imgWrap: {
    position: "relative",
    borderRadius: 4,
    overflow: "hidden",
    background: "#050505",
    aspectRatio: "4/3",
    border: "1px solid",
    boxShadow: "0 0 30px rgba(255,120,0,0.1), inset 0 0 60px rgba(0,0,0,0.8)",
  },
  gridOverlay: {
    position: "absolute",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,120,0,0.03) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,120,0,0.03) 1px, transparent 1px)
    `,
    backgroundSize: "20px 20px",
    pointerEvents: "none",
    zIndex: 1,
  },
  dangerOverlay: {
    position: "absolute",
    inset: 0,
    background: "linear-gradient(180deg, rgba(255,7,58,0.1) 0%, transparent 50%, rgba(255,7,58,0.1) 100%)",
    animation: "flicker 0.5s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 2,
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
    gap: 12,
    background: "rgba(0,0,0,0.9)",
  },
  noImgIcon: { fontSize: 36, filter: "grayscale(1) opacity(0.3)" },
  noImgText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 4,
  },
  empty: {
    aspectRatio: "4/3",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(0,0,0,0.95)",
    border: "1px solid rgba(255,120,0,0.1)",
    borderRadius: 4,
    position: "relative",
    overflow: "hidden",
  },
  scanLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255,120,0,0.5), transparent)",
    animation: "scan 2.5s linear infinite",
    zIndex: 10,
  },
  noSignal: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 8,
    animation: "flicker 3s ease-in-out infinite",
  },
  noSignalIcon: {
    fontSize: 48,
    color: "rgba(255,120,0,0.15)",
  },
  noSignalText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 16,
    color: "rgba(255,120,0,0.4)",
    letterSpacing: 6,
    fontWeight: 600,
  },
  noSignalSub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.1)",
    letterSpacing: 3,
  },
  hlines: {
    position: "absolute",
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,120,0,0.02) 2px, rgba(255,120,0,0.02) 4px)",
    pointerEvents: "none",
  },
  liveBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    background: "rgba(0,0,0,0.9)",
    border: "1px solid",
    borderRadius: 2,
    padding: "5px 12px",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    letterSpacing: 3,
    display: "flex",
    alignItems: "center",
    gap: 8,
    zIndex: 5,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    animation: "pulse 1.2s ease-in-out infinite",
  },
  cornerTL: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 20,
    height: 20,
    borderTop: "2px solid #ff7800",
    borderLeft: "2px solid #ff7800",
    zIndex: 5,
  },
  cornerTR: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 20,
    height: 20,
    borderTop: "2px solid #ff7800",
    borderRight: "2px solid #ff7800",
    zIndex: 5,
  },
  cornerBL: {
    position: "absolute",
    bottom: 8,
    left: 8,
    width: 20,
    height: 20,
    borderBottom: "2px solid #ff7800",
    borderLeft: "2px solid #ff7800",
    zIndex: 5,
  },
  cornerBR: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 20,
    height: 20,
    borderBottom: "2px solid #ff7800",
    borderRight: "2px solid #ff7800",
    zIndex: 5,
  },
  meta: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr 1fr",
    gap: 10,
  },
  metaItem: {
    background: "linear-gradient(135deg, rgba(255,120,0,0.05) 0%, rgba(0,0,0,0.4) 100%)",
    border: "1px solid rgba(255,120,0,0.15)",
    borderRadius: 3,
    padding: "10px 12px",
    display: "flex",
    flexDirection: "column",
    gap: 4,
  },
  metaHeader: {
    display: "flex",
    alignItems: "center",
    gap: 4,
  },
  metaLabel: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255,120,0,0.6)",
    letterSpacing: 2,
  },
  metaVal: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 14,
    fontWeight: 600,
    color: "#ffffff",
    letterSpacing: 1,
  },
};