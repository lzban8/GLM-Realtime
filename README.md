# GLM-Realtime

基于智谱AI的实时音视频交互服务，使用Deno Deploy部署。

## 功能特性

- 语音对话交互
- 语音视频交互
- 语音屏幕交互
- 支持最多5个并发用户
- 实时WebSocket通信
- 自动会话管理

## 技术栈

- 后端：Deno + TypeScript
- WebSocket：实时通信
- 智谱AI API：音视频处理

## 环境要求

- Deno 1.37 或更高版本
- 智谱AI API Key

## 快速开始

1. 克隆项目
```bash
git clone https://github.com/yourusername/GLM-Realtime.git
cd GLM-Realtime
```

2. 设置环境变量
```bash
export ZHIPU_API_KEY=your_api_key
```

3. 运行开发服务器
```bash
deno task dev
```

4. 生产环境运行
```bash
deno task start
```

## Deno Deploy 部署

1. Fork 本仓库到你的GitHub账号
2. 在Deno Deploy中创建新项目
3. 选择从GitHub导入
4. 选择fork的仓库和分支
5. 设置环境变量 ZHIPU_API_KEY
6. 完成部署

## API文档

### WebSocket 接口

连接WebSocket：
```javascript
const ws = new WebSocket('wss://your-deploy-url.deno.dev');
```

消息格式：
```typescript
interface Message {
  type: 'AUDIO' | 'VIDEO' | 'SCREEN';
  data: any;
  sessionId?: string;
}
```

### HTTP 接口

- GET /health - 健康检查
  - 返回服务器状态和当前连接数

## 许可证

MIT License
 
