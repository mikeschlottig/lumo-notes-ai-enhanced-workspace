import { create } from 'zustand';
import { documentApi } from '@/lib/api';
import type { SessionInfo } from '../../worker/types';
interface DocumentState {
  documents: SessionInfo[];
  currentDocument: { id: string; title: string; content: any } | null;
  isLoading: boolean;
  isAiPanelOpen: boolean;
  fetchDocuments: () => Promise<void>;
  setCurrentDocument: (id: string) => Promise<void>;
  createDocument: () => Promise<string>;
  updateCurrentDocument: (updates: { content?: any; title?: string }) => Promise<void>;
  toggleAiPanel: () => void;
  deleteDocument: (id: string) => Promise<void>;
}
export const useDocumentStore = create<DocumentState>((set, get) => ({
  documents: [],
  currentDocument: null,
  isLoading: false,
  isAiPanelOpen: false,
  fetchDocuments: async () => {
    const docs = await documentApi.getDocuments();
    set({ documents: docs });
  },
  setCurrentDocument: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await documentApi.getDocument(id);
      if (res.success) {
        set({ currentDocument: { id, title: res.data.title, content: res.data.content } });
      }
    } finally {
      set({ isLoading: false });
    }
  },
  createDocument: async () => {
    const doc = await documentApi.createDocument();
    await get().fetchDocuments();
    return doc.id;
  },
  updateCurrentDocument: async (updates) => {
    const current = get().currentDocument;
    if (!current) return;
    // Optimistic update
    set({
      currentDocument: {
        ...current,
        title: updates.title ?? current.title,
        content: updates.content ?? current.content
      }
    });
    await documentApi.updateDocument(current.id, updates);
    if (updates.title) await get().fetchDocuments();
  },
  toggleAiPanel: () => set(state => ({ isAiPanelOpen: !state.isAiPanelOpen })),
  deleteDocument: async (id: string) => {
    await documentApi.deleteDocument(id);
    const docs = get().documents.filter(d => d.id !== id);
    set({ documents: docs });
    if (get().currentDocument?.id === id) {
      set({ currentDocument: null });
    }
  }
}));