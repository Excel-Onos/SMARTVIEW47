import Link from "next/link";
import { useEffect, useState } from "react";
import { verifyToken } from "../lib/auth"; // used only in getServerSideProps

export default function Home({ initialFiles = [] }) {
  const [files, setFiles] = useState(initialFiles);
  const [loading, setLoading] = useState(false);

  // client-side refresh of list (optional)
  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch("/api/files", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setFiles(data || []);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="container">
      <div className="header">
        <h1>File Share</h1>
        <div>
          <Link href="/login" className="button small">Login</Link>
          {/* Admin Centre removed per request */}
        </div>
      </div>

      <p className="note">Files available to logged-in users only.</p>

      {loading && <p>Loading files…</p>}
      {!loading && files.length === 0 && <p>No files yet.</p>}

      {files.map((f) => (
        <div key={f.id} className="file">
          <strong>{f.title || f.originalName}</strong>
          <div className="note">Uploaded: {f.createdAt ? new Date(f.createdAt).toLocaleString() : "unknown"}</div>
          <div style={{ marginTop: 8 }}>
            <a className="button small" href={`/preview?id=${f.id}`} style={{ marginRight: 8 }}>Open / Preview</a>
            <a className="button small" href={`/api/download?id=${f.id}`} style={{ background: '#10b981' }}>Download</a>
          </div>
          {f.description && <div style={{ marginTop: 10, color: '#374151' }}>{f.description}</div>}
        </div>
      ))}
    </div>
  );
}

/**
 * Server-side auth guard:
 * If there's no valid token cookie or token is invalid, redirect to /login.
 * If valid, we optionally load the files and pass them as initialFiles to the page.
 */
export async function getServerSideProps(context) {
  const { req } = context;
  const cookieHeader = req.headers.cookie || "";
  const m = cookieHeader.match(/(?:^|; )token=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : null;

  if (!token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  const user = token ? verifyToken(token) : null;
  if (!user) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  // optionally load initial files server-side so page renders immediately
  let initialFiles = [];
  try {
    const fs = require("fs");
    const path = require("path");
    const dataPath = path.join(process.cwd(), "data", "files.json");
    if (fs.existsSync(dataPath)) {
      initialFiles = JSON.parse(fs.readFileSync(dataPath, "utf8") || "[]");
    }
  } catch (err) {
    initialFiles = [];
  }

  return {
    props: {
      initialFiles,
    },
  };
}