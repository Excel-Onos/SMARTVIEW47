import fs from "fs";
import path from "path";
import { promisify } from "util";
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);

const DATA_DIR = path.join(process.cwd(), "data");
const FILES_PATH = path.join(DATA_DIR, "files.json");

async function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(FILES_PATH)) {
    await writeFile(FILES_PATH, JSON.stringify([] , null, 2));
  }
}

export async function getAllFiles() {
  await ensureData();
  const raw = await readFile(FILES_PATH, "utf8");
  return JSON.parse(raw);
}

export async function getFileById(id) {
  const files = await getAllFiles();
  return files.find((f) => f.id === id) || null;
}

export async function addFile(meta) {
  const files = await getAllFiles();
  files.unshift(meta); // newest first
  await writeFile(FILES_PATH, JSON.stringify(files, null, 2));
  return meta;
}