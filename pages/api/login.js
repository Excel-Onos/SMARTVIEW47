import { signToken } from "../../lib/auth";

export default function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method not allowed");
  const { role, password } = req.body || {};

  if (role === "admin") {
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "EEOIC201014SS1";
    if (!password || password !== ADMIN_PASSWORD) {
      return res.status(401).end("Invalid admin password");
    }
    const token = signToken({ role: "admin" }, { expiresIn: "6h" });
    res.setHeader("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=${6*3600}`);
    return res.status(200).json({ role: "admin" });
  }

  // user login (no password)
  const token = signToken({ role: "user" }, { expiresIn: "24h" });
  res.setHeader("Set-Cookie", `auth=${token}; HttpOnly; Path=/; Max-Age=${24*3600}`);
  return res.status(200).json({ role: "user" });
}