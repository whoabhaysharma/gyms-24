import PDFDocument from 'pdfkit';
import axios from 'axios';
import logger from '../lib/logger';

interface InvoiceData {
    invoiceNumber: string;
    date: string;
    userName: string;
    userMobile: string;
    gymName: string;
    planName: string;
    startDate: string;
    expiryDate: string;
    accessCode: string;
    amount: string;
}

const LOGO_URL = 'https://pub-aeee1a0e623942388891105d555f09c0.r2.dev/gyms24.png';

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
    logger.info('[InvoiceService] Generating invoice PDF with PDFKit', { invoiceNumber: data.invoiceNumber });

    return new Promise(async (resolve, reject) => {
        try {
            // Setup document with slightly wider margins for a cleaner look
            const doc = new PDFDocument({ size: 'A4', margin: 40 });
            const buffers: Buffer[] = [];

            doc.on('data', buffers.push.bind(buffers));
            doc.on('end', () => {
                const pdfData = Buffer.concat(buffers);
                resolve(pdfData);
            });

            // --- Colors & Styles ---
            const colors = {
                primary: '#1a1a1a',      // Dark Charcoal/Black
                secondary: '#555555',    // Medium Gray
                lightGray: '#f3f4f6',    // Very light gray for backgrounds
                border: '#e5e7eb',       // Light border color
                accent: '#39FF14',       // Gyms24 Neon Green
                white: '#FFFFFF'
            };

            const fonts = {
                bold: 'Helvetica-Bold',
                regular: 'Helvetica',
                mono: 'Courier-Bold'
            };

            // --- Asset Fetching ---
            let logoBuffer: Buffer | null = null;
            try {
                const response = await axios.get(LOGO_URL, { responseType: 'arraybuffer' });
                logoBuffer = Buffer.from(response.data);
            } catch (error: any) {
                logger.warn('[InvoiceService] Failed to fetch logo', { error: error.message });
            }

            // ==========================================
            // HEADER SECTION
            // ==========================================

            // Top Accent Bar
            doc.rect(0, 0, 595.28, 10).fill(colors.accent); // Full width A4

            // Logo
            if (logoBuffer) {
                doc.image(logoBuffer, 40, 40, { width: 60 });
            }

            // Company Info (Left Aligned under logo)
            doc.fillColor(colors.primary).fontSize(20).font(fonts.bold).text('Gyms24', 110, 45);
            doc.fillColor(colors.secondary).fontSize(9).font(fonts.regular)
                .text('Premium Fitness Network', 110, 68)
                .text('www.gyms24.in', 110, 80);

            // Invoice Details (Right Aligned)
            const rightMargin = 555;
            doc.fillColor(colors.secondary).fontSize(9).font(fonts.bold)
                .text('INVOICE NUMBER', 300, 45, { align: 'right', width: 250 });
            doc.fillColor(colors.primary).fontSize(14).text(`#${data.invoiceNumber}`, 300, 58, { align: 'right', width: 250 });

            doc.fillColor(colors.secondary).fontSize(9).font(fonts.bold)
                .text('DATE OF ISSUE', 300, 85, { align: 'right', width: 250 });
            doc.fillColor(colors.primary).fontSize(12).font(fonts.regular)
                .text(data.date, 300, 98, { align: 'right', width: 250 });

            doc.moveDown();

            // ==========================================
            // CLIENT INFO SECTION (Boxed)
            // ==========================================
            const clientBoxTop = 130;

            // Light background box
            doc.roundedRect(40, clientBoxTop, 515, 60, 5).fill(colors.lightGray);

            doc.fillColor(colors.secondary).fontSize(8).font(fonts.bold)
                .text('BILLED TO', 60, clientBoxTop + 15);

            doc.fillColor(colors.primary).fontSize(14).font(fonts.bold)
                .text(data.userName, 60, clientBoxTop + 30);

            // Mobile Number on the right side of the box
            doc.fillColor(colors.secondary).fontSize(8).font(fonts.bold)
                .text('MOBILE', 400, clientBoxTop + 15);
            doc.fillColor(colors.primary).fontSize(12).font(fonts.regular)
                .text(`+91 ${data.userMobile}`, 400, clientBoxTop + 30);


            // ==========================================
            // BOOKING DETAILS (Table Style)
            // ==========================================
            const tableTop = 220;

            // Header Row
            doc.rect(40, tableTop, 515, 25).fill(colors.primary);
            doc.fillColor(colors.white).fontSize(9).font(fonts.bold);
            doc.text('DESCRIPTION / GYM NAME', 60, tableTop + 8);
            doc.text('PLAN', 350, tableTop + 8);
            doc.text('AMOUNT', 480, tableTop + 8);

            // Row Content
            const rowY = tableTop + 35;
            doc.fillColor(colors.primary).fontSize(12).font(fonts.bold)
                .text(data.gymName, 60, rowY, { width: 280, lineGap: 2 });

            doc.fillColor(colors.secondary).fontSize(10).font(fonts.regular)
                .text(data.planName, 350, rowY);

            // UPDATED: Added INR label
            doc.fillColor(colors.primary).fontSize(12).font(fonts.bold)
                .text(`INR ${data.amount}`, 480, rowY);

            // Separator Line
            doc.strokeColor(colors.border).lineWidth(1)
                .moveTo(40, rowY + 30).lineTo(555, rowY + 30).stroke();

            // Total Section
            // UPDATED: Added INR label
            doc.fillColor(colors.primary).fontSize(14).font(fonts.bold)
                .text(`Total: INR ${data.amount}`, 40, rowY + 45, { align: 'right', width: 515 });


            // ==========================================
            // ACCESS PASS (Ticket Style)
            // ==========================================
            const passTop = 350;
            // UPDATED: Increased pass container height slightly to match bigger box
            const passHeight = 160;

            // Label
            doc.fillColor(colors.secondary).fontSize(10).font(fonts.bold)
                .text('YOUR MEMBERSHIP ACCESS PASS', 40, passTop - 20);

            // Ticket Border (Dashed)
            doc.save();
            doc.strokeColor(colors.primary).lineWidth(1).dash(5, { space: 5 })
                .rect(40, passTop, 515, passHeight).stroke();
            doc.restore();

            // -- Left Side: Dates --
            doc.fillColor(colors.secondary).fontSize(9).font(fonts.bold).text('VALID FROM', 60, passTop + 40);
            doc.fillColor(colors.primary).fontSize(12).font(fonts.regular).text(data.startDate, 60, passTop + 55);

            doc.fillColor(colors.secondary).fontSize(9).font(fonts.bold).text('VALID UNTIL', 60, passTop + 90);
            doc.fillColor(colors.primary).fontSize(12).font(fonts.regular).text(data.expiryDate, 60, passTop + 105);

            // -- Center: Status --
            doc.roundedRect(220, passTop + 65, 80, 25, 12).fill('#dcfce7'); // Light green pill
            doc.fillColor('#166534').fontSize(10).font(fonts.bold).text('ACTIVE', 220, passTop + 72, { width: 80, align: 'center' });

            // -- Right Side: The Code Box (UPDATED FOR LARGER SIZE) --
            // Increased width to 210 (was 170) and height to 120 (was 100)
            const codeBoxW = 210;
            const codeBoxH = 120;
            const codeBoxX = 555 - codeBoxW - 20; // Aligned to right with 20px padding
            const codeBoxY = passTop + 20;


            // Fill Box with Accent color
            doc.roundedRect(codeBoxX, codeBoxY, codeBoxW, codeBoxH, 8).fill(colors.primary);

            doc.fillColor(colors.accent).fontSize(12).font(fonts.bold) // Font size increased to 12
                .text('ENTRY ACCESS CODE', codeBoxX, codeBoxY + 15, { width: codeBoxW, align: 'center' });

            // White Box for code (Larger now)
            doc.roundedRect(codeBoxX + 25, codeBoxY + 40, codeBoxW - 50, 45, 4).fill(colors.white);

            doc.fillColor(colors.primary).fontSize(26).font(fonts.mono) // Font size increased to 26
                .text(data.accessCode, codeBoxX + 25, codeBoxY + 52, { width: codeBoxW - 50, align: 'center', characterSpacing: 3 });

            doc.fillColor(colors.secondary).fontSize(8).font(fonts.regular)
                .text('Show this code at reception', codeBoxX, codeBoxY + 95, { width: codeBoxW, align: 'center', color: '#aaaaaa' });


            // ==========================================
            // FOOTER
            // ==========================================
            const footerY = 750;

            doc.strokeColor(colors.border).lineWidth(1).moveTo(40, footerY).lineTo(555, footerY).stroke();

            doc.fontSize(8).font(fonts.regular).fillColor(colors.secondary)
                .text('Thank you for choosing Gyms24. This is a computer-generated invoice.', 40, footerY + 15, { align: 'center' });

            doc.text('Support: help@gyms24.in | +91 99999 99999', 40, footerY + 28, { align: 'center' });

            doc.end();

        } catch (error: any) {
            logger.error('[InvoiceService] Error generating invoice PDF', { error: error.message });
            reject(error);
        }
    });
};