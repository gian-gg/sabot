'use client';

import jsPDF from 'jspdf';
import type { TransactionStatus } from '@/types/transaction';

interface TransactionDetails {
  id: string;
  creator_id: string;
  creator_name: string;
  creator_email: string;
  creator_avatar_url: string | null | undefined;
  status: TransactionStatus;
  item_name: string;
  item_description: string;
  price: number;
  meeting_location: string | null | undefined;
  meeting_time: string | null | undefined;
  delivery_address: string | null | undefined;
  delivery_method: string | null | undefined;
  online_platform: string | null | undefined;
  online_contact: string | null | undefined;
  online_instructions: string | null | undefined;
  category: string;
  condition: string;
  quantity: number;
  transaction_type: 'meetup' | 'delivery' | 'online';
  hash: string | null | undefined;
  created_at: string;
  updated_at: string;
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
    pdf.text(transaction.item_name, margin, currentY);
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
    pdf.text('PRICE', margin + 3, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor(0, 0, 0);
    pdf.text(
      `$${transaction.price.toLocaleString()}`,
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
    pdf.text(
      new Date(transaction.created_at).toLocaleDateString(),
      margin + detailBoxWidth + 13,
      currentY + 15
    );

    currentY += detailBoxHeight + 5;

    // Creator
    pdf.setFillColor(240, 249, 255);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight, 'F');
    pdf.setDrawColor(1, 208, 108);
    pdf.rect(margin, currentY, detailBoxWidth, detailBoxHeight);

    pdf.setFont('Helvetica', 'normal');
    pdf.setFontSize(9);
    pdf.setTextColor(100, 100, 100);
    pdf.text('CREATOR', margin + 3, currentY + 5);

    pdf.setFont('Helvetica', 'bold');
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text(transaction.creator_name, margin + 3, currentY + 15);

    // Type
    const typeLabel =
      transaction.transaction_type === 'meetup'
        ? 'In-Person Meetup'
        : transaction.transaction_type === 'delivery'
          ? 'Delivery'
          : 'Online Transaction';

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
    pdf.text(typeLabel, margin + detailBoxWidth + 13, currentY + 15);

    currentY += detailBoxHeight + 15;

    checkPageBreak(40);

    // Get location based on transaction type
    const getLocation = () => {
      if (transaction.transaction_type === 'meetup')
        return transaction.meeting_location;
      if (transaction.transaction_type === 'delivery')
        return transaction.delivery_address;
      if (transaction.transaction_type === 'online')
        return transaction.online_platform;
      return null;
    };
    const location = getLocation();

    // Additional Information Section
    if (
      transaction.item_description ||
      transaction.category ||
      location ||
      transaction.condition ||
      transaction.quantity
    ) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Additional Information', margin, currentY);
      currentY += 8;

      if (transaction.item_description) {
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Description', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const descLines = pdf.splitTextToSize(
          transaction.item_description,
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

      if (transaction.condition) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Condition', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.condition, margin, currentY);
        currentY += 8;
      }

      if (transaction.quantity) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Quantity', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.quantity.toString(), margin, currentY);
        currentY += 8;
      }

      if (location) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        const locationLabel =
          transaction.transaction_type === 'meetup'
            ? 'Meeting Location'
            : transaction.transaction_type === 'delivery'
              ? 'Delivery Address'
              : 'Platform';
        pdf.text(locationLabel, margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(location, margin, currentY);
        currentY += 10;
      }

      if (
        transaction.transaction_type === 'meetup' &&
        transaction.meeting_time
      ) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Meeting Time', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(
          new Date(transaction.meeting_time).toLocaleString(),
          margin,
          currentY
        );
        currentY += 10;
      }

      if (
        transaction.transaction_type === 'delivery' &&
        transaction.delivery_method
      ) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Delivery Method', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.delivery_method, margin, currentY);
        currentY += 10;
      }

      if (
        transaction.transaction_type === 'online' &&
        transaction.online_contact
      ) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Online Contact', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        pdf.text(transaction.online_contact, margin, currentY);
        currentY += 10;
      }

      if (
        transaction.transaction_type === 'online' &&
        transaction.online_instructions
      ) {
        checkPageBreak(10);
        pdf.setFont('Helvetica', 'bold');
        pdf.setFontSize(10);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Instructions', margin, currentY);
        currentY += 5;

        pdf.setFont('Helvetica', 'normal');
        pdf.setFontSize(10);
        pdf.setTextColor(60, 60, 60);
        const instrLines = pdf.splitTextToSize(
          transaction.online_instructions,
          contentWidth
        );
        pdf.text(instrLines, margin, currentY);
        currentY += instrLines.length * 5 + 5;
      }
    }

    checkPageBreak(40);

    // Blockchain Info Section
    if (transaction.hash) {
      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Blockchain Information', margin, currentY);
      currentY += 8;

      pdf.setFont('Helvetica', 'bold');
      pdf.setFontSize(10);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Transaction Hash', margin, currentY);
      currentY += 5;

      pdf.setFont('Courier', 'normal');
      pdf.setFontSize(8);
      pdf.setTextColor(60, 60, 60);
      pdf.text(transaction.hash, margin, currentY);
      currentY += 10;
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
    const sanitizedItemName = transaction.item_name
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
