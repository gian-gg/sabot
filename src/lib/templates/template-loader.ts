'use client';

import { partnershipAgreementTemplate } from './partnership-agreement';
import { ndaTemplate } from './nda-template';

export interface Template {
  id: string;
  name: string;
  description: string;
  category: 'business' | 'confidentiality' | 'employment' | 'other';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  content: string;
  ideaBlocks: Array<{
    id: string;
    title: string;
    content: string;
    template?: string;
  }>;
}

/**
 * All available templates
 */
const TEMPLATES: Template[] = [partnershipAgreementTemplate, ndaTemplate];

/**
 * Get all available templates
 */
export function getAllTemplates(): Template[] {
  return TEMPLATES;
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): Template | undefined {
  return TEMPLATES.find((template) => template.id === id);
}

/**
 * Get templates by category
 */
export function getTemplatesByCategory(
  category: Template['category']
): Template[] {
  return TEMPLATES.filter((template) => template.category === category);
}

/**
 * Get templates by difficulty level
 */
export function getTemplatesByDifficulty(
  difficulty: Template['difficulty']
): Template[] {
  return TEMPLATES.filter((template) => template.difficulty === difficulty);
}

/**
 * Search templates by keyword
 */
export function searchTemplates(keyword: string): Template[] {
  const lowerKeyword = keyword.toLowerCase();
  return TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(lowerKeyword) ||
      template.description.toLowerCase().includes(lowerKeyword) ||
      template.category.toLowerCase().includes(lowerKeyword)
  );
}

/**
 * Get categorized templates
 */
export function getCategorizedTemplates(): Record<string, Template[]> {
  const categorized: Record<string, Template[]> = {};

  TEMPLATES.forEach((template) => {
    if (!categorized[template.category]) {
      categorized[template.category] = [];
    }
    categorized[template.category].push(template);
  });

  return categorized;
}

/**
 * Get featured templates (first N templates)
 */
export function getFeaturedTemplates(count: number = 3): Template[] {
  return TEMPLATES.slice(0, count);
}

/**
 * Template utilities
 */
export const TemplateUtils = {
  /**
   * Generate a blurb for template
   */
  generateBlurb(template: Template, maxLength: number = 100): string {
    const text = template.description;
    return text.length > maxLength ? text.slice(0, maxLength) + '...' : text;
  },

  /**
   * Get difficulty badge color
   */
  getDifficultyColor(difficulty: Template['difficulty']): string {
    switch (difficulty) {
      case 'beginner':
        return 'bg-green-100 text-green-800
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800
      case 'advanced':
        return 'bg-red-100 text-red-800
      default:
        return 'bg-gray-100 text-gray-800';
    }
  },

  /**
   * Get category label
   */
  getCategoryLabel(category: Template['category']): string {
    const labels: Record<Template['category'], string> = {
      business: '💼 Business',
      confidentiality: '🔒 Confidentiality',
      employment: '👥 Employment',
      other: '📄 Other',
    };
    return labels[category];
  },

  /**
   * Get category color
   */
  getCategoryColor(category: Template['category']): string {
    const colors: Record<Template['category'], string> = {
      business: 'bg-blue-100 text-blue-800
      confidentiality:
        'bg-purple-100 text-purple-800
      employment:
        'bg-indigo-100 text-indigo-800
      other: 'bg-gray-100 text-gray-800
    };
    return colors[category];
  },
};

/**
 * Blank template option
 */
export const BLANK_TEMPLATE: Template = {
  id: 'blank',
  name: 'Start from Scratch',
  description: 'Create your own agreement from a blank document',
  category: 'other',
  difficulty: 'advanced',
  estimatedTime: 'Variable',
  content: `
    <h1>[Your Agreement Title]</h1>
    <p>Begin typing your agreement content here...</p>
  `,
  ideaBlocks: [],
};
