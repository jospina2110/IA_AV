import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/auth/login", { username, password });
      localStorage.setItem("token", response.data.access_token);
      navigate("/");
    } catch (err) {
      setError("ACCESS DENIED");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.matrixBg} />
      <div style={s.scanlines} />
      
      <div style={s.loginBox}>
        <div style={s.header}>
          <div style={s.logoIcon}>[◈]</div>
          <h1 style={s.title}>SMARTSITE</h1>
          <div style={s.subtitle}>SECURE ACCESS TERMINAL v2.0</div>
        </div>

        <form onSubmit={handleLogin} style={s.form}>
          <div style={s.inputGroup}>
            <label style={s.label}>▸ USERNAME</label>
            <input
              style={s.input}
              type="text"
              placeholder="Enter username..."
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          
          <div style={s.inputGroup}>
            <label style={s.label}>▸ PASSWORD</label>
            <input
              style={s.input}
              type="password"
              placeholder="Enter password..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <div style={s.errorBox}>
              <span style={s.errorIcon}>!</span>
              <span style={s.errorText}>{error}</span>
            </div>
          )}

          <button 
            style={loading ? {...s.button, ...s.buttonDisabled} : s.button} 
            type="submit" 
            disabled={loading}
          >
            <span style={s.btnBracket}>[</span>
            {loading ? "AUTHENTICATING..." : "LOGIN"}
            <span style={s.btnBracket}>]</span>
          </button>
        </form>

        <div style={s.footer}>
          <div style={s.footerLine} />
          <div style={s.footerText}>PROTECTED BY AI SECURITY SYSTEM</div>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Share+Tech+Mono&display=swap');
        
        @keyframes matrixRain {
          0% { background-position: 0% 0%; }
          100% { background-position: 0% 100%; }
        }
        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 1; }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#000000",
    position: "relative",
    overflow: "hidden",
  },
  matrixBg: {
    position: "absolute",
    inset: 0,
    background: `
      linear-gradient(180deg, 
        transparent 0%, 
        rgba(0, 255, 65, 0.02) 50%, 
        transparent 100%)
    `,
    backgroundSize: "100% 3px",
    animation: "matrixRain 6s linear infinite",
    pointerEvents: "none",
  },
  scanlines: {
    position: "absolute",
    inset: 0,
    background: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.1) 2px, rgba(0,0,0,0.1) 4px)",
    pointerEvents: "none",
  },
  loginBox: {
    position: "relative",
    zIndex: 10,
    background: "rgba(5, 5, 5, 0.95)",
    border: "1px solid rgba(255, 120, 0, 0.3)",
    borderRadius: 4,
    padding: "40px 36px",
    width: 340,
    boxShadow: "0 0 60px rgba(255, 120, 0, 0.1), inset 0 0 40px rgba(0,0,0,0.8)",
  },
  header: {
    textAlign: "center",
    marginBottom: 32,
  },
  logoIcon: {
    fontSize: 32,
    color: "#ff7800",
    textShadow: "0 0 20px rgba(255, 120, 0, 0.8)",
    marginBottom: 12,
  },
  title: {
    fontFamily: "'Orbitron', sans-serif",
    fontWeight: 900,
    fontSize: 28,
    color: "#ffffff",
    letterSpacing: 6,
    margin: "0 0 8px",
    textShadow: "0 0 30px rgba(255, 120, 0, 0.4)",
  },
  subtitle: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 10,
    color: "rgba(255, 120, 0, 0.6)",
    letterSpacing: 3,
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
  inputGroup: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  label: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 11,
    color: "rgba(255, 120, 0, 0.7)",
    letterSpacing: 2,
  },
  input: {
    display: "block",
    width: "100%",
    padding: "14px 16px",
    borderRadius: 2,
    border: "1px solid rgba(255, 120, 0, 0.2)",
    background: "rgba(0, 0, 0, 0.6)",
    color: "#ffffff",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 14,
    boxSizing: "border-box",
    outline: "none",
    transition: "all 0.2s",
    boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)",
  },
  errorBox: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    background: "rgba(255, 7, 58, 0.1)",
    border: "1px solid rgba(255, 7, 58, 0.3)",
    borderRadius: 2,
    padding: "10px 14px",
  },
  errorIcon: {
    width: 20,
    height: 20,
    borderRadius: "50%",
    background: "#ff073a",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    fontWeight: 700,
  },
  errorText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 12,
    color: "#ff073a",
    letterSpacing: 2,
  },
  button: {
    width: "100%",
    padding: "14px",
    borderRadius: 2,
    border: "1px solid rgba(255, 120, 0, 0.4)",
    background: "rgba(255, 120, 0, 0.1)",
    color: "#ff7800",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: 14,
    fontWeight: 700,
    letterSpacing: 4,
    cursor: "pointer",
    transition: "all 0.2s",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.5,
    cursor: "not-allowed",
  },
  btnBracket: {
    color: "rgba(255, 120, 0, 0.4)",
    fontSize: 16,
  },
  footer: {
    marginTop: 32,
    textAlign: "center",
  },
  footerLine: {
    height: 1,
    background: "linear-gradient(90deg, transparent, rgba(255, 120, 0, 0.2), transparent)",
    marginBottom: 12,
  },
  footerText: {
    fontFamily: "'Share Tech Mono', monospace",
    fontSize: 9,
    color: "rgba(255, 255, 255, 0.15)",
    letterSpacing: 2,
  },
};