import path from "path";
import fs from "fs";
import { getFileById } from "../../lib/db";
import { verifyToken } from "../../lib/auth";

export default async function handler(req, res) {
  const id = req.query.id;
  const inline = req.query.inline === "1" || req.query.inline === "true";
  if (!id) return res.status(400).end("Missing id");
  const meta = await getFileById(id);
  if (!meta) return res.status(404).end("Not found");

  // If private, require admin or user who uploaded (MVP: only admin and public supported)
  if (meta.visibility === "private") {
    const token = req.cookies?.auth || "";
    const payload = verifyToken(token);
    if (!payload || (payload.role !== "admin" && payload.role !== "user")) {
      return res.status(403).end("Private file");
    }
  }

  const filePath = path.join(process.cwd(), "storage", meta.storageName);
  if (!fs.existsSync(filePath)) return res.status(404).end("File missing");

  const stat = await fs.promises.stat(filePath);
  res.setHeader("Content-Length", stat.size);
  res.setHeader("Content-Type", meta.mime || "application/octet-stream");

  const disposition = inline ? "inline" : "attachment";
  res.setHeader("Content-Disposition", `${disposition}; filename="${encodeURIComponent(meta.originalName)}"`);
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
}