'use client';

import { use } from 'react';
import { EditorLayout } from '@/components/agreement/editor/editor-layout';

export default function ActiveEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  // Go directly to the editor
  // The questionnaire is now handled in the invitation acceptance flow
  return <EditorLayout documentId={id} initialIdeaBlocks={[]} />;
}
