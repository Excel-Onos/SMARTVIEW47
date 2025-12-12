import { verifyToken } from "../lib/auth";
import { getAllFiles } from "../lib/db";
import { useState } from "react";
import Router from "next/router";
import styles from "../styles/Admin.module.css";

export default function Admin({ files }) {
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState("");
  const [deletingId, setDeletingId] = useState(null);
  const [fileList, setFileList] = useState(files);

  async function handleUpload(e) {
    e.preventDefault();
    setMsg("");
    const fd = new FormData(e.target);
    setUploading(true);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    setUploading(false);
    if (res.ok) {
      setMsg("Upload successful");
      setTimeout(() => Router.reload(), 600);
    } else {
      const err = await res.text();
      setMsg("Upload failed: " + err);
    }
  }

  async function handleDelete(fileId) {
    const confirmDelete = confirm("Delete this file? This cannot be undone.");
    if (!confirmDelete) return;

    setDeletingId(fileId);
    try {
      const res = await fetch(`/api/delete?id=${encodeURIComponent(fileId)}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Delete failed");
      }

      setFileList(prev => prev.filter(f => f.id !== fileId));
    } catch (err) {
      alert(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className={styles.container}>
      
      <div className={styles.header}>
        <h1>Admin Centre</h1>
        <div>
          <a className={styles.buttonSmall} href="/api/logout">Logout</a>
          <a className={styles.buttonSmall} href="/">Go to site</a>
        </div>
      </div>

      <h2 className={styles.sectionTitle}>Upload new file</h2>

      <form onSubmit={handleUpload} className={styles.form}>
        <input name="title" placeholder="Title (optional)" className={styles.input} />
        <input name="description" placeholder="Description (optional)" className={styles.input} />
        <input type="file" name="file" required className={styles.input} />

        <select name="visibility" defaultValue="public" className={styles.input}>
          <option value="public">Public</option>
          <option value="private">Private</option>
        </select>

        <button className={styles.button} type="submit" disabled={uploading}>
          {uploading ? "Uploading..." : "Upload"}
        </button>

        {msg && <div className={styles.note}>{msg}</div>}
      </form>

      <h2 className={styles.sectionTitle}>All files</h2>

      {fileList.length === 0 && <div className={styles.empty}>No files.</div>}

      {fileList.map(f => (
        <div key={f.id} className={styles.fileCard}>
          <strong>{f.title || f.originalName}</strong>
          <div className={styles.note}>
            ID: {f.id} • {f.visibility} • {new Date(f.createdAt).toLocaleString()}
          </div>

          <div className={styles.actionRow}>
            <a className={styles.buttonSmall} href={`/preview?id=${f.id}`}>Preview</a>
            <a className={styles.downloadButton} href={`/api/download?id=${f.id}`}>Download</a>
            <button
              className={styles.deleteButton}
              onClick={() => handleDelete(f.id)}
              disabled={deletingId === f.id}
            >
              {deletingId === f.id ? "Deleting…" : "Delete"}
            </button>
          </div>

          <div className={styles.description}>{f.description}</div>
        </div>
      ))}

      <div className={styles.footer}>
        © ENAKHENA EXCELLENCE 2025
      </div>

    </div>
  );
}

export async function getServerSideProps(ctx) {
  const token = ctx.req.cookies?.auth || "";
  const payload = verifyToken(token);

  if (!payload || payload.role !== "admin") {
    return {
      redirect: { destination: "/login", permanent: false }
    };
  }

  const files = await getAllFiles();
  return { props: { files } };
}
