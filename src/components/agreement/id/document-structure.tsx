'use client';

import { ChevronRight, FileText, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface Section {
  id: string;
  title: string;
  children?: Section[];
}

interface DocumentStructureProps {
  structure?: Section[];
}

const defaultStructure: Section[] = [
  {
    id: '1',
    title: 'Introduction',
    children: [
      { id: '1.1', title: 'Purpose' },
      { id: '1.2', title: 'Effective Date' },
    ],
  },
  {
    id: '2',
    title: 'Definitions',
    children: [
      { id: '2.1', title: 'Key Terms' },
      { id: '2.2', title: 'Interpretations' },
    ],
  },
  {
    id: '3',
    title: 'Obligations',
    children: [
      { id: '3.1', title: 'Party A Obligations' },
      { id: '3.2', title: 'Party B Obligations' },
      { id: '3.3', title: 'Mutual Obligations' },
    ],
  },
  {
    id: '4',
    title: 'Payment Terms',
  },
  {
    id: '5',
    title: 'Termination',
    children: [
      { id: '5.1', title: 'Termination Conditions' },
      { id: '5.2', title: 'Notice Period' },
    ],
  },
  {
    id: '6',
    title: 'Signatures',
  },
];

export function DocumentStructure({ structure = [] }: DocumentStructureProps) {
  const displayStructure = structure.length > 0 ? structure : defaultStructure;
  const [expandedSections, setExpandedSections] = useState<string[]>([
    '1',
    '2',
    '3',
  ]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-2 text-2xl font-bold">Document Structure</h2>
        <p className="text-muted-foreground">
          Expandable tree view of all agreement sections
        </p>
      </div>

      <div className="space-y-2">
        {displayStructure.map((section) => (
          <div key={section.id}>
            <button
              onClick={() => section.children && toggleSection(section.id)}
              className={cn(
                'border-border bg-card hover:bg-card/80 flex w-full items-center gap-3 rounded-lg border-2 p-4 text-left transition-all',
                expandedSections.includes(section.id) && 'border-primary/50'
              )}
            >
              {section.children ? (
                expandedSections.includes(section.id) ? (
                  <ChevronDown className="text-primary h-5 w-5" />
                ) : (
                  <ChevronRight className="text-muted-foreground h-5 w-5" />
                )
              ) : (
                <FileText className="text-muted-foreground h-5 w-5" />
              )}
              <span className="font-semibold">{section.title}</span>
              <span className="text-muted-foreground ml-auto text-sm">
                {section.id}
              </span>
            </button>

            {section.children && expandedSections.includes(section.id) && (
              <div className="mt-2 ml-8 space-y-2">
                {section.children.map((child) => (
                  <div
                    key={child.id}
                    className="border-border bg-muted/30 flex items-center gap-3 rounded-lg border p-3"
                  >
                    <FileText className="text-muted-foreground h-4 w-4" />
                    <span className="text-sm">{child.title}</span>
                    <span className="text-muted-foreground ml-auto text-xs">
                      {child.id}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
