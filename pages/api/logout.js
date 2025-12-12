export default function handler(req, res) {
  res.setHeader("Set-Cookie", `auth=deleted; HttpOnly; Path=/; Max-Age=0`);
  res.writeHead(302, { Location: "/" });
  res.end();
}