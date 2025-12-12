import { useEffect, useState } from "react";
import Link from "next/link";
import styles from "../styles/UserContent.module.css";

export default function UserContent() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchFiles();
  }, []);

  async function fetchFiles() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/files", { credentials: "include" });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      setFiles(data || []);
    } catch (err) {
      setError(err.message || "Failed to load files");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>User Content</h1>

        <Link href="/" className={styles.button}>
          Home
        </Link>
      </div>

      <p className={styles.note}>You can preview and download your files.</p>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.loading}>Loading files…</div>}
      {!loading && files.length === 0 && <div className={styles.empty}>No files found.</div>}

      <div className={styles.fileList}>
        {files.map((f) => (
          <div key={f.id} className={styles.file}>
            <div className={styles.fileTop}>
              <div>
                <strong>{f.title || f.originalName || "Untitled"}</strong>
                <div className={styles.note}>
                  Uploaded:{" "}
                  {f.createdAt
                    ? new Date(f.createdAt).toLocaleString()
                    : "unknown"}
                </div>
              </div>

              <div className={styles.actions}>
  <a className={styles.button} href={`/preview?id=${f.id}`}>
    Preview
  </a>

  <a
    className={`${styles.button} ${styles.downloadButton}`}
    href={`/api/download?id=${f.id}`}
  >
    Download
  </a>
</div>

            </div>

            {f.description && (
              <div className={styles.description}>
                {f.description}
              </div>
            )}
          </div>
        ))}
      </div>
      <div className={styles.footer}>
        © ENAKHENA EXCELLENCE 2025
      </div>

    </div>
    
  );
}
