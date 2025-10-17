'use client';

import { useState } from 'react';
import { EditorLayout } from '@/components/agreement/editor/editor-layout';
import { ProjectQuestionnaire } from '@/components/agreement/editor/project-questionnaire';

export default function ActiveEditorPage({
  params,
}: {
  params: { id: string };
}) {
  const [hasCompletedQuestionnaire, setHasCompletedQuestionnaire] =
    useState(false);
  const [ideaBlocks, setIdeaBlocks] = useState<
    Array<{ id: string; title: string; content: string }>
  >([]);

  if (!hasCompletedQuestionnaire) {
    return (
      <ProjectQuestionnaire
        documentId={params.id}
        onComplete={(blocks) => {
          setIdeaBlocks(blocks);
          setHasCompletedQuestionnaire(true);
        }}
      />
    );
  }

  return <EditorLayout documentId={params.id} initialIdeaBlocks={ideaBlocks} />;
}
