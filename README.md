# GLM-Realtime

基于智谱AI的实时音视频交互服务，使用Deno Deploy部署。支持语音对话、视频通话和屏幕共享等多种交互方式。

## 功能特性

- 实时语音对话：支持连续对话，自动检测说话状态
- 视频通话：支持摄像头视频交互
- 屏幕共享：支持实时屏幕内容分享
- 多模态交互：支持文本、语音、视频多种形式
- 自动语音识别：实时转写语音内容
- 实时响应：基于WebSocket的低延迟通信
- 自动会话管理：智能维护对话上下文
- 安全认证：服务端API密钥管理

## 技术栈

### 前端
- Vue 3：用户界面框架
- Element Plus：UI组件库
- WebRTC：音视频采集和传输
- WebSocket：实时通信
- Vite：构建工具

### 后端
- Deno：运行时环境
- TypeScript：开发语言
- 智谱AI API：大语言模型服务
- WebSocket：实时通信服务

## 项目结构

```
├── frontend/               # 前端代码
│   ├── src/               # 源代码
│   │   ├── components/    # 通用组件
│   │   ├── views/        # 页面组件
│   │   ├── utils/        # 工具函数
│   │   └── constants/    # 常量定义
│   └── public/           # 静态资源
├── server/                # 后端代码
│   ├── api/              # API接口
│   ├── routes/           # 路由处理
│   └── websocket/        # WebSocket处理
└── shared/               # 共享代码
```

## 环境要求

- Node.js 16+ (前端开发)
- Deno 1.37+ (后端运行)
- 智谱AI API Key
- 现代浏览器（支持WebRTC）

## 本地开发

1. 克隆项目
```bash
git clone https://github.com/lzban8/GLM-Realtime.git
cd GLM-Realtime
```

2. 前端开发
```bash
cd frontend
npm install
npm run dev
```

3. 后端开发
```bash
# 设置API密钥
export ZHIPU_API_KEY=your_api_key

# 运行开发服务器
deno task dev
```

## 生产部署

### Deno Deploy 部署

1. Fork 本仓库
2. 在 [Deno Deploy](https://deno.com/deploy) 创建新项目
3. 关联 GitHub 仓库
4. 设置环境变量：
   - `ZHIPU_API_KEY`：智谱AI API密钥
5. 触发部署

### 手动构建

```bash
# 构建前端
cd frontend
npm run build

# 启动服务
deno task start
```

## WebSocket API

### 连接建立
```javascript
const ws = new WebSocket('wss://your-deploy-url.deno.dev/api/ws');
```

### 消息类型

```typescript
// 客户端消息
interface ClientMessage {
  type: 'AUDIO_APPEND' | 'VIDEO_APPEND' | 'COMMIT' | 'RESPONSE_CREATE';
  client_timestamp: number;
  audio?: string;        // base64音频数据
  video_frame?: string;  // base64视频帧数据
}

// 服务端消息
interface ServerMessage {
  type: 'SESSION_CREATED' | 'SPEECH_STARTED' | 'SPEECH_STOPPED' | 'RESPONSE_AUDIO';
  delta?: string;        // 音频数据或文本
  transcript?: string;   // 语音识别文本
  error?: {
    code: string;
    message: string;
  };
}
```

## HTTP API

### 健康检查
- GET `/health`
  - 返回：`{ status: 'ok', connections: number }`

### 认证
- GET `/api/auth`
  - 返回：`{ apiKey: string }`

## 浏览器支持

- Chrome 88+
- Firefox 86+
- Safari 14.1+
- Edge 88+

## 许可证

[MIT License](LICENSE)

## 贡献指南

欢迎提交 Issue 和 Pull Request 来帮助改进项目。

## 致谢

- [智谱AI](https://open.bigmodel.cn/) - 提供大语言模型服务
- [Deno](https://deno.land/) - 提供运行时环境
- [Deno Deploy](https://deno.com/deploy) - 提供部署平台
 
