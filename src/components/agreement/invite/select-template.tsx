// Select Template Component
// Step 2 of invite flow: Choose agreement template

import type { AgreementTemplate } from '@/lib/mock-data/agreements';

interface SelectTemplateProps {
  templates: AgreementTemplate[];
  selectedTemplate: string | null;
  onSelect: (templateId: string) => void;
  onContinue: () => void;
}

export default function SelectTemplate({
  templates,
  selectedTemplate,
  onSelect,
  onContinue,
}: SelectTemplateProps) {
  // TODO: Replace with v0-generated component
  return (
    <div>
      <p>Select Template Component</p>
      <div>
        {templates.map((template) => (
          <div
            key={template.id}
            onClick={() => onSelect(template.id)}
            style={{
              border:
                selectedTemplate === template.id
                  ? '2px solid #1DB954'
                  : '1px solid gray',
            }}
          >
            <h3>{template.name}</h3>
            <p>{template.description}</p>
          </div>
        ))}
      </div>
      <button onClick={onContinue} disabled={!selectedTemplate}>
        Continue
      </button>
    </div>
  );
}
