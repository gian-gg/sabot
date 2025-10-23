'use client';

import type React from 'react';

import { useEffect, useRef, useState } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
}

interface TransactionCarouselProps {
  sections: Section[];
  currentSection: number;
  onSectionChange: (index: number) => void;
}

export function TransactionCarousel({
  sections,
  currentSection,
  onSectionChange,
}: TransactionCarouselProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  // Handle touch events for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (touchStart - touchEnd > 75) {
      // Swiped left
      if (currentSection < sections.length - 1) {
        onSectionChange(currentSection + 1);
      }
    }

    if (touchStart - touchEnd < -75) {
      // Swiped right
      if (currentSection > 0) {
        onSectionChange(currentSection - 1);
      }
    }
  };

  // Scroll to current section
  useEffect(() => {
    if (containerRef.current) {
      const container = containerRef.current;
      const sectionWidth = container.offsetWidth;
      container.scrollTo({
        left: sectionWidth * currentSection,
        behavior: 'smooth',
      });
    }
  }, [currentSection]);

  return (
    <div
      ref={containerRef}
      className="h-full overflow-x-hidden overflow-y-auto scroll-smooth"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      <div
        className="flex h-full"
        style={{ width: `${sections.length * 100}%` }}
      >
        {sections.map((section) => (
          <div
            key={section.id}
            className="h-full overflow-y-auto py-4"
            style={{ width: `${100 / sections.length}%` }}
          >
            <div className="mx-auto max-w-5xl">{section.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
