// Document Structure Component
// Displays expandable tree view of agreement sections

import type { Section } from '@/lib/mock-data/agreements';

interface DocumentStructureProps {
  sections: Section[];
}

export default function DocumentStructure({
  sections,
}: DocumentStructureProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <h3>Document Outline</h3>
      <ul>
        {sections.map((section) => (
          <li key={section.id}>
            {section.type === 'heading'
              ? `${section.content} (H${section.level})`
              : section.content.substring(0, 50) + '...'}
          </li>
        ))}
      </ul>
    </div>
  );
}
