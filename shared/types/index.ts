// WebSocket消息类型
export type MessageType = 'AUDIO' | 'VIDEO' | 'SCREEN';

// WebSocket消息接口
export interface WSMessage {
  type: MessageType;
  data: any;
  sessionId?: string;
}

// 会话配置接口
export interface SessionConfig {
  type: MessageType;
  quality?: 'low' | 'medium' | 'high';
  language?: string;
}

// API响应接口
export interface APIResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 用户会话状态
export interface UserSession {
  id: string;
  type: MessageType;
  startTime: number;
  status: 'active' | 'ended';
} 