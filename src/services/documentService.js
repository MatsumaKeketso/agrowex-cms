import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

const DocumentService = {
  generateLetterOfIntent: async (data) => {
    const pdfDoc = await PDFDocument.create();
    let currentPage = pdfDoc.addPage([595.28, 841.89]); // A4 size

    const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let { width, height } = currentPage.getSize();
    let currentY = height - 100;
    const lineHeight = 20;
    const pageMargin = 40;
    const maxWidth = width - (pageMargin * 2);

    // Helper function to check and add new page if needed
    function checkAndAddPage(requiredSpace) {
      if (currentY - requiredSpace < pageMargin) {
        currentPage = pdfDoc.addPage([595.28, 841.89]);
        currentY = height - pageMargin;
        return true;
      }
      return false;
    }

    // Enhanced text wrapping function with pagination
    function drawWrappedText(text, x, y, maxWidth, fontSize, font, lineHeight, indent = false) {
      const words = text.split(' ');
      let line = '';
      let localY = y;
      let firstLine = true;

      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const lineWidth = font.widthOfTextAtSize(testLine, fontSize);

        if (lineWidth > maxWidth && line !== '') {
          // Check if we need a new page
          if (localY - lineHeight < pageMargin) {
            currentPage = pdfDoc.addPage([595.28, 841.89]);
            localY = height - pageMargin;
          }

          currentPage.drawText(line, {
            x: firstLine || !indent ? x : x + 20,
            y: localY,
            size: fontSize,
            font: font,
          });

          line = word;
          localY -= lineHeight;
          firstLine = false;
        } else {
          line = testLine;
        }
      }

      if (line.trim().length > 0) {
        if (localY - lineHeight < pageMargin) {
          currentPage = pdfDoc.addPage([595.28, 841.89]);
          localY = height - pageMargin;
        }

        currentPage.drawText(line, {
          x: firstLine || !indent ? x : x + 20,
          y: localY,
          size: fontSize,
          font: font,
        });
        localY -= lineHeight;
      }

      return localY;
    }

    // Header section (first page only)
    // Logo placeholder
    currentPage.drawRectangle({
      x: width - 160,
      y: height - 80,
      width: 120,
      height: 40,
      color: rgb(0.9, 0.9, 0.9),
    });
    currentPage.drawText('120x40', {
      x: width - 120,
      y: height - 60,
      font: helveticaFont,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Company Information
    currentY = drawWrappedText(data.companyName, pageMargin, currentY, maxWidth, 12, helveticaBold, lineHeight);
    currentY -= 5;

    // Company Details
    const companyDetails = [
      `REG No: ${data.regNo}`,
      `TIN: ${data.tin}`,
      data.address,
      data.country,
      `PHONE: ${data.phone}`,
      `EMAIL: ${data.email}`,
    ];

    companyDetails.forEach(detail => {
      currentY = drawWrappedText(detail, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);
    });

    currentY -= lineHeight;

    // Recipient Information
    currentY = drawWrappedText('Attention:', pageMargin, currentY, maxWidth, 10, helveticaBold, lineHeight);

    const recipientDetails = [
      data.recipient.name,
      data.recipient.company,
      data.recipient.address,
      `ID: ${data.recipient.id}`,
      `PHONE: ${data.recipient.phone}`,
      `EMAIL: ${data.recipient.email}`,
    ];

    recipientDetails.forEach(detail => {
      currentY = drawWrappedText(detail, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);
    });

    // Date
    currentY -= lineHeight;
    currentY = drawWrappedText(data.date, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);

    // Title
    currentY -= lineHeight * 1.5;
    const title = 'LETTER OF INTENT';
    const titleWidth = helveticaBold.widthOfTextAtSize(title, 14);
    checkAndAddPage(lineHeight * 2);
    currentPage.drawText(title, {
      x: (width - titleWidth) / 2,
      y: currentY,
      font: helveticaBold,
      size: 14,
    });

    // Main content
    currentY -= lineHeight * 2;

    // First paragraph - Initial Interest
    const initialContent = data.content;
    currentY = drawWrappedText(initialContent, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);

    // Second paragraph - Business Relationship
    currentY -= lineHeight;
    const businessRelationship = "We are committed to establishing a mutually beneficial business relationship and believe that this transaction could mark the beginning of a long-term partnership between our companies. We are open to discussing pricing, payment terms, and any other relevant details to ensure a smooth and successful transaction.";
    currentY = drawWrappedText(businessRelationship, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);

    // Third paragraph - Formal Expression
    currentY -= lineHeight;
    const formalExpression = "Please consider this letter as a formal expression of our intent to proceed with the purchase of 10,000 metric tons of SUGAR BEANS – GRADE A NON-GMO from your company. We would appreciate receiving a formal quotation outlining the terms and conditions of the proposed sale at your earliest convenience.";
    currentY = drawWrappedText(formalExpression, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);

    // Fourth paragraph - Thank you
    currentY -= lineHeight;
    const thankYou = "Thank you for considering our proposal. We look forward to the opportunity to do business with you and to further discuss the details of this potential collaboration.";
    currentY = drawWrappedText(thankYou, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);

    // Specifications
    currentY -= lineHeight;
    const specifications = [
      { label: 'Commodity', value: data.specifications.commodity },
      { label: 'Quantity', value: data.specifications.quantity },
      { label: 'Quality', value: data.specifications.quality },
      { label: 'Packaging', value: data.specifications.packaging },
      { label: 'Method of Payment', value: data.specifications.paymentMethod },
      { label: 'Price', value: data.specifications.price },
      { label: 'Delivery Terms', value: data.specifications.deliveryTerms },
      { label: 'Destination Port', value: data.specifications.destinationPort },
    ];

    specifications.forEach(spec => {
      checkAndAddPage(lineHeight);
      const specText = `${spec.label}: ${spec.value}`;
      currentY = drawWrappedText(specText, pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);
    });

    // Signature section
    currentY -= lineHeight * 2;
    checkAndAddPage(lineHeight * 6);

    currentY = drawWrappedText("Sincerely,", pageMargin, currentY, maxWidth, 10, helveticaFont, lineHeight);
    currentY -= lineHeight;

    // Signature details
    const signatureDetails = [
      "ALIKO ADAMSON MWAKOBA",
      "MANAGING DIRECTOR",
      "MWAKOBA AND ASSOCIATES COMPANY LIMITED",
      `PHONE: ${data.phone}`,
      `EMAIL: ${data.email}`,
      "www.mwakoba.co.tz"
    ];

    signatureDetails.forEach(detail => {
      currentY = drawWrappedText(detail, pageMargin, currentY, maxWidth, 10, helveticaBold, lineHeight);
    });

    // Signature and stamp placeholders
    currentY -= lineHeight;
    currentPage.drawRectangle({
      x: pageMargin,
      y: currentY - 40,
      width: 100,
      height: 40,
      color: rgb(0.9, 0.9, 0.9),
    });
    currentPage.drawText('Signature', {
      x: pageMargin + 20,
      y: currentY - 25,
      font: helveticaFont,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });

    currentPage.drawRectangle({
      x: pageMargin + 120,
      y: currentY - 40,
      width: 80,
      height: 80,
      color: rgb(0.9, 0.9, 0.9),
    });
    currentPage.drawText('Company Stamp', {
      x: pageMargin + 125,
      y: currentY - 25,
      font: helveticaFont,
      size: 8,
      color: rgb(0.3, 0.3, 0.3),
    });

    // Footer (on each page)
    const pages = pdfDoc.getPages();
    pages.forEach(page => {
      const { width, height } = page.getSize();
      const footerY = 60;

      // Footer line
      page.drawLine({
        start: { x: pageMargin, y: footerY + 30 },
        end: { x: width - pageMargin, y: footerY + 30 },
        thickness: 1,
        color: rgb(0.8, 0.8, 0.8),
      });

      // Footer columns with wrapping
      const columnWidth = (width - 200) / 2;

      let footerCol1Y = drawWrappedText(data.companyName, pageMargin, footerY, columnWidth, 8, helveticaFont, 12);
      drawWrappedText(data.address, pageMargin, footerCol1Y, columnWidth, 8, helveticaFont, 12);

      let footerCol2Y = drawWrappedText(`Mobile: ${data.phone}`, pageMargin + columnWidth, footerY, columnWidth, 8, helveticaFont, 12);
      drawWrappedText(`Email: ${data.email}`, pageMargin + columnWidth, footerCol2Y, columnWidth, 8, helveticaFont, 12);

      // Footer Logo placeholder
      page.drawRectangle({
        x: width - 120,
        y: footerY - 15,
        width: 80,
        height: 30,
        color: rgb(0.9, 0.9, 0.9),
      });
      page.drawText('80x30', {
        x: width - 90,
        y: footerY,
        font: helveticaFont,
        size: 8,
        color: rgb(0.3, 0.3, 0.3),
      });
    });

    return pdfDoc;
  }
}

export default DocumentService;