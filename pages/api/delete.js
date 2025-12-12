import path from "path";
import fs from "fs/promises";

/**
 * DELETE /api/delete?id=<fileId>
 * Deletes the file metadata from data/files.json and removes the actual file from /storage.
 */
export default async function handler(req, res) {
  if (req.method !== "DELETE" && req.method !== "POST") {
    return res.status(405).send("Method not allowed");
  }

  const fileId = req.query.id || (req.body && req.body.id);
  if (!fileId) return res.status(400).send("Missing id");

  try {
    const dataFile = path.join(process.cwd(), "data", "files.json");
    let raw = "[]";
    try {
      raw = await fs.readFile(dataFile, "utf8");
    } catch (err) {
      raw = "[]";
    }

    let list = [];
    try {
      list = JSON.parse(raw || "[]");
    } catch (err) {
      return res.status(500).send("Corrupt data/files.json");
    }

    const idx = list.findIndex((x) => String(x.id) === String(fileId));
    if (idx === -1) {
      return res.status(404).send("File not found");
    }

    const fileMeta = list[idx];

    const storageDir = path.join(process.cwd(), "storage");
    const candidateNames = [
      fileMeta.filename,
      fileMeta.storedName,
      fileMeta.storageName,
      fileMeta.name,
      fileMeta.fileName,
      fileMeta.path,
      fileMeta.id,
    ].filter(Boolean);

    for (const name of candidateNames) {
      const filePath = path.join(storageDir, name);
      try {
        await fs.unlink(filePath);
        break;
      } catch (err) {
        // ignore if file not found
      }
    }

    list.splice(idx, 1);
    await fs.writeFile(dataFile, JSON.stringify(list, null, 2), "utf8");

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).send("Delete failed");
  }
}
