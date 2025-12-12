import { useEffect, useState } from "react";
import styles from "../styles/PreviewPage.module.css";

export default function PreviewPage() {
  const [meta, setMeta] = useState(null);
  const [zipEntries, setZipEntries] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("id");
    if (!id) return;

    fetch(`/api/files?id=${id}`)
      .then(r => r.json())
      .then(async data => {
        setMeta(data);
        setLoading(false);

        if (data && data.mime === "application/zip") {
          const res = await fetch(`/api/zip-list?id=${id}`);
          if (res.ok) {
            const j = await res.json();
            setZipEntries(j.entries || []);
          }
        }
      });
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader}></div>
        <div className={styles.skeletonPreview}></div>
      </div>
    );
  }

  if (!meta) return <div className={styles.container}><p>File not found</p></div>;

  const previewUrl = `/api/download?id=${meta.id}&inline=1`;

  const getIcon = () => {
    if (meta.mime?.startsWith("image/")) return "🖼️";
    if (meta.mime?.startsWith("video/")) return "🎬";
    if (meta.mime === "application/pdf") return "📄";
    if (meta.mime === "application/zip") return "🗂️";
    return "📦";
  };

  return (
    <div className={styles.fullContainer}>
      <div className={styles.header}>
        <h1>{getIcon()} {meta.title || meta.originalName}</h1>
        <div className={styles.buttonGroup}>
          <a className={`${styles.button} ${styles.buttonSmall}`} href="/">Back</a>
          <a className={`${styles.button} ${styles.buttonSmall}`} href={`/api/download?id=${meta.id}`}>Download</a>
        </div>
      </div>

      <div className={styles.previewArea}>
        {/* IMAGE */}
        {meta.mime?.startsWith("image/") && (
          <img className={styles.fullPreview} src={previewUrl} alt={meta.originalName} />
        )}

        {/* VIDEO */}
        {meta.mime?.startsWith("video/") && (
          <video className={styles.fullPreview} controls src={previewUrl}></video>
        )}

        {/* PDF */}
        {meta.mime === "application/pdf" && (
          <iframe className={styles.fullPreview} src={previewUrl}></iframe>
        )}

        {/* ZIP */}
        {meta.mime === "application/zip" && (
          <div>
            <p className={styles.note}>ZIP Contents:</p>
            {zipEntries ? (
              <ul className={styles.zipList}>
                {zipEntries.map((e,i) => <li key={i}>{e}</li>)}
              </ul>
            ) : <p>Loading ZIP entries...</p>}
          </div>
        )}

        {/* OTHER FILE TYPES */}
        {!["application/pdf"].includes(meta.mime) &&
         !meta.mime?.startsWith("image/") &&
         !meta.mime?.startsWith("video/") &&
         meta.mime !== "application/zip" && (
          <div className={styles.note}>Cannot preview this file type. Please download to view.</div>
        )}
      </div>
    </div>
  );
}
