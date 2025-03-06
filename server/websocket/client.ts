import { MessageType, WSMessage, UserSession } from "../../shared/types/index.ts";
import { ZhipuAPI } from "../api/zhipu.ts";

export class WebSocketClient {
  public id: string;
  private ws: WebSocket;
  private api: ZhipuAPI;
  private session: UserSession | null = null;

  constructor(ws: WebSocket, apiKey: string) {
    this.ws = ws;
    this.id = crypto.randomUUID();
    this.api = new ZhipuAPI(apiKey);

    // 设置WebSocket事件处理
    this.ws.onclose = () => this.handleClose();
    this.ws.onerror = (error) => this.handleError(error);
  }

  private async handleClose() {
    if (this.session) {
      await this.api.endSession(this.session.id);
      this.session = null;
    }
  }

  private handleError(error: Event) {
    console.error(`WebSocket error for client ${this.id}:`, error);
  }

  private send(message: WSMessage) {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }

  async handleMessage(message: WSMessage) {
    try {
      switch (message.type) {
        case 'AUDIO':
          await this.handleAudioMessage(message);
          break;
        case 'VIDEO':
          await this.handleVideoMessage(message);
          break;
        case 'SCREEN':
          await this.handleScreenMessage(message);
          break;
        default:
          throw new Error(`Unknown message type: ${message.type}`);
      }
    } catch (error) {
      console.error(`Error handling message:`, error);
      this.send({
        type: message.type,
        data: { error: error.message },
      });
    }
  }

  private async handleAudioMessage(message: WSMessage) {
    // 实现音频消息处理逻辑
    console.log('Processing audio message:', message);
  }

  private async handleVideoMessage(message: WSMessage) {
    // 实现视频消息处理逻辑
    console.log('Processing video message:', message);
  }

  private async handleScreenMessage(message: WSMessage) {
    // 实现屏幕共享消息处理逻辑
    console.log('Processing screen message:', message);
  }

  async createSession(type: MessageType) {
    const sessionId = await this.api.createSession({ type });
    this.session = {
      id: sessionId,
      type,
      startTime: Date.now(),
      status: 'active',
    };
    return sessionId;
  }
} 