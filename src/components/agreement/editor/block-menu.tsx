// Block Menu Component
// Menu for selecting block types (heading, paragraph, list, etc.)

interface BlockMenuProps {
  onSelectBlockType: (blockType: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function BlockMenu({
  onSelectBlockType,
  isOpen,
  onClose,
}: BlockMenuProps) {
  // TODO: Replace with v0-generated component
  if (!isOpen) return null;

  const blockTypes = [
    { type: 'heading1', label: 'Heading 1', icon: 'H1' },
    { type: 'heading2', label: 'Heading 2', icon: 'H2' },
    { type: 'heading3', label: 'Heading 3', icon: 'H3' },
    { type: 'paragraph', label: 'Paragraph', icon: 'P' },
    { type: 'list', label: 'Bullet List', icon: '•' },
    { type: 'numbered', label: 'Numbered List', icon: '1.' },
    { type: 'quote', label: 'Quote', icon: '"' },
    { type: 'divider', label: 'Divider', icon: '—' },
  ];

  return (
    <div
      style={{
        border: '1px solid #282828',
        backgroundColor: '#181818',
        padding: '8px',
        borderRadius: '8px',
      }}
    >
      <p>Select Block Type:</p>
      {blockTypes.map((block) => (
        <button
          key={block.type}
          onClick={() => {
            onSelectBlockType(block.type);
            onClose();
          }}
          style={{ display: 'block', margin: '4px 0' }}
        >
          {block.icon} {block.label}
        </button>
      ))}
    </div>
  );
}
