'use client';

import { useEffect } from 'react';
import { useDocumentStore } from '@/store/document/documentStore';

interface HydrateDocumentProps {
  documentId?: string;
  title?: string;
  content?: string;
  ideaBlocks?: Array<{
    id: string;
    title: string;
    content: string;
    template?: string;
  }>;
}

export function HydrateDocument({
  documentId,
  title,
  content,
  ideaBlocks,
}: HydrateDocumentProps) {
  const { setDocumentId, setTitle, setContent, setIdeaBlocks } =
    useDocumentStore();

  useEffect(() => {
    if (documentId) {
      setDocumentId(documentId);
    }
    if (title) {
      setTitle(title);
    }
    if (content) {
      setContent(content);
    }
    if (ideaBlocks) {
      setIdeaBlocks(ideaBlocks);
    }
  }, [
    documentId,
    title,
    content,
    ideaBlocks,
    setDocumentId,
    setTitle,
    setContent,
    setIdeaBlocks,
  ]);

  return null; // nothing visible, just hydrates the store
}
