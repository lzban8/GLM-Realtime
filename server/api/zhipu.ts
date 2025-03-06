import { APIResponse, SessionConfig } from "../../shared/types/index.ts";

export class ZhipuAPI {
  private apiKey: string;
  private baseUrl = "https://open.bigmodel.cn/api/rtav";

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private async request<T>(
    endpoint: string,
    method: string = "GET",
    body?: unknown
  ): Promise<APIResponse<T>> {
    const headers = new Headers({
      "Authorization": `Bearer ${this.apiKey}`,
      "Content-Type": "application/json",
    });

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });

    return await response.json();
  }

  async getToken(): Promise<string> {
    const response = await this.request<{ token: string }>("/token");
    if (response.code !== 200) {
      throw new Error(`Failed to get token: ${response.message}`);
    }
    return response.data!.token;
  }

  async createSession(config: SessionConfig): Promise<string> {
    const response = await this.request<{ sessionId: string }>("/session", "POST", config);
    if (response.code !== 200) {
      throw new Error(`Failed to create session: ${response.message}`);
    }
    return response.data!.sessionId;
  }

  async endSession(sessionId: string): Promise<void> {
    const response = await this.request(`/session/${sessionId}`, "DELETE");
    if (response.code !== 200) {
      throw new Error(`Failed to end session: ${response.message}`);
    }
  }
} 