'use client';

import jsPDF from 'jspdf';
import type { TransactionStatus } from '@/types/transaction';

interface TransactionDetails {
  id: string;
  type: string;
  item: string;
  amount: number;
  status: TransactionStatus;
  date: string;
  counterparty: string;
  description?: string;
  category?: string;
  location?: string;
  paymentMethod?: string;
  escrowStatus?: string;
  timeline?: {
    event: string;
    date: string;
    status: 'completed' | 'pending' | 'failed';
  }[];
}

/**
 * Export transaction details to PDF
 */
export async function exportTransactionToPDF(
  transaction: TransactionDetails
): Promise<void> {
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
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let currentY = margin;

    // Helper function to check if we need a new page
    const checkPageBreak = (requiredHeight: number) => {
      if (currentY + requiredHeight > pageHeight - margin) {
        pdf.addPage();
        currentY = margin;
        return true;
      }
      return false;
    };

    // Header with branding
    pdf.setFillColor(1, 208, 108); // Primary green
    pdf.rect(0, 0, pageWidth, 15, 'F');

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(255, 255, 255);
    pdf.text('SABOT', margin, 10);

    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Transaction Receipt', pageWidth - margin - 40, 10);

    currentY = 25;

    // Title
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text(transaction.item, margin, currentY);
    currentY += 12;

    // Transaction ID
    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text(`Transaction ID: ${transaction.id}`, margin, currentY);
    currentY += 10;

    // Status Badge
    const statusColors: Record<
      TransactionStatus,
      { bg: [number, number, number]; text: string }
    > = {
      completed: { bg: [1, 208, 108], text: 'COMPLETED' },
      active: { bg: [59, 130, 246], text: 'ACTIVE' },
      pending: { bg: [245, 158, 11], text: 'PENDING' },
      disputed: { bg: [239, 68, 68], text: 'DISPUTED' },
      reported: { bg: [249, 115, 22], text: 'REPORTED' },
      waiting_for_participant: { bg: [168, 85, 247], text: 'WAITING' },
      both_joined: { bg: [6, 182, 212], text: 'BOTH JOINED' },
      screenshots_uploaded: { bg: [16, 185, 129], text: 'UPLOADED' },
      cancelled: { bg: [107, 114, 128], text: 'CANCELLED' },
    };

    const statusInfo = statusColors[transaction.status];
    pdf.setFillColor(...statusInfo.bg);
    pdf.roundedRect(margin, currentY, 40, 8, 2, 2, 'F');
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(255, 255, 255);
    pdf.text(statusInfo.text, margin + 2, currentY + 5.5);
    currentY += 15;

    // Separator line
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, currentY, pageWidth - margin, currentY);
    currentY += 10;

    // Key Details Section
    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Transaction Details', margin, currentY);
    currentY += 8;

    // Details Grid
    const detailBoxHeight = 25;
    const detailBoxWidth = (contentWidth - 10) / 2;

    // Amount
    pdf.setFillColor(240, 249, 255);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight, 'F');
    pdf.setDrawColor(1, 208, 108);
    pdf.setLineWidth(0.5);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('AMOUNT', margin + 3, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `$${transaction.amount.toLocaleString()}`,
      margin + 3,
      currentY + 15
    );

    // Date
    pdf.setFillColor(240, 249, 255);
    pdf.rect(
      margin + detailBoxWidth + 10,
      currentY,
      detailBoxWidth,
      detailBoxHeight,
      'F'
    );
    pdf.setDrawColor(1, 208, 108);
    pdf.rect(
      margin + detailBoxWidth + 10,
      currentY,
      detailBoxWidth,
      detailBoxHeight
    );

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('DATE', margin + detailBoxWidth + 13, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(transaction.date, margin + detailBoxWidth + 13, currentY + 15);

    currentY += detailBoxHeight + 5;

    // Counterparty
    pdf.setFillColor(240, 249, 255);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight, 'F');
    pdf.setDrawColor(1, 208, 108);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('COUNTERPARTY', margin + 3, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(transaction.counterparty, margin + 3, currentY + 15);

    // Type
    pdf.setFillColor(240, 249, 255);
    pdf.rect(
      margin + detailBoxWidth + 10,
      currentY,
      detailBoxWidth,
      detailBoxHeight,
      'F'
    );
    pdf.setDrawColor(1, 208, 108);
    pdf.rect(
      margin + detailBoxWidth + 10,
      currentY,
      detailBoxWidth,
      detailBoxHeight
    );

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('TYPE', margin + detailBoxWidth + 13, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(transaction.type, margin + detailBoxWidth + 13, currentY + 15);

    currentY += detailBoxHeight + 15;

    checkPageBreak(40);

    // Additional Information Section
    if (
      transaction.description ||
      transaction.category ||
      transaction.location
    ) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Additional Information', margin, currentY);
      currentY += 8;

      if (transaction.description) {
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Description', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const descLines = pdf.splitTextToSize(
          transaction.description,
          contentWidth
        );
        pdf.text(descLines, margin, currentY);
        currentY += descLines.length * 5 + 5;
      }

      if (transaction.category) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Category', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.category, margin, currentY);
        currentY += 8;
      }

      if (transaction.location) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Location', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.location, margin, currentY);
        currentY += 10;
      }
    }

    checkPageBreak(40);

    // Payment & Security Section
    if (transaction.paymentMethod || transaction.escrowStatus) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Payment & Security', margin, currentY);
      currentY += 8;

      if (transaction.paymentMethod) {
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Payment Method', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.paymentMethod, margin, currentY);
        currentY += 8;
      }

      if (transaction.escrowStatus) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Escrow Status', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.escrowStatus, margin, currentY);
        currentY += 10;
      }
    }

    checkPageBreak(60);

    // Timeline Section
    if (transaction.timeline && transaction.timeline.length > 0) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Transaction Timeline', margin, currentY);
      currentY += 10;

      transaction.timeline.forEach((item, index) => {
        checkPageBreak(15);

        // Status indicator
        const statusColor =
          item.status === 'completed'
            ? [1, 208, 108]
            : item.status === 'pending'
              ? [245, 158, 11]
              : [239, 68, 68];

        pdf.setFillColor(...(statusColor as [number, number, number]));
        pdf.circle(margin + 3, currentY - 2, 2, 'F');

        // Connect with line (except last item)
        if (index < transaction.timeline!.length - 1) {
          pdf.setDrawColor(200, 200, 200);
          pdf.setLineWidth(0.5);
          pdf.line(margin + 3, currentY, margin + 3, currentY + 10);
        }

        // Event text
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text(item.event, margin + 10, currentY);

        // Date text
        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(9);
        pdf.setTextColor(100, 100, 100);
        pdf.text(item.date, margin + 10, currentY + 4);

        currentY += 12;
      });
      currentY += 5;
    }

    // Footer
    const footerY = pageHeight - 15;
    pdf.setDrawColor(200, 200, 200);
    pdf.setLineWidth(0.5);
    pdf.line(margin, footerY, pageWidth - margin, footerY);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(8);
    pdf.setTextColor(100, 100, 100);
    pdf.text(
      `Generated on ${new Date().toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}`,
      margin,
      footerY + 5
    );

    pdf.text('Powered by SABOT', pageWidth - margin - 30, footerY + 5);

    // Generate filename
    const sanitizedItemName = transaction.item
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .slice(0, 30);
    const fileName = `transaction-${sanitizedItemName}-${transaction.id}.pdf`;

    // Save the PDF
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting transaction to PDF:', error);
    throw new Error('Failed to export transaction to PDF');
  }
}
