import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import EventsPanel from "./EventsPanel";
import LiveFeed from "./LiveFeed";
import StatusCard from "./StatusCard";

export default function Dashboard() {
  const [events, setEvents] = useState([]);
  const [latest, setLatest] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);
  const [online, setOnline] = useState(false);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    try {
      const [eventsRes, latestRes] = await Promise.all([
        api.get("/events"),
        api.get("/events/latest"),
      ]);
      setEvents(eventsRes.data.events ?? []);
      setLatest(latestRes.data.event ?? null);
      setLastUpdate(new Date());
      setOnline(true);
    } catch {
      setOnline(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const data = latest?.data?.data?.result || latest?.data?.result;
  const persons = data?.persons ?? 0;
  const helmetStatus = data?.helmet_status ?? "N/A";
  const alertCount = events.filter(
    (e) => (e.data?.data?.alerts || e.data?.alerts || []).length > 0
  ).length;
  const isDanger = helmetStatus === "not_detected" && persons > 0;

  return (
    <div style={s.page}>
      <div style={s.matrixRain} />
      <div style={s.scanlines} />
      <div style={s.vignette} />
      {isDanger && <div style={s.glitchOverlay} />}

      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.logo}>
            <span style={s.logoBracket}>[</span>
            <span style={s.logoText}>SMARTSITE</span>
            <span style={s.logoBracket}>]</span>
          </div>
          <div style={s.navSub}>
            <span style={s.blink}>●</span> AI SECURITY v2.0
          </div>
        </div>

        <div style={s.navCenter}>
          <div style={s.statusBadge}>
            <span style={{...s.statusDot, background: online ? '#00ff41' : '#ff073a'}} />
            <span style={s.statusText}>{online ? "ONLINE" : "OFFLINE"}</span>
          </div>
          {lastUpdate && (
            <div style={s.timestamp}>
              SYNC: {lastUpdate.toLocaleTimeString("es-CO")}
            </div>
          )}
        </div>

        <button onClick={handleLogout} style={s.logoutBtn}>
          <span style={s.btnBracket}>[</span>
          LOGOUT
          <span style={s.btnBracket}>]</span>
        </button>
      </nav>

      {isDanger && (
        <div style={s.alertBanner}>
          <div style={s.alertMarquee}>
            ⚠ ALERTA: SISTEMA DETECTA INCUMPLIMIENTO EN OBRA — SIN EQUIPO DE PROTECCIÓN ⚠ ALERTA: SISTEMA DETECTA INCUMPLIMIENTO EN OBRA —
          </div>
        </div>
      )}

      <main style={s.main}>
        <div style={s.kpiGrid}>
          <StatusCard
            icon="👷"
            label="PERSONAS"
            value={persons}
            accent={persons > 0}
            sublabel="DETECTADAS"
          />
          <StatusCard
            icon="⛑"
            label="CASCO"
            value={helmetStatus === "detected" ? "OK" : helmetStatus === "not_detected" ? "N/A" : "N/A"}
            danger={isDanger}
            accent={helmetStatus === "detected"}
            sublabel="ESTADO"
          />
          <StatusCard
            icon="⚡"
            label="ALERTAS"
            value={alertCount}
            danger={alertCount > 0}
            sublabel="TOTALES"
          />
          <StatusCard
            icon="📊"
            label="EVENTOS"
            value={events.length}
            sublabel="PROCESADOS"
          />
        </div>

        <div style={s.contentGrid}>
          <div style={s.feedPanel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitleRow}>
                <span style={s.panelIcon}>◈</span>
                <span style={s.panelTitle}>LIVE FEED</span>
                <div style={s.liveIndicator}>
                  <span style={s.liveDot} /> EN VIVO
                </div>
              </div>
              <div style={s.panelMeta}>ESP32-CAM • YOLOv8 • REAL-TIME</div>
            </div>
            <LiveFeed latest={latest} isDanger={isDanger} />
          </div>

          <div style={s.eventsPanel}>
            <div style={s.panelHeader}>
              <div style={s.panelTitleRow}>
                <span style={s.panelIcon}>▣</span>
                <span style={s.panelTitle}>EVENT LOG</span>
                <div style={s.eventCount}>{events.length} ENTRIES</div>
              </div>
              <div style={s.panelMeta}>BUFFER: 3S INTERVAL</div>
            </div>
            <EventsPanel events={events} />
          </div>
        </div>

        <div style={s.footer}>
          <div style={s.footerLeft}>
            <span style={s.terminalPrompt}>root@smartsite:~$</span>
            <span style={s.typing}> monitor --active</span>
          </div>
          <div style={s.footerRight}>
            <span style={s.version}>BUILD 2026.05.03</span>
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Orbitron:wght@400;700;900&family=Barlow+Condensed:wght@400;600;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes matrixRain {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
        @keyframes glitch {
          0% { clip-path: inset(20% 0 60% 0); transform: translate(-2px, 1px); }
          20% { clip-path: inset(60% 0 10% 0); transform: translate(2px, -1px); }
          40% { clip-path: inset(40% 0 30% 0); transform: translate(-1px, 2px); }
          60% { clip-path: inset(10% 0 70% 0); transform: translate(1px, -2px); }
          80% { clip-path: inset(80% 0 5% 0); transform: translate(-2px, 1px); }
          100% { clip-path: inset(30% 0 50% 0); transform: translate(2px, -1px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes borderGlow {
          0%, 100% { border-color: rgba(255, 120, 0, 0.3); }
          50% { border-color: rgba(255, 120, 0, 0.6); }
        }
        @keyframes typing {
          from { width: 0; }
          to { width: 100%; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#000000",
    fontFamily: "'Barlow Condensed', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  matrixRain: {
    position: "fixed",
    inset: 0,
    background: `
      linear-gradient(180deg, 
        transparent 0%, 
        rgba(0, 255, 65, 0.03) 50%, 
        transparent 100%)
    `,
    backgroundSize: "100% 4px",
    animation: "matrixRain 8s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  scanlines: {
    position: "fixed",
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.15) 2px, rgba(0,0,0,0.15) 4px)",
    pointerEvents: "none",
    zIndex: 1,
  },
  vignette: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.7) 100%)",
    pointerEvents: "none",
    zIndex: 2,
  },
  glitchOverlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(255, 0, 50, 0.05)",
    animation: "glitch 0.3s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 3,
  },
  nav: {
    position: "relative",
    zIndex: 100,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px 28px",
    borderBottom: "1px solid rgba(255, 120, 0, 0.2)",
    background: "linear-gradient(180deg, rgba(0,0,0,0.95) 0%, rgba(10,10,10,0.9) 100%)",
    backdropFilter: "blur(10px)",
  },
  navLeft: {
    display: "flex",
    flexDirection: "column",
    gap: 2,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 2,
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 20,
    letterSpacing: 4,
  },
  logoBracket: {
    color: "#ff7800",
    fontWeight: 400,
  },
  logoText: {
    background: "linear-gradient(90deg, #ff7800, #ff3c00)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    textShadow: "0 0 30px rgba(255, 120, 0, 0.5)",
  },
  navSub: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(0, 255, 65, 0.6)",
    letterSpacing: 2,
    display: "flex",
    alignItems: "center",
    gap: 6,
  },
  blink: {
    fontSize: 8,
    color: "#00ff41",
    animation: "blink 1s ease-in-out infinite",
  },
  navCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  statusBadge: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    background: "rgba(0, 255, 65, 0.1)",
    border: "1px solid rgba(0, 255, 65, 0.3)",
    padding: "6px 14px",
    borderRadius: 2,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: "50%",
    boxShadow: "0 0 10px currentColor",
  },
  statusText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: "#00ff41",
    letterSpacing: 3,
    fontWeight: 600,
  },
  timestamp: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 2,
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255, 60, 0, 0.3)",
    borderRadius: 2,
    padding: "8px 16px",
    color: "#ff3c00",
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: 600,
    fontSize: 12,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    gap: 4,
  },
  btnBracket: {
    color: "rgba(255, 60, 0, 0.5)",
    fontSize: 14,
  },
  alertBanner: {
    position: "relative",
    zIndex: 100,
    background: "linear-gradient(90deg, rgba(255, 0, 50, 0.2), rgba(255, 120, 0, 0.1), rgba(255, 0, 50, 0.2))",
    borderBottom: "2px solid #ff073a",
    padding: "12px 0",
    overflow: "hidden",
  },
  alertMarquee: {
    whiteSpace: "nowrap",
    animation: "marquee 8s linear infinite",
    fontFamily: "'Share Tech Mono', monospace",
    fontWeight: 700,
    fontSize: 13,
    color: "#ff073a",
    letterSpacing: 3,
    textShadow: "0 0 20px rgba(255, 7, 58, 0.8)",
  },
  main: {
    position: "relative",
    zIndex: 50,
    padding: "24px 28px 28px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  kpiGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 16,
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.3fr 1fr",
    gap: 16,
    flex: 1,
  },
  feedPanel: {
    background: "rgba(5, 5, 5, 0.9)",
    border: "1px solid rgba(255, 120, 0, 0.2)",
    borderRadius: 4,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    animation: "borderGlow 3s ease-in-out infinite",
  },
  eventsPanel: {
    background: "rgba(5, 5, 5, 0.9)",
    border: "1px solid rgba(255, 120, 0, 0.2)",
    borderRadius: 4,
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  panelHeader: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  panelTitleRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  panelIcon: {
    color: "#ff7800",
    fontSize: 16,
    textShadow: "0 0 10px rgba(255, 120, 0, 0.8)",
  },
  panelTitle: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 700,
    fontSize: 14,
    color: "#ffffff",
    letterSpacing: 4,
  },
  liveIndicator: {
    display: "flex",
    alignItems: "center",
    gap: 6,
    marginLeft: "auto",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "#00ff41",
    letterSpacing: 2,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#00ff41",
    boxShadow: "0 0 10px #00ff41",
    animation: "blink 1s ease-in-out infinite",
  },
  eventCount: {
    marginLeft: "auto",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255, 120, 0, 0.6)",
    letterSpacing: 2,
  },
  panelMeta: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 2,
    paddingLeft: 26,
  },
  footer: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 0",
    borderTop: "1px solid rgba(255, 120, 0, 0.1)",
    marginTop: "auto",
  },
  footerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  terminalPrompt: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: "#00ff41",
    letterSpacing: 1,
  },
  typing: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: "rgba(255,255,255,0.5)",
    letterSpacing: 1,
  },
  footerRight: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 2,
  },
  version: {
    color: "rgba(255, 120, 0, 0.4)",
  },
};