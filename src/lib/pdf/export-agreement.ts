'use client';

import jsPDF from 'jspdf';
import 'jspdf-autotable';

export interface PDFExportOptions {
  title?: string;
  fileName?: string;
  includePageNumbers?: boolean;
  includeTimestamp?: boolean;
  documentId?: string;
  signatureImage?: string;
}

/**
 * Export agreement document to PDF
 * Handles all legal block types with proper styling
 */
export async function exportAgreementToPDF(
  htmlContent: string,
  options: PDFExportOptions = {}
) {
  const {
    title = 'Agreement',
    fileName = 'agreement.pdf',
    includePageNumbers = true,
    includeTimestamp = true,
    documentId,
    signatureImage,
  } = options;

  try {
    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Configuration
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 15; // 15mm margins
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // Set default font
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(11);

    // Add header with title
    if (title) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(16);
      const titleWidth =
        (pdf.getStringUnitWidth(title) * pdf.getFontSize()) /
        pdf.internal.scaleFactor;
      const titleX = (pageWidth - titleWidth) / 2;
      pdf.text(title, titleX, currentY);
      currentY += 15;

      // Add subtitle with date/time
      if (includeTimestamp) {
        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(9);
        const timestamp = new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        const timestampText = `Generated: ${timestamp}`;
        const timestampWidth =
          (pdf.getStringUnitWidth(timestampText) * pdf.getFontSize()) /
          pdf.internal.scaleFactor;
        const timestampX = (pageWidth - timestampWidth) / 2;
        pdf.text(timestampText, timestampX, currentY);
        currentY += 10;
      }

      // Add separator line
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, currentY, pageWidth - margin, currentY);
      currentY += 10;

      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(11);
    }

    // Parse HTML and convert to PDF content
    const contentLines = parseHTMLToPDFContent(
      htmlContent,
      pdf,
      contentWidth,
      signatureImage
    );

    // Add content to PDF
    for (const line of contentLines) {
      // Check if we need a new page
      const lineHeight = line.height || 10; // Default height if not specified
      if (currentY + lineHeight > pageHeight - margin) {
        // Add footer before page break
        if (includePageNumbers) {
          addPageFooter(pdf, pageWidth, pageHeight, margin);
        }

        pdf.addPage();
        currentY = margin;
      }

      // Add the content line
      if (line.type === 'text') {
        pdf.setFont(line.font || 'Helvetica', line.fontStyle || 'normal');
        pdf.setFontSize(line.fontSize || 11);
        if (line.color) {
          const rgb = hexToRgb(line.color);
          pdf.setTextColor(rgb.r, rgb.g, rgb.b);
        } else {
          pdf.setTextColor(0, 0, 0);
        }

        const splitText = pdf.splitTextToSize(
          line.text || '',
          contentWidth - (line.indent || 0)
        );
        pdf.text(splitText, margin + (line.indent || 0), currentY);
        currentY += line.height ?? 0;
      } else if (line.type === 'signature-block') {
        addSignatureBlock(
          pdf,
          margin,
          currentY,
          contentWidth,
          line.signatureImage
        );
        currentY += line.height ?? 0;
      } else if (line.type === 'box') {
        addBoxBlock(pdf, margin, currentY, contentWidth, line);
        currentY += line.height ?? 0;
      } else if (line.type === 'spacing') {
        currentY += line.height ?? 0;
      }
    }

    // Add footer to last page
    if (includePageNumbers) {
      addPageFooter(pdf, pageWidth, pageHeight, margin);
    }

    // Add document ID if provided
    if (documentId) {
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text(`Document ID: ${documentId}`, margin, pageHeight - 5);
    }

    // Save the PDF
    pdf.save(fileName);

    return { success: true, fileName };
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error(
      error instanceof Error ? error.message : 'Failed to export PDF'
    );
  }
}

interface PDFLine {
  text?: string;
  fontSize?: number;
  fontStyle?: string;
  align?: string;
  x?: number;
  y?: number;
  type?: string;
  bgColor?: string;
  borderColor?: string;
  indent?: number;
  height?: number;
  font?: string;
  title?: string;
  content?: string;
  color?: string;
  signatureImage?: string;
}

/**
 * Parse HTML content and convert to PDF-friendly format
 */
function parseHTMLToPDFContent(
  htmlContent: string,
  pdf: jsPDF,
  contentWidth: number,
  signatureImage?: string
): PDFLine[] {
  const lines: PDFLine[] = [];

  // Create temporary container to parse HTML
  const container = document.createElement('div');
  container.innerHTML = htmlContent;

  // Process each element
  Array.from(container.children).forEach((element) => {
    const lines_from_element = parseElement(
      element as HTMLElement,
      pdf,
      contentWidth,
      signatureImage
    );
    lines.push(...lines_from_element);
  });

  return lines;
}

/**
 * Parse individual HTML elements
 */
function parseElement(
  element: HTMLElement,
  _pdf: jsPDF,
  _contentWidth: number,
  signatureImage?: string
): PDFLine[] {
  const lines: PDFLine[] = [];
  const tagName = element.tagName.toLowerCase();
  const dataType = element.getAttribute('data-type');

  // Handle legal block types
  if (dataType === 'signature') {
    // Look for signature image within the signature block
    const signatureImg = element.querySelector(
      '.signature-image'
    ) as HTMLImageElement;
    const actualSignatureImage = signatureImg?.src || signatureImage;

    lines.push({
      type: 'signature-block',
      height: actualSignatureImage ? 50 : 35, // Reduced height since no label
      text: '',
      signatureImage: actualSignatureImage,
    } as PDFLine);
    lines.push({ type: 'spacing', height: 10, text: '' });
    return lines;
  }

  if (dataType === 'party') {
    lines.push({
      type: 'box',
      title: getTextContent(element.querySelector('h3')),
      content: parseBoxContent(element),
      bgColor: '#f0f9ff', // Light blue background
      borderColor: '#01d06c', // Primary green
      height: 60,
      text: '',
    });
    lines.push({ type: 'spacing', height: 10, text: '' });
    return lines;
  }

  if (dataType === 'clause') {
    const title = getTextContent(element.querySelector('h4'));
    const content = getTextContent(element.querySelector('p'));
    lines.push({
      type: 'text',
      text: title,
      fontSize: 12,
      fontStyle: 'bold',
      indent: 0,
      height: 8,
    });
    lines.push({
      type: 'text',
      text: content,
      fontSize: 11,
      fontStyle: 'normal',
      indent: 5,
      height: 12,
    });
    lines.push({ type: 'spacing', height: 8, text: '' });
    return lines;
  }

  if (dataType === 'whereas') {
    const text = getTextContent(element);
    lines.push({
      type: 'text',
      text: text,
      fontSize: 11,
      fontStyle: 'italic',
      indent: 10,
      height: 10,
      color: '#666666',
    });
    lines.push({ type: 'spacing', height: 6, text: '' });
    return lines;
  }

  if (dataType === 'terms') {
    lines.push({
      type: 'text',
      text: getTextContent(element.querySelector('h2')),
      fontSize: 14,
      fontStyle: 'bold',
      height: 10,
    });

    const listItems = element.querySelectorAll('li');
    listItems.forEach((item) => {
      lines.push({
        type: 'text',
        text: getTextContent(item),
        fontSize: 11,
        indent: 5,
        height: 10,
      });
    });

    lines.push({ type: 'spacing', height: 8, text: '' });
    return lines;
  }

  // Handle standard elements
  switch (tagName) {
    case 'h1':
      lines.push({
        type: 'text',
        text: getTextContent(element),
        fontSize: 18,
        fontStyle: 'bold',
        height: 12,
      });
      lines.push({ type: 'spacing', height: 5, text: '' });
      break;

    case 'h2':
      lines.push({
        type: 'text',
        text: getTextContent(element),
        fontSize: 14,
        fontStyle: 'bold',
        height: 10,
      });
      lines.push({ type: 'spacing', height: 5, text: '' });
      break;

    case 'h3':
      lines.push({
        type: 'text',
        text: getTextContent(element),
        fontSize: 12,
        fontStyle: 'bold',
        height: 9,
      });
      lines.push({ type: 'spacing', height: 4, text: '' });
      break;

    case 'p':
      const text = getTextContent(element);
      if (text.trim()) {
        lines.push({
          type: 'text',
          text: text,
          fontSize: 11,
          height: 9,
        });
        lines.push({ type: 'spacing', height: 3, text: '' });
      }
      break;

    case 'ul':
    case 'ol': {
      const items = element.querySelectorAll('li');
      const isOrdered = tagName === 'ol';
      items.forEach((item, index) => {
        const bullet = isOrdered ? `${index + 1}.` : '•';
        lines.push({
          type: 'text',
          text: `${bullet} ${getTextContent(item)}`,
          fontSize: 11,
          indent: 5,
          height: 9,
        });
      });
      lines.push({ type: 'spacing', height: 5, text: '' });
      break;
    }

    case 'blockquote':
      lines.push({
        type: 'text',
        text: getTextContent(element),
        fontSize: 11,
        fontStyle: 'italic',
        indent: 10,
        height: 9,
        color: '#666666',
      });
      lines.push({ type: 'spacing', height: 5, text: '' });
      break;

    default:
      // For unknown elements, try to get their text content
      const content = getTextContent(element);
      if (content.trim()) {
        lines.push({
          type: 'text',
          text: content,
          fontSize: 11,
          height: 9,
        });
        lines.push({ type: 'spacing', height: 3, text: '' });
      }
  }

  return lines;
}

/**
 * Add signature block to PDF
 */
function addSignatureBlock(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  signatureImage?: string
) {
  if (signatureImage) {
    // If signature image exists, add it to PDF (signatures are already black)
    try {
      // Create a border around the signature area
      pdf.setDrawColor(200, 200, 200);
      pdf.rect(x, y, 80, 30);

      // Add the signature image (black signatures will show properly in PDF)
      pdf.addImage(signatureImage, 'PNG', x + 2, y + 2, 76, 26);

      // Add date below signature
      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(9);
      pdf.setTextColor(100, 100, 100);
      const currentDate = new Date().toLocaleDateString();
      pdf.text(`Signed on: ${currentDate}`, x, y + 40);

      return;
    } catch (error) {
      console.warn('Failed to add signature image to PDF:', error);
      // Fall back to empty signature block
    }
  }

  // Default empty signature block
  const lineWidth = 80;
  const lineY = y + 20;

  // Signature area border
  pdf.setDrawColor(200, 200, 200);
  pdf.rect(x, y, lineWidth, 30);

  // Signature line inside the box
  pdf.setDrawColor(150, 150, 150);
  pdf.line(x + 5, lineY, x + lineWidth - 5, lineY);

  // Labels
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Please sign above', x + 25, y + 35);

  // Date field
  pdf.text('Date: ___________________', x, y + 45);
}

/**
 * Add box block (party info, etc.)
 */
function addBoxBlock(
  pdf: jsPDF,
  x: number,
  y: number,
  width: number,
  block: PDFLine
) {
  const padding = 4;
  const bgColor = block.bgColor || '#f5f5f5';
  const borderColor = block.borderColor || '#cccccc';

  // Convert hex to RGB
  const bgRgb = hexToRgb(bgColor);
  const borderRgb = hexToRgb(borderColor);

  // Draw background
  pdf.setFillColor(bgRgb.r, bgRgb.g, bgRgb.b);
  pdf.rect(x, y, width, block.height ?? 0, 'F');

  // Draw border
  pdf.setDrawColor(borderRgb.r, borderRgb.g, borderRgb.b);
  pdf.setLineWidth(1);
  pdf.rect(x, y, width, block.height ?? 0);

  // Add title
  pdf.setFont('Helvetica', 'bold');
  pdf.setFontSize(12);
  pdf.setTextColor(0, 0, 0);
  pdf.text(block.title || '', x + padding, y + padding + 5);

  // Add content
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(10);
  let contentY = y + padding + 12;
  const lines = pdf.splitTextToSize(block.content || '', width - 2 * padding);
  const blockHeight = block.height ?? 0;
  lines.forEach((line: string) => {
    if (contentY < y + blockHeight) {
      pdf.text(line, x + padding, contentY);
      contentY += 4;
    }
  });
}

/**
 * Add page footer with page number
 */
function addPageFooter(
  pdf: jsPDF,
  pageWidth: number,
  pageHeight: number,
  margin: number
) {
  const pageCount = pdf.getNumberOfPages();
  pdf.setFont('Helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(150, 150, 150);

  // Page number at bottom right
  const pageNum = `Page ${pageCount}`;
  const pageNumWidth =
    (pdf.getStringUnitWidth(pageNum) * pdf.getFontSize()) /
    pdf.internal.scaleFactor;
  pdf.text(pageNum, pageWidth - margin - pageNumWidth, pageHeight - margin + 5);
}

/**
 * Parse content from party/box elements
 */
function parseBoxContent(element: HTMLElement): string {
  const paragraphs = element.querySelectorAll('p');
  const content: string[] = [];

  paragraphs.forEach((p) => {
    const text = getTextContent(p);
    if (text.trim()) {
      content.push(text);
    }
  });

  return content.join(' | ');
}

/**
 * Get text content recursively
 */
function getTextContent(element: HTMLElement | null): string {
  if (!element) return '';

  let text = '';
  element.childNodes.forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      text += node.textContent || '';
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      text += getTextContent(node as HTMLElement);
    }
  });

  return text.trim();
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Generate filename with timestamp
 */
export function generateFileName(title?: string): string {
  const timestamp = new Date().toISOString().slice(0, 10);
  const sanitizedTitle = (title || 'agreement')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 50);

  return `${sanitizedTitle}-${timestamp}.pdf`;
}
