import { generateInvoicePdf } from '../services/invoice.service';
import { uploadToS3 } from '../services/storage.service';
import dotenv from 'dotenv';

dotenv.config();

const testInvoiceUpload = async () => {
    const data = {
        invoiceNumber: 'INV-TEST-UPLOAD-' + Date.now(),
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
        console.log('Generating invoice...');
        const pdfBuffer = await generateInvoicePdf(data);
        console.log('Invoice generated. Buffer size:', pdfBuffer.length);

        console.log('Uploading to S3...');
        const filename = `Test_Invoice_${data.invoiceNumber}.pdf`;
        const url = await uploadToS3(pdfBuffer, filename, 'application/pdf');
        console.log(`Invoice uploaded successfully to: ${url}`);
    } catch (error) {
        console.error('Failed to generate/upload invoice:', error);
    }
};

testInvoiceUpload();
