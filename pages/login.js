import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import styles from "../styles/LoginPage.module.css";

export default function LoginPage() {
  const [role, setRole] = useState("user");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    async function checkSession() {
      try {
        const res = await fetch("/api/session", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        if (data.role === "admin") router.replace("/admin");
        else if (data.role === "user") router.replace("/user-content");
      } catch (err) {
        // Not logged in, stay on login page
      }
    }
    checkSession();
  }, [router]);

  async function submit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ role, password }),
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Login failed");
      }

      const data = await res.json();

      // Redirect based on role
      if (data.role === "admin") router.push("/admin");
      else if (data.role === "user") router.push("/user-content");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>SMART VIEW</h1>
      <p className={styles.subtitle}>
        Access and preview your files instantly. View, manage, and download your documents easily in one smart platform.
      </p>

      <form onSubmit={submit}>
        <div className={styles.formRow}>
          <label>
            <input
              type="radio"
              name="role"
              value="user"
              checked={role === "user"}
              onChange={() => setRole("user")}
            />{" "}
            Login as User (no password)
          </label>
        </div>

        <div className={styles.formRow}>
          <label>
            <input
              type="radio"
              name="role"
              value="admin"
              checked={role === "admin"}
              onChange={() => setRole("admin")}
            />{" "}
            Login as Admin (requires password)
          </label>
        </div>

        {role === "admin" && (
          <div className={styles.formRow}>
            <input
              placeholder="Admin password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
        )}

        <div className={styles.formRow}>
          <button className={styles.button} type="submit">Login</button>{" "}
          <a href="/" className={styles.small}>Cancel</a>
        </div>
      </form>

      {error && <div className={styles.error}>{error}</div>}

      <div className={styles.copyright}>
        © ENAKHENA EXCELLENCE 2025
      </div>
    </div>
  );
}
