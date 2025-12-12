import formidable from "formidable";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { verifyToken } from "../../lib/auth";
import { addFile } from "../../lib/db";
import mime from "mime-types";

export const config = {
  api: {
    bodyParser: false,
  },
};

const STORAGE_DIR = path.join(process.cwd(), "storage");
if (!fs.existsSync(STORAGE_DIR)) fs.mkdirSync(STORAGE_DIR, { recursive: true });

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");

  // Check admin auth
  const token = req.cookies?.auth || "";
  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return res.status(403).end("Admin only");
  }

  const form = formidable({ multiples: false, keepExtensions: true });

  form.parse(req, async (err, fields, files) => {
    if (err) {
      console.error(err);
      return res.status(500).end("Upload error");
    }
    const file = files.file;
    if (!file) return res.status(400).end("No file provided");

    const id = uuidv4();
    const originalName = file.originalFilename || file.newFilename || "upload";
    const ext = path.extname(originalName);
    const storageName = `${id}${ext}`;
    const dest = path.join(STORAGE_DIR, storageName);

    try {
      await fs.promises.rename(file.filepath, dest);
    } catch (e) {
      // some environments, use copy
      await fs.promises.copyFile(file.filepath, dest);
      await fs.promises.unlink(file.filepath).catch(()=>{});
    }

    const stat = await fs.promises.stat(dest);
    const mimeType = mime.lookup(dest) || "application/octet-stream";

    const meta = {
      id,
      originalName,
      storageName,
      size: stat.size,
      mime: mimeType,
      visibility: fields.visibility || "public",
      title: fields.title || "",
      description: fields.description || "",
      createdAt: new Date().toISOString()
    };

    await addFile(meta);
    return res.status(200).json({ ok: true, meta });
  });
}