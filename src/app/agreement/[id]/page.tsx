'use client';

import { useState, use } from 'react';
import Link from 'next/link';
import { ROUTES } from '@/constants/routes';
import { getAgreementById } from '@/lib/mock-data/agreements';
import PartiesInfo from '@/components/agreement/id/parties-info';
import DocumentStructure from '@/components/agreement/id/document-structure';
import AISuggestions from '@/components/agreement/id/ai-suggestions';
import AgreementDetails from '@/components/agreement/id/agreement-details';
// TODO: Import carousel components when ready
// TODO: Import Button, Card components from shadcn/ui

export default function AgreementPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [currentSection, setCurrentSection] = useState(0);

  const agreement = getAgreementById(id);

  if (!agreement) {
    return (
      <div className="flex min-h-screen w-full flex-col pt-14">
        <div className="flex flex-1 items-center justify-center p-8">
          <div>
            <p>Agreement not found</p>
            <Link href={ROUTES.HOME.ROOT}>Go Home</Link>
          </div>
        </div>
      </div>
    );
  }

  // Define sections for carousel
  const sections = [
    {
      id: 'parties',
      title: 'Parties',
      content: <PartiesInfo parties={agreement.parties} />,
    },
    {
      id: 'structure',
      title: 'Document Structure',
      content: <DocumentStructure sections={agreement.sections} />,
    },
    {
      id: 'suggestions',
      title: 'AI Suggestions',
      content: (
        <AISuggestions
          suggestions={agreement.aiSuggestions}
          onApply={(id) => console.log('Apply suggestion:', id)}
          onDismiss={(id) => console.log('Dismiss suggestion:', id)}
        />
      ),
    },
    {
      id: 'details',
      title: 'Agreement Details',
      content: <AgreementDetails agreement={agreement} />,
    },
  ];

  return (
    <div className="flex min-h-screen w-full flex-col overflow-hidden pt-14">
      {/* TODO: Replace with v0-generated carousel UI */}
      <div className="mx-auto max-w-3xl">
        <div>
          Progress: {currentSection + 1} / {sections.length}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {/* Carousel content */}
        <div className="p-8">
          <h2>{sections[currentSection].title}</h2>
          {sections[currentSection].content}
        </div>
      </div>

      {/* Bottom navigation */}
      <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <button
            onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
            disabled={currentSection === 0}
          >
            Previous
          </button>
          <div>
            {currentSection + 1} / {sections.length}
          </div>
          <button
            onClick={() =>
              setCurrentSection(
                Math.min(sections.length - 1, currentSection + 1)
              )
            }
            disabled={currentSection === sections.length - 1}
          >
            Next
          </button>
        </div>
      </div>

      {/* Enter Editor Button */}
      <div className="border-t border-neutral-800 bg-neutral-950 px-4 py-3">
        <div className="mx-auto max-w-3xl">
          <Link href={ROUTES.AGREEMENT.ACTIVE(id)}>
            <button className="w-full">Enter Collaborative Editor</button>
          </Link>
        </div>
      </div>
    </div>
  );
}
