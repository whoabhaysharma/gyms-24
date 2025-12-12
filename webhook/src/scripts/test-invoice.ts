import { generateInvoicePdf } from '../services/invoice';
import fs from 'fs';
import path from 'path';

const testInvoice = async () => {
    const data = {
        invoiceNumber: 'INV-TEST-001',
        date: '12 Dec 2025',
        userName: 'Abhay Sharma',
        userMobile: '9876543210',
        gymName: 'Gold\'s Gym',
        planName: 'Premium Monthly',
        startDate: '12 Dec 2025',
        expiryDate: '12 Jan 2026',
        accessCode: '123456',
        amount: '1500'
    };

    try {
        console.log('Generating invoice...');
        const pdfBuffer = await generateInvoicePdf(data);
        const outputPath = path.join(__dirname, 'test-invoice.pdf');
        fs.writeFileSync(outputPath, pdfBuffer);
        console.log(`Invoice generated successfully at: ${outputPath}`);
    } catch (error) {
        console.error('Failed to generate invoice:', error);
    }
};

testInvoice();
