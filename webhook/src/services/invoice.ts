import puppeteer from 'puppeteer-core';
import { logWithContext } from '../utils/logger';

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

const getHtmlTemplate = (data: InvoiceData) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gyms24 Invoice</title>
    <style>
        /* General Styling */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #f4f4f4;
            color: #333;
            margin: 0;
            padding: 20px;
        }

        .invoice-box {
            max-width: 800px;
            margin: auto;
            padding: 40px;
            border: 1px solid #eee;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
            background-color: #fff;
            font-size: 16px;
            line-height: 24px;
        }

        /* --- LOGO STYLING --- */
        .logo-wrapper {
            display: inline-flex;
            align-items: baseline; 
            margin-bottom: 25px;
            text-decoration: none;
        }

        .logo-text {
            font-family: 'Arial Black', 'Arial Bold', sans-serif;
            font-size: 38px;
            font-weight: 900;
            color: #1a1a1a;
            letter-spacing: -1.5px;
            line-height: 1;
        }

        .logo-circle {
            display: inline-block;
            width: 10px; 
            height: 10px;
            background-color: #39FF14; /* Neon Green */
            border-radius: 50%;
            margin-left: 5px; 
            margin-bottom: 2px;
        }

        /* Header Layout */
        .header-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
        }

        .header-table td {
            vertical-align: top;
        }

        .text-light { color: #777; font-size: 14px; }
        
        /* --- NEW TOP RIGHT STYLING (TIGHTER) --- */
        .header-right {
            text-align: right;
        }

        .invoice-label {
            font-size: 36px;
            font-weight: 800;
            color: #1a1a1a;
            letter-spacing: 1px;
            margin: 0;
            line-height: 1;
        }

        .invoice-meta {
            margin-top: 8px; /* Small gap only */
            font-size: 16px;
            color: #555;
        }
        
        .meta-divider {
            color: #ddd;
            margin: 0 8px;
        }
        /* -------------------------------------- */

        /* --- SUBSCRIPTION CARD DESIGN --- */
        .member-card {
            display: flex; 
            border: 2px solid #000;
            border-radius: 12px;
            overflow: hidden;
            margin-top: 30px;
            margin-bottom: 10px;
            height: 220px; 
        }

        .card-details {
            width: 65%;
            padding: 25px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .gym-name {
            font-size: 22px;
            font-weight: 800;
            text-transform: uppercase;
            color: #000;
            line-height: 1.2;
        }

        .plan-name {
            font-size: 16px;
            color: #555;
            margin-top: 5px;
            border-bottom: 1px solid #eee;
            padding-bottom: 15px;
            margin-bottom: 15px;
        }

        .date-row {
            display: flex;
            gap: 40px;
        }

        .date-box label {
            font-size: 11px;
            text-transform: uppercase;
            color: #888;
            font-weight: 700;
            letter-spacing: 0.5px;
            display: block;
            margin-bottom: 4px;
        }

        .date-box div {
            font-size: 16px;
            font-weight: bold;
            color: #000;
        }

        /* Access Code Section */
        .card-code-section {
            width: 35%;
            background-color: #39FF14; /* Brand Neon Green */
            color: #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            text-align: center;
            border-left: 2px solid #000;
        }

        .code-label {
            font-size: 14px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 10px;
            opacity: 0.8;
        }

        .access-code {
            font-family: 'Courier New', Courier, monospace;
            font-size: 36px;
            font-weight: 900;
            letter-spacing: 2px;
            background: #fff;
            padding: 10px 15px;
            border: 2px solid #000;
            box-shadow: 4px 4px 0px rgba(0,0,0,0.2);
            transform: rotate(-2deg); 
        }
        
        .scan-instruction {
            margin-top: 15px;
            font-size: 11px;
            font-weight: bold;
        }

        /* Totals */
        .total-row {
            text-align: right;
            margin-top: 15px;
            font-size: 20px;
            font-weight: bold;
            border-top: 1px solid #eee;
            padding-top: 15px;
        }

        /* Footer */
        .footer {
            margin-top: 60px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            font-size: 12px;
            color: #999;
            text-align: center;
        }
        
        .footer a { color: #333; text-decoration: none; font-weight: bold; }

        @media print {
            .member-card { border: 2px solid #000; -webkit-print-color-adjust: exact; }
            .card-code-section { background-color: #39FF14 !important; -webkit-print-color-adjust: exact; }
        }
    </style>
</head>
<body>

    <div class="invoice-box">
        <table class="header-table">
            <tr>
                <td>
                    <div class="logo-wrapper">
                        <span class="logo-text">Gyms24</span>
                        <span class="logo-circle"></span>
                    </div>
                    
                    <div class="text-light">
                        <strong>Online Booking Platform</strong><br>
                        Email: help@gyms24.in<br>
                        Web: www.gyms24.in
                    </div>
                </td>
                
                <td class="header-right">
                    <h1 class="invoice-label">INVOICE</h1>
                    <div class="invoice-meta">
                        <span style="font-weight: bold; color: #000;">#${data.invoiceNumber}</span>
                        <span class="meta-divider">|</span>
                        <span>${data.date}</span>
                    </div>
                </td>
            </tr>
        </table>

        <div style="margin-bottom: 20px;">
            <div class="text-light" style="margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Billed To User</div>
            <div style="font-size: 20px; font-weight: bold;">${data.userName}</div>
            <div style="font-size: 16px; margin-top: 2px;">+91 ${data.userMobile}</div>
        </div>

        <div class="member-card">
            <div class="card-details">
                <div>
                    <div class="gym-name">${data.gymName}</div>
                    <div class="plan-name">${data.planName}</div>
                </div>
                
                <div class="date-row">
                    <div class="date-box">
                        <label>Start Date</label>
                        <div>${data.startDate}</div>
                    </div>
                    <div class="date-box">
                        <label>Expiry Date</label>
                        <div>${data.expiryDate}</div>
                    </div>
                </div>
            </div>

            <div class="card-code-section">
                <div class="code-label">Access Code</div>
                <div class="access-code">${data.accessCode}</div>
                <div class="scan-instruction">Show at Reception</div>
            </div>
        </div>

        <div class="total-row">
            Paid Amount: ₹${data.amount}
        </div>

        <div class="footer">
            <p>Thank you for choosing Gyms24.</p>
            <p>Need help? Email <strong>help@gyms24.in</strong> or visit <a href="https://www.gyms24.in">www.gyms24.in</a></p>
        </div>
    </div>

</body>
</html>
`;

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
    logWithContext('InvoiceService', 'Generating invoice PDF', { invoiceNumber: data.invoiceNumber });

    let browser;
    try {
        browser = await puppeteer.launch({
            executablePath: '/usr/bin/chromium-browser',
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true
        });

        const page = await browser.newPage();
        const html = getHtmlTemplate(data);

        await page.setContent(html, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '20px',
                right: '20px',
                bottom: '20px',
                left: '20px'
            }
        });

        logWithContext('InvoiceService', 'Invoice PDF generated successfully');
        return Buffer.from(pdfBuffer);
    } catch (error) {
        logWithContext('InvoiceService', 'Error generating invoice PDF', { error }, 'error');
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
