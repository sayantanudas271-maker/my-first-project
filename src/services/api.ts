import {
  User,
  WorkflowTask,
  InventoryItem,
  Vendor,
  AuditLog,
  AnalyticsResponse,
  WorkflowPriority,
} from '../types.ts';

const TOKEN_KEY = 'autoops_token';

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = tokenStorage.get();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errorMsg = data.error || `HTTP ${response.status}: Request failed`;
    throw new Error(errorMsg);
  }

  return data as T;
}

export const api = {
  auth: {
    login: (email: string, password: string) =>
      request<{ token: string; user: User }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      }),

    register: (name: string, email: string, password: string, role: string) =>
      request<{ token: string; user: User }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      }),

    me: () => request<{ user: User }>('/api/auth/me'),
  },

  workflows: {
    getAll: () => request<{ workflows: WorkflowTask[] }>('/api/workflows'),

    getById: (id: string) => request<{ workflow: WorkflowTask }>(`/api/workflows/${id}`),

    create: (payload: {
      title: string;
      description: string;
      priority: WorkflowPriority;
      targetSku?: string;
      autoExecute?: boolean;
    }) =>
      request<{ workflow: WorkflowTask }>('/api/workflows', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),

    executeStep: (workflowId: string, stepId: number) =>
      request<{ workflow: WorkflowTask }>(`/api/workflows/${workflowId}/execute-step`, {
        method: 'POST',
        body: JSON.stringify({ stepId }),
      }),

    run: (workflowId: string) =>
      request<{ workflow: WorkflowTask }>(`/api/workflows/${workflowId}/run`, {
        method: 'POST',
      }),

    approve: (workflowId: string, notes?: string, decision: 'APPROVE' | 'REJECT' = 'APPROVE') =>
      request<{ workflow: WorkflowTask }>(`/api/workflows/${workflowId}/approve`, {
        method: 'POST',
        body: JSON.stringify({ notes, decision }),
      }),

    delete: (workflowId: string) =>
      request<{ success: boolean; id: string }>(`/api/workflows/${workflowId}`, {
        method: 'DELETE',
      }),
  },

  inventory: {
    getAll: () => request<{ inventory: InventoryItem[] }>('/api/inventory'),
    getVendors: () => request<{ vendors: Vendor[] }>('/api/inventory/vendors'),
    updateStock: (sku: string, stockAdjustment: number, reason?: string) =>
      request<{ item: InventoryItem }>('/api/inventory/update-stock', {
        method: 'POST',
        body: JSON.stringify({ sku, stockAdjustment, reason }),
      }),
  },

  audit: {
    getLogs: () => request<{ logs: AuditLog[] }>('/api/audit/logs'),
    getAnalytics: () => request<AnalyticsResponse>('/api/audit/analytics'),
  },

  copilot: {
    chat: (
      messages: Array<{ role: 'user' | 'model'; content: string }>,
      persona: 'FAST_DISPATCHER' | 'OPERATIONS_STRATEGIST' | 'COMPLEX_ARCHITECT'
    ) =>
      request<{ reply: string; modelUsed: string }>('/api/copilot/chat', {
        method: 'POST',
        body: JSON.stringify({ messages, persona }),
      }),

    searchMarket: (query: string) =>
      request<{
        summary: string;
        groundingSources: Array<{ title: string; url: string }>;
        searchQueries: string[];
      }>('/api/copilot/market-intelligence', {
        method: 'POST',
        body: JSON.stringify({ query }),
      }),

    searchMaps: (query: string, latitude?: number, longitude?: number) =>
      request<{
        summary: string;
        places: Array<{ title: string; uri: string; address?: string }>;
      }>('/api/copilot/maps-grounding', {
        method: 'POST',
        body: JSON.stringify({ query, latitude, longitude }),
      }),

    transcribeAudio: (audioData: string, mimeType?: string) =>
      request<{ transcript: string }>('/api/copilot/transcribe-audio', {
        method: 'POST',
        body: JSON.stringify({ audioData, mimeType }),
      }),
  },

  media: {
    generateImage: (prompt: string, aspectRatio: string = '1:1') =>
      request<{ imageUrl: string }>('/api/media/generate-image', {
        method: 'POST',
        body: JSON.stringify({ prompt, aspectRatio }),
      }),

    editImage: (prompt: string, inputImage: string, mimeType: string = 'image/png', aspectRatio: string = '1:1') =>
      request<{ imageUrl: string }>('/api/media/edit-image', {
        method: 'POST',
        body: JSON.stringify({ prompt, inputImage, mimeType, aspectRatio }),
      }),

    animateVideo: (
      image: string,
      mimeType: string = 'image/png',
      motionPrompt?: string,
      aspectRatio: '16:9' | '9:16' = '16:9'
    ) =>
      request<{ videoUrl: string; duration: string; mimeType: string }>('/api/media/animate-video', {
        method: 'POST',
        body: JSON.stringify({ image, mimeType, motionPrompt, aspectRatio }),
      }),
  },
};
