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
      {/* Fondo */}
      <div style={s.grid} />
      {isDanger && <div style={s.dangerGlow} />}

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={s.navLeft}>
          <div style={s.navIcon}>⚙</div>
          <div>
            <div style={s.navTitle}>SMARTSITE</div>
            <div style={s.navSub}>AI SECURITY · OBRA INTELIGENTE</div>
          </div>
        </div>

        <div style={s.navCenter}>
          <div style={online ? s.statusOnline : s.statusOffline}>
            <span style={online ? s.dotGreen : s.dotRed} />
            {online ? "BACKEND ONLINE" : "SIN CONEXIÓN"}
          </div>
          {lastUpdate && (
            <span style={s.lastUpdate}>
              ACT: {lastUpdate.toLocaleTimeString("es-CO")}
            </span>
          )}
        </div>

        <button onClick={handleLogout} style={s.logoutBtn}>
          SALIR →
        </button>
      </nav>

      {/* ALERTA BANNER */}
      {isDanger && (
        <div style={s.alertBanner}>
          <span style={s.alertBannerDot} />
          ⚠ ALERTA ACTIVA — PERSONA SIN CASCO DETECTADA EN OBRA
          <span style={s.alertBannerDot} />
        </div>
      )}

      <main style={s.main}>
        {/* KPI ROW */}
        <div style={s.kpiRow}>
          <StatusCard
            icon="👷"
            label="PERSONAS DETECTADAS"
            value={persons}
            accent={persons > 0}
          />
          <StatusCard
            icon="🪖"
            label="ESTADO DE CASCO"
            value={helmetStatus.toUpperCase()}
            danger={isDanger}
            accent={helmetStatus === "detected"}
          />
          <StatusCard
            icon="🚨"
            label="ALERTAS TOTALES"
            value={alertCount}
            danger={alertCount > 0}
          />
          <StatusCard
            icon="📸"
            label="IMÁGENES PROCESADAS"
            value={events.length}
          />
        </div>

        {/* MAIN GRID */}
        <div style={s.grid2}>
          {/* LIVE FEED */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>FEED EN VIVO</span>
              <span style={s.panelSub}>ESP32-CAM · YOLOv8</span>
            </div>
            <LiveFeed latest={latest} />
          </div>

          {/* EVENTOS */}
          <div style={s.panel}>
            <div style={s.panelHeader}>
              <span style={s.panelTitle}>REGISTRO DE EVENTOS</span>
              <span style={s.panelSub}>{events.length} total · cada 3s</span>
            </div>
            <EventsPanel events={events} />
          </div>
        </div>
      </main>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap');

        * { box-sizing: border-box; }

        @keyframes gridMove {
          0% { transform: translateY(0); }
          100% { transform: translateY(40px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes dangerPulse {
          0%, 100% { opacity: 0.15; }
          50% { opacity: 0.3; }
        }
        @keyframes marquee {
          0% { transform: translateX(100%); }
          100% { transform: translateX(-100%); }
        }
        @keyframes fadeDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "#080a0e",
    fontFamily: "'Barlow Condensed', sans-serif",
    position: "relative",
    overflow: "hidden",
  },
  grid: {
    position: "fixed",
    inset: 0,
    backgroundImage: `
      linear-gradient(rgba(255,120,0,0.04) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,120,0,0.04) 1px, transparent 1px)
    `,
    backgroundSize: "40px 40px",
    animation: "gridMove 6s linear infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  dangerGlow: {
    position: "fixed",
    inset: 0,
    background: "radial-gradient(ellipse at center, rgba(255,30,0,0.12) 0%, transparent 70%)",
    animation: "dangerPulse 1.5s ease-in-out infinite",
    pointerEvents: "none",
    zIndex: 0,
  },
  nav: {
    position: "relative",
    zIndex: 10,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: "1px solid rgba(255,120,0,0.15)",
    background: "rgba(8,10,14,0.9)",
    backdropFilter: "blur(10px)",
  },
  navLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  navIcon: {
    width: 36,
    height: 36,
    background: "rgba(255,120,0,0.15)",
    border: "1px solid rgba(255,120,0,0.4)",
    borderRadius: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 18,
  },
  navTitle: {
    fontWeight: 800,
    fontSize: 18,
    color: "#ff7800",
    letterSpacing: 4,
  },
  navSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: "rgba(255,120,0,0.4)",
    letterSpacing: 3,
  },
  navCenter: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: 4,
  },
  statusOnline: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#22c55e",
    letterSpacing: 2,
  },
  statusOffline: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "#ff3c00",
    letterSpacing: 2,
  },
  dotGreen: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#22c55e",
    animation: "pulse 2s ease-in-out infinite",
  },
  dotRed: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#ff3c00",
    animation: "pulse 1s ease-in-out infinite",
  },
  lastUpdate: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 9,
    color: "rgba(255,255,255,0.2)",
    letterSpacing: 2,
  },
  logoutBtn: {
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: 2,
    padding: "8px 16px",
    color: "rgba(255,255,255,0.4)",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    letterSpacing: 2,
    cursor: "pointer",
    transition: "all 0.2s",
  },
  alertBanner: {
    position: "relative",
    zIndex: 10,
    background: "rgba(255,30,0,0.12)",
    borderBottom: "1px solid rgba(255,30,0,0.4)",
    padding: "10px 32px",
    fontFamily: "'Barlow Condensed', sans-serif",
    fontWeight: 700,
    fontSize: 13,
    color: "#ff6b4a",
    letterSpacing: 3,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    animation: "fadeDown 0.3s ease",
  },
  alertBannerDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#ff3c00",
    animation: "pulse 0.8s ease-in-out infinite",
  },
  main: {
    position: "relative",
    zIndex: 5,
    padding: "24px 32px 32px",
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
  },
  grid2: {
    display: "grid",
    gridTemplateColumns: "1.2fr 1fr",
    gap: 16,
  },
  panel: {
    background: "rgba(10,12,18,0.8)",
    border: "1px solid rgba(255,120,0,0.12)",
    borderRadius: 2,
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    gap: 16,
  },
  panelHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 12,
    borderBottom: "1px solid rgba(255,255,255,0.05)",
  },
  panelTitle: {
    fontWeight: 800,
    fontSize: 16,
    color: "#f0f0f0",
    letterSpacing: 3,
  },
  panelSub: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 10,
    color: "rgba(255,120,0,0.5)",
    letterSpacing: 2,
  },
};
