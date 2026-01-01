import type { SessionInfo } from '../../worker/types';
export interface DocumentResponse {
  success: boolean;
  data: {
    content: any;
    title: string;
    lastModified: number;
  };
}
class DocumentAPI {
  async getDocuments(): Promise<SessionInfo[]> {
    const res = await fetch('/api/documents');
    const json = await res.json();
    return json.data || [];
  }
  async getDocument(id: string): Promise<DocumentResponse> {
    const res = await fetch(`/api/documents/${id}`);
    return res.json();
  }
  async updateDocument(id: string, updates: { content?: any; title?: string }): Promise<void> {
    await fetch(`/api/documents/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
  }
  async createDocument(title?: string): Promise<{ id: string; title: string }> {
    const res = await fetch('/api/documents', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    const json = await res.json();
    return json.data;
  }
  async deleteDocument(id: string): Promise<void> {
    await fetch(`/api/documents/${id}`, { method: 'DELETE' });
  }
}
export const documentApi = new DocumentAPI();