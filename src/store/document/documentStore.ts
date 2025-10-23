import { create } from 'zustand';

interface IdeaBlock {
  id: string;
  title: string;
  content: string;
  template?: string;
}

interface DocumentState {
  // Document metadata
  documentId: string;
  title: string;
  content: string;
  ideaBlocks: IdeaBlock[];
  createdAt: string;
  updatedAt: string;

  // Actions
  setDocumentId: (id: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setIdeaBlocks: (blocks: IdeaBlock[]) => void;
  setDocument: (data: Partial<Omit<DocumentState, keyof Actions>>) => void;
  updateContent: (content: string) => void;
  clear: () => void;
}

interface Actions {
  setDocumentId: (id: string) => void;
  setTitle: (title: string) => void;
  setContent: (content: string) => void;
  setIdeaBlocks: (blocks: IdeaBlock[]) => void;
  setDocument: (data: Partial<Omit<DocumentState, keyof Actions>>) => void;
  updateContent: (content: string) => void;
  clear: () => void;
}

export const useDocumentStore = create<DocumentState>((set) => ({
  documentId: '',
  title: '',
  content: '',
  ideaBlocks: [],
  createdAt: '',
  updatedAt: '',

  setDocumentId: (id) => set({ documentId: id }),
  setTitle: (title) => set({ title }),
  setContent: (content) =>
    set({ content, updatedAt: new Date().toISOString() }),
  setIdeaBlocks: (blocks) => set({ ideaBlocks: blocks }),
  setDocument: (data) => set({ ...data, updatedAt: new Date().toISOString() }),
  updateContent: (content) =>
    set({ content, updatedAt: new Date().toISOString() }),
  clear: () =>
    set({
      documentId: '',
      title: '',
      content: '',
      ideaBlocks: [],
      createdAt: '',
      updatedAt: '',
    }),
}));

export const clearDocument = () => {
  useDocumentStore.setState({
    documentId: '',
    title: '',
    content: '',
    ideaBlocks: [],
    createdAt: '',
    updatedAt: '',
  });
};
