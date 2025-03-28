import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { serveDir } from "https://deno.land/std@0.208.0/http/file_server.ts";
import { WebSocketClient } from "./websocket/client.ts";

// 添加调试日志
console.log("Starting server...");
console.log("Environment variables:", Deno.env.toObject());

// 获取API密钥
const API_KEY = Deno.env.get("ZHIPU_API_KEY");
console.log("API_KEY status:", API_KEY ? "Found" : "Not found");

if (!API_KEY) {
  console.error("ZHIPU_API_KEY environment variable is required");
  throw new Error("ZHIPU_API_KEY environment variable is required");
}

// WebSocket连接管理
const wsConnections = new Map<string, WebSocketClient>();

// 连接数限制
const MAX_CONNECTIONS = 5;

async function handleWebSocket(ws: WebSocket) {
  if (wsConnections.size >= MAX_CONNECTIONS) {
    ws.close(1013, "Maximum connections reached");
    return;
  }

  const client = new WebSocketClient(ws, API_KEY);
  wsConnections.set(client.id, client);
  
  try {
    // 使用原生WebSocket事件监听
    ws.onmessage = async (event) => {
      if (typeof event.data === "string") {
        await client.handleMessage(JSON.parse(event.data));
      }
    };
    
    // 等待连接关闭
    await new Promise((resolve) => {
      ws.onclose = () => resolve(undefined);
    });
  } catch (err) {
    console.error(`WebSocket error:`, err);
  } finally {
    wsConnections.delete(client.id);
  }
}

// HTTP服务器
const port = parseInt(Deno.env.get("PORT") || "8000");
console.log(`Starting HTTP server on port ${port}...`);

serve(async (req) => {
  const url = new URL(req.url);
  const pathname = url.pathname;
  
  console.log(`[DEBUG] Received request:`, {
    method: req.method,
    pathname,
    headers: Object.fromEntries(req.headers.entries()),
  });
  
  // WebSocket升级请求处理
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    console.log("[DEBUG] Handling WebSocket upgrade request");
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  // 健康检查端点
  if (pathname === "/health") {
    console.log("[DEBUG] Handling health check request");
    return new Response(JSON.stringify({
      status: "ok",
      connections: wsConnections.size,
      apiKeySet: !!API_KEY,
    }), {
      headers: { 
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }

  // API KEY 认证端点
  if (pathname === "/api/auth") {
    console.log("[DEBUG] Handling auth request");
    if (!API_KEY) {
      return new Response(JSON.stringify({
        error: "API KEY not configured"
      }), {
        status: 500,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        }
      });
    }
    return new Response(JSON.stringify({
      apiKey: API_KEY
    }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      }
    });
  }

  // 处理根路径重定向
  if (pathname === "/") {
    console.log("[DEBUG] Redirecting root path to /app/");
    return Response.redirect(`${url.origin}/app/`, 301);
  }

  // 处理/app路径
  if (pathname === "/app" || pathname === "/app/") {
    console.log("[DEBUG] Serving app index.html");
    try {
      const indexHtml = await Deno.readFile("public/app/index.html");
      return new Response(indexHtml, {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
        },
      });
    } catch (e) {
      console.error("[ERROR] Failed to read index.html:", e);
      return new Response("Internal Server Error", { status: 500 });
    }
  }

  // 处理静态资源
  console.log("[DEBUG] Attempting to serve static file:", pathname);
  try {
    const response = await serveDir(req, {
      fsRoot: "public",
      urlRoot: "",
      showDirListing: false,
      enableCors: true,
      quiet: false,
    });
    
    if (response.status === 404) {
      console.log("[DEBUG] File not found:", pathname);
    } else {
      console.log("[DEBUG] Successfully served file:", pathname);
    }
    
    return response;
  } catch (e) {
    console.error("[ERROR] Failed to serve static file:", pathname, e);
    return new Response("Internal Server Error", { status: 500 });
  }
}, { port });

// 获取文件的Content-Type
function getContentType(filePath: string): string {
  const ext = filePath.split(".").pop()?.toLowerCase();
  const contentTypes: Record<string, string> = {
    "html": "text/html; charset=utf-8",
    "css": "text/css",
    "js": "application/javascript",
    "json": "application/json",
    "png": "image/png",
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "gif": "image/gif",
    "svg": "image/svg+xml",
    "ico": "image/x-icon",
    "woff": "font/woff",
    "woff2": "font/woff2",
    "ttf": "font/ttf",
  };
  return contentTypes[ext || ""] || "application/octet-stream";
} 