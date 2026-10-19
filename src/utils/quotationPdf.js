import { jsPDF } from 'jspdf';

const INLINE_ICON = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/u;
const INLINE_ICONS = /\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*/gu;

const getInlineIcon = (html = '') => {
  const node = document.createElement('div');
  node.innerHTML = html;
  return (node.textContent || '').match(INLINE_ICON)?.[0] || '';
};

const emojiImage = (icon) => {
  if (!icon) return '';
  const canvas = document.createElement('canvas');
  canvas.width = 64; canvas.height = 64;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, 64, 64);
  context.font = '48px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
  context.textAlign = 'center'; context.textBaseline = 'middle';
  context.fillText(icon, 32, 34);
  return canvas.toDataURL('image/png');
};

const cleanHtml = (html = '') => {
  const node = document.createElement('div');
  node.innerHTML = html;
  node.querySelectorAll('img, svg').forEach((image) => image.remove());
  node.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
  node.querySelectorAll('p, div, li').forEach((element) => element.append('\n'));
  return (node.textContent || '')
    .replace(INLINE_ICONS, '')
    .replace(/\uFE0F/g, '')
    .replace(/\u00a0/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/ *\n */g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
};

const getAlignment = (html = '') => {
  const node = document.createElement('div');
  node.innerHTML = html;
  const element = node.querySelector('[style*="text-align"], [align]');
  const alignment = element?.style?.textAlign || element?.getAttribute('align');
  return ['left', 'center', 'right'].includes(alignment) ? alignment : 'left';
};

const safeDate = (value) => {
  if (!value) return '—';
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
};

const getValidUntil = (dateOfIssue, validityPeriod) => {
  const baseDate = dateOfIssue
    ? new Date(`${dateOfIssue}T00:00:00`)
    : new Date();
  if (Number.isNaN(baseDate.getTime())) return '';
  baseDate.setDate(baseDate.getDate() + Number(validityPeriod || 0));
  return baseDate.toISOString().split('T')[0];
};

const formatPricingAmount = (value) => {
  const amount = Number(value || 0);

  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

const drawPricing = (pdf, pricing, left, right, startY) => {
  const pageWidth = right - left;
  const valueX = right - 4;
  let y = startY;

  const rows = [
    ['Base Amount', pricing.amount],
    ['Discount', pricing.discountAmount, true],
    ['Taxable Amount', pricing.taxableAmount],
    [`GST (${pricing.gstPercentage}%)`, pricing.gstAmount],
  ];

  rows.forEach(([label, value, isDiscount]) => {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(9);
    pdf.setTextColor(45, 45, 45);
    pdf.text(label, left + 4, y);

    pdf.setTextColor(isDiscount ? 220 : 45, isDiscount ? 45 : 45, isDiscount ? 65 : 45);
    pdf.text(
      `${isDiscount ? '-' : ''}INR ${formatPricingAmount(value)}`,
      valueX,
      y,
      { align: 'right' }
    );

    pdf.setDrawColor(225, 225, 225);
    pdf.line(left + 4, y + 5, right - 4, y + 5);
    y += 18;
  });

  pdf.setFillColor(252, 246, 232);
  pdf.setDrawColor(166, 116, 28);
  pdf.roundedRect(left, y, pageWidth, 47, 2, 2, 'FD');
  pdf.setFillColor(166, 116, 28);
  pdf.rect(left, y, pageWidth, 1.5, 'F');

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(140, 96, 22);
  pdf.text('FINAL AMOUNT', left + 7, y + 12);

  pdf.setFontSize(24);
  pdf.text(
    `INR ${formatPricingAmount(pricing.totalAmount)}`,
    left + 7,
    y + 28
  );

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(100, 100, 100);
  pdf.text('Inclusive of GST', left + 7, y + 39);
};
export function createQuotationPdf(coverData, metadataData, sections) {
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', compress: true });
  const width = pdf.internal.pageSize.getWidth();
  const height = pdf.internal.pageSize.getHeight();
  const left = 18;
  const right = width - 18;

  const header = () => {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(110);
    pdf.text(coverData.brand || 'Quotation', left, 13);
    pdf.text(metadataData.submittedBy || '', right, 13, { align: 'right' });
    pdf.setDrawColor(210); pdf.line(left, 16, right, 16);
  };
  const footer = (page) => {
    pdf.setDrawColor(210); pdf.line(left, height - 15, right, height - 15);
    pdf.setFontSize(7); pdf.setTextColor(145);
    pdf.text('Confidential & Proprietary', left, height - 10);
    pdf.text(`Page ${page}`, right, height - 10, { align: 'right' });
  };

  header();
  pdf.setDrawColor(50); pdf.rect(left, 29, right - left, 65);
  pdf.setTextColor(30); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(25);
  pdf.text(coverData.brand || 'QUOTATION', left + 9, 45);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(11); pdf.text(coverData.proposalTitle || '', left + 9, 54);
  pdf.setDrawColor(205); pdf.line(left + 9, 62, right - 9, 62);
  pdf.setFontSize(8); pdf.setTextColor(100);
  pdf.text((coverData.highlights || []).join('  •  '), left + 9, 69, { maxWidth: right - left - 18 });
  pdf.setFont('helvetica', 'bold'); pdf.setTextColor(30); pdf.setFontSize(11);
  pdf.text(coverData.documentType || 'Proposal', left + 9, 80);
  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8);
  pdf.text(`Prepared exclusively for: ${coverData.preparedFor || '—'} — ${coverData.operation || ''}`, left + 9, 87);

  const rows = [
    ['Submitted By', 'Strideind Innovations Pvt Ltd'], ['Submitted To', metadataData.submittedTo || '—'],
    ['Proposal Reference', metadataData.proposalReference || '—'], ['Date of Issue', safeDate(metadataData.dateOfIssue)],
    ['Valid Until', safeDate(metadataData.validUntil || getValidUntil(metadataData.dateOfIssue, metadataData.validityPeriod))], ['Site Location', metadataData.siteLocation || '—'],
    ['Classification', metadataData.classification || '—'],
  ];
  let y = 108;
  rows.forEach(([label, value]) => {
    pdf.setFillColor(246); pdf.rect(left, y, 48, 9, 'F'); pdf.setDrawColor(215);
    pdf.rect(left, y, right - left, 9); pdf.line(left + 48, y, left + 48, y + 9);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7.5); pdf.setTextColor(45); pdf.text(label, left + 3, y + 5.8);
    pdf.setFont('helvetica', 'normal'); pdf.text(String(value), left + 51, y + 5.8); y += 9;
  });
  footer(1);

  sections.forEach((section, sectionIndex) => {
    if (!section.isSaved) return;
    pdf.addPage(); header();
    pdf.setFillColor(16, 51, 88); pdf.rect(left, 26, right - left, section.subtitle ? 18 : 13, 'F');
    pdf.setTextColor(255); pdf.setFont('helvetica', 'bold'); pdf.setFontSize(10);
    const showNumbering = section.showNumbering === true;
    const prefix = showNumbering ? `SECTION ${sectionIndex + 1}  |  ` : '';
    pdf.text(`${prefix}${section.title || 'UNTITLED SECTION'}`.toUpperCase(), left + 5, 34);
    if (section.subtitle) {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(7.5); pdf.setTextColor(220, 230, 241);
      pdf.text(section.subtitle, left + 5, 38.5, { maxWidth: right - left - 10 });
    }
    let contentY = section.subtitle ? 53 : 48;
    const ensureSpace = (needed = 16) => {
      if (contentY + needed <= height - 22) return;
      footer(pdf.getNumberOfPages()); pdf.addPage(); header(); contentY = 27;
    };
    if (section.sectionType === 'pricing') {
      const pricing = section.pricing?.preview || section.pricing;

      if (pricing?.totalAmount !== undefined) {
        drawPricing(pdf, pricing, left, right, contentY);
      }

      footer(pdf.getNumberOfPages());
      return;
    }

    section.blocks.forEach((block, blockIndex) => {
      const blockNumber = `${sectionIndex + 1}.${blockIndex + 1}`;

      if (
        showNumbering &&
        block.type !== 'Heading' &&
        block.type !== 'terms' &&
        block.type !== 'Table'
      ) {
        ensureSpace(7);
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(8.5);
        pdf.setTextColor(12, 73, 132);
        pdf.text(`${blockNumber}  ${block.type}`, left, contentY);
        contentY += 5;
      }

      if (block.type === 'terms') {
        (block.terms || []).forEach((term, termIndex) => {
          ensureSpace(18);
          const termNumber = showNumbering ? `${sectionIndex + 1}.${termIndex + 1}  ` : '';
          pdf.setFont('helvetica', 'bold'); pdf.setFontSize(9); pdf.setTextColor(12, 73, 132);
          pdf.text(`${termNumber}${term.title || ''}`, left, contentY);
          pdf.setDrawColor(166, 194, 220); pdf.line(left, contentY + 2, right, contentY + 2);
          contentY += 7;
          (term.bullets || []).forEach((bullet) => {
            const bulletText = String(bullet).replace(/\s+/g, ' ').trim();
            if (!bulletText) return;
            const textLeft = left + 8;
            const textWidth = right - textLeft;
            const lineHeight = 3.35;
            const lines = pdf.splitTextToSize(bulletText, textWidth);
            const bulletHeight = lines.length * lineHeight;
            ensureSpace(bulletHeight + 1.4);
            pdf.setFillColor(25, 117, 190); pdf.circle(left + 4, contentY - 1, 0.5, 'F');
            pdf.setFont('helvetica', 'normal'); pdf.setFontSize(8); pdf.setTextColor(55, 65, 75);
            pdf.text(lines, textLeft, contentY, {
              align: 'left',
              maxWidth: textWidth,
              lineHeightFactor: 1.18,
            });
            contentY += bulletHeight + 1.4;
          });
          contentY += 3.5;
        });
        return;
      }
      if (block.type === 'Table') {
        const wrapper = document.createElement('div');
        wrapper.innerHTML = block.content || '';
        const tableElement = wrapper.querySelector('table');
        if (!tableElement) return;
        const tableRows = [...tableElement.querySelectorAll('tr')];
        const hasHeaderRow = tableRows.some((row) => row.querySelector('th'));
        const columnCount = Math.max(...tableRows.map((row) => row.children.length));
        pdf.setFontSize(8);
        const naturalWidths = Array.from({ length: columnCount }, (_, columnIndex) => {
          const longest = tableRows.reduce((width, row) => {
            const text = cleanHtml(row.children[columnIndex]?.innerHTML || '');
            return Math.max(width, pdf.getTextWidth(text));
          }, 0);
          return Math.min(55, Math.max(18, longest + 7));
        });
        const naturalTotal = naturalWidths.reduce((sum, width) => sum + width, 0);
        const scale = (right - left) / naturalTotal;
        const columnWidths = naturalWidths.map((width) => width * scale);
        tableRows.forEach((row, rowIndex) => {
          const cells = [...row.children];
          const cellIcons = cells.map((cell) => getInlineIcon(cell.innerHTML));
          const cellLines = cells.map((cell, index) => pdf.splitTextToSize(cleanHtml(cell.innerHTML), columnWidths[index] - (cellIcons[index] ? 12 : 6)));
          const rowHeight = Math.max(9, ...cellLines.map((lines) => lines.length * 4 + 4));
          ensureSpace(rowHeight + 1);
          cells.forEach((cell, columnIndex) => {
            const x = left + columnWidths.slice(0, columnIndex).reduce((sum, width) => sum + width, 0);
            const cellWidth = columnWidths[columnIndex];
            const isHeader = cell.tagName === 'TH';
            if (isHeader) {
              pdf.setFillColor(16, 83, 145);
              pdf.rect(x, contentY, cellWidth, rowHeight, 'F');
            } else if (hasHeaderRow && rowIndex > 0 && rowIndex % 2 === 0) {
              pdf.setFillColor(232, 241, 249);
              pdf.rect(x, contentY, cellWidth, rowHeight, 'F');
            } else {
              pdf.setFillColor(255, 255, 255);
              pdf.rect(x, contentY, cellWidth, rowHeight, 'F');
            }
            pdf.setDrawColor(175, 195, 212); pdf.rect(x, contentY, cellWidth, rowHeight);
            pdf.setFont('helvetica', isHeader ? 'bold' : 'normal'); pdf.setFontSize(8); pdf.setTextColor(isHeader ? 255 : 45);
            const alignment = getAlignment(cell.outerHTML);
            const icon = cellIcons[columnIndex];
            if (icon) {
              const image = emojiImage(icon);
              if (image) pdf.addImage(image, 'PNG', x + 3, contentY + 2, 4.5, 4.5);
            }
            const textX = alignment === 'right' ? x + cellWidth - 3 : alignment === 'center' ? x + cellWidth / 2 : x + (icon ? 9 : 3);
            pdf.text(cellLines[columnIndex], textX, contentY + 5.5, { align: alignment });
          });
          contentY += rowHeight;
        });
        contentY += 6;
        return;
      }
      const text = cleanHtml(block.content);
      if (!text) return;
      const isTitle = block.type === 'Heading';
      const label = isTitle && showNumbering ? `${blockNumber}  ${text}` : text;
      pdf.setFont('helvetica', isTitle ? 'bold' : 'normal'); pdf.setFontSize(isTitle ? 10 : 8.5);
      if (isTitle) pdf.setTextColor(12, 73, 132); else pdf.setTextColor(55, 65, 75);
      const alignment = getAlignment(block.content);
      const icon = getInlineIcon(block.content);
      const textX = alignment === 'right' ? right : alignment === 'center' ? (left + right) / 2 : left + (icon ? 6 : 0);
      const lines = pdf.splitTextToSize(label, right - left - (icon ? 6 : 0));
      const contentHeight = lines.length * 4.2;
      ensureSpace(contentHeight + (isTitle ? 4 : 6));
      if (icon && alignment === 'left') {
        const image = emojiImage(icon);
        if (image) pdf.addImage(image, 'PNG', left, contentY - 3.5, 4.5, 4.5);
      }
      pdf.text(lines, textX, contentY, { align: alignment });
      if (isTitle) {
        const lineY = contentY + contentHeight - 1.5;
        pdf.setDrawColor(166, 194, 220); pdf.line(left, lineY, right, lineY);
        contentY = lineY + 3.2;
      } else {
        contentY += contentHeight + 4;
      }
    });
    footer(pdf.getNumberOfPages());
  });
  return pdf;
}
