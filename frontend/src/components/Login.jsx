import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";          // ✅ módulo que sí existe

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

      // ✅ Misma key que usa ProtectedRoute
      localStorage.setItem("token", response.data.access_token);

      navigate("/");   // ✅ ruta correcta (Dashboard está en "/")

    } catch (err) {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>🚧 SmartSite</h2>
        <p style={styles.subtitle}>Acceso al panel de monitoreo</p>

        <form onSubmit={handleLogin}>
          <input
            style={styles.input}
            type="text"
            placeholder="Usuario"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.button} type="submit" disabled={loading}>
            {loading ? "Ingresando..." : "Ingresar"}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "#0f172a",
  },
  card: {
    background: "#1e293b",
    padding: "40px 32px",
    borderRadius: 12,
    width: 320,
  },
  title: { color: "white", margin: "0 0 4px", textAlign: "center" },
  subtitle: { color: "#94a3b8", fontSize: 13, textAlign: "center", marginBottom: 24 },
  input: {
    display: "block",
    width: "100%",
    padding: "10px 12px",
    marginBottom: 12,
    borderRadius: 8,
    border: "1px solid #334155",
    background: "#0f172a",
    color: "white",
    fontSize: 14,
    boxSizing: "border-box",
  },
  error: { color: "#f87171", fontSize: 13, marginBottom: 8 },
  button: {
    width: "100%",
    padding: "10px",
    borderRadius: 8,
    border: "none",
    background: "#3b82f6",
    color: "white",
    fontSize: 15,
    cursor: "pointer",
  },
};
