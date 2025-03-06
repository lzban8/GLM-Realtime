import { serve } from "https://deno.land/std@0.208.0/http/server.ts";
import { WebSocketClient } from "./websocket/client.ts";

// @ts-ignore: Deno types
const API_KEY = Deno.env.get("ZHIPU_API_KEY");
if (!API_KEY) {
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
serve(async (req) => {
  const url = new URL(req.url);
  
  // WebSocket升级请求处理
  if (req.headers.get("upgrade")?.toLowerCase() === "websocket") {
    // @ts-ignore: Deno types
    const { socket, response } = Deno.upgradeWebSocket(req);
    handleWebSocket(socket);
    return response;
  }

  // 健康检查端点
  if (url.pathname === "/health") {
    return new Response(JSON.stringify({
      status: "ok",
      connections: wsConnections.size,
    }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  // 默认响应
  return new Response("GLM-Realtime Server", {
    headers: { "Content-Type": "text/plain" },
  });
}, { port: 8000 }); 