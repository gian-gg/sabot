// Collaborative Editor Component
// Main block-based editor for real-time collaborative editing

import type { Section, Party } from '@/lib/mock-data/agreements';

interface CollaborativeEditorProps {
  blocks: Section[];
  parties: Party[];
  onBlockChange?: (blockId: string, content: string) => void;
  onBlockAdd?: (afterBlockId: string, type: string) => void;
  onBlockDelete?: (blockId: string) => void;
  onBlockReorder?: (blockId: string, newOrder: number) => void;
}

export default function CollaborativeEditor({
  blocks,
  parties,
  onBlockChange,
  onBlockAdd,
  onBlockDelete,
  onBlockReorder,
}: CollaborativeEditorProps) {
  // TODO: Replace with v0-generated component
  // This will eventually use BlockNote or similar block-based editor
  return (
    <div>
      <h3>Collaborative Editor</h3>
      <p>Active Users:</p>
      {parties.map((party) => (
        <span key={party.id}>
          {party.name} {party.isOnline ? '(Online)' : '(Offline)'}
        </span>
      ))}
      <div>
        {blocks.map((block) => (
          <div key={block.id} style={{ margin: '10px 0' }}>
            <span style={{ marginRight: '10px' }}>⋮⋮</span>
            {block.type === 'heading' ? (
              <h3>{block.content}</h3>
            ) : (
              <p>{block.content}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
