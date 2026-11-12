// Serveur local : `ANTHROPIC_API_KEY=... npm run dev` puis http://localhost:3000/
import http from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import chat from "./api/chat.js";
import memo from "./api/memo.js";

const ROOT = process.cwd();
const TYPES = {
  ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css",
  ".json": "application/json", ".webmanifest": "application/manifest+json",
  ".png": "image/png", ".svg": "image/svg+xml",
};

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://localhost");
  const route = { "/api/chat": chat, "/api/memo": memo }[url.pathname];
  if (route) {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    req.body = raw;
    return route(req, res);
  }
  let path = normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, "");
  if (path.endsWith("/")) path += "index.html";
  if (path.startsWith("/api") || path.includes("node_modules")) { res.statusCode = 404; return res.end(); }
  try {
    const data = await readFile(join(ROOT, path));
    res.setHeader("Content-Type", TYPES[extname(path)] || "application/octet-stream");
    res.end(data);
  } catch {
    res.statusCode = 404;
    res.end("Introuvable");
  }
}).listen(process.env.PORT || 3000, () => console.log(`Nuage : http://localhost:${process.env.PORT || 3000}/`));
