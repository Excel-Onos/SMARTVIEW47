import { getFileById } from "../../lib/db";
import path from "path";
import fs from "fs";
import AdmZip from "adm-zip";

export default async function handler(req, res) {
  const id = req.query.id;
  if (!id) return res.status(400).end("Missing id");
  const meta = await getFileById(id);
  if (!meta) return res.status(404).end("Not found");
  if (meta.mime !== "application/zip") return res.status(400).end("Not a zip");

  const filePath = path.join(process.cwd(), "storage", meta.storageName);
  if (!fs.existsSync(filePath)) return res.status(404).end("Missing file");

  try {
    const zip = new AdmZip(filePath);
    const entries = zip.getEntries().map(e => e.entryName);
    return res.status(200).json({ entries });
  } catch (e) {
    console.error(e);
    return res.status(500).end("Error reading zip");
  }
}