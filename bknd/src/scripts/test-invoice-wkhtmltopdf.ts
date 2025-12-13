import { generateInvoicePdf } from '../services/invoice.service';
import fs from 'fs';
import path from 'path';

const testInvoice = async () => {
    const data = {
        invoiceNumber: 'INV-TEST-WKHTML',
        date: '13 Dec 2025',
        userName: 'Test User',
        userMobile: '9876543210',
        gymName: 'Test Gym',
        planName: 'Test Plan',
        startDate: '13 Dec 2025',
        expiryDate: '13 Jan 2026',
        accessCode: '123456',
        amount: '1000'
    };

    try {
        console.log('Generating invoice with wkhtmltopdf...');
        const pdfBuffer = await generateInvoicePdf(data);
        const outputPath = path.join(__dirname, 'test-invoice-wkhtml.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`Invoice generated successfully at: ${outputPath}`);
    } catch (error) {
        console.error('Failed to generate invoice:', error);
    }
};

testInvoice();
