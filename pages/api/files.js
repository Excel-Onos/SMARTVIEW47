import { getAllFiles, getFileById } from "../../lib/db";

export default async function handler(req, res) {
  const id = req.query.id;
  if (id) {
    const file = await getFileById(id);
    if (!file) return res.status(404).end("Not found");
    return res.status(200).json(file);
  }
  const files = await getAllFiles();
  // Return only public files
  const publicFiles = files.filter(f=>f.visibility === "public");
  res.status(200).json(publicFiles);
}