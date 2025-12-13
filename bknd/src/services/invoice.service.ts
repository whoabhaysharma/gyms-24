import puppeteer from 'puppeteer';
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

const HTML_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gyms24 Invoice - A4</title>
    <style>
        /* General Styling */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            background-color: #fff; /* White for PDF */
            color: #333;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
        }

        /* A4 Page Container */
        .invoice-box {
            background-color: #fff;
            width: 100%;        /* Full width for PDF */
            /* min-height: 297mm; */ /* Let content flow */
            margin: 0 auto;
            padding: 40px;       /* Internal padding */
            box-sizing: border-box;
            position: relative;
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
        
        /* Top Right Styling */
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
            margin-top: 8px;
            font-size: 16px;
            color: #555;
        }
        
        .meta-divider {
            color: #ddd;
            margin: 0 8px;
        }

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
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
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
            /* Positioned at bottom of A4 page */
            position: absolute;
            bottom: 40px;
            left: 0;
            right: 0;
            width: 100%;
            text-align: center;
            font-size: 12px;
            color: #999;
            border-top: 1px solid #eee;
            padding-top: 20px;
        }
        
        .footer a { color: #333; text-decoration: none; font-weight: bold; }
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
                        <span style="font-weight: bold; color: #000;">#{{invoiceNumber}}</span>
                        <span class="meta-divider">|</span>
                        <span>{{date}}</span>
                    </div>
                </td>
            </tr>
        </table>

        <div style="margin-bottom: 20px;">
            <div class="text-light" style="margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Billed To User</div>
            <div style="font-size: 20px; font-weight: bold;">{{userName}}</div>
            <div style="font-size: 16px; margin-top: 2px;">+91 {{userMobile}}</div>
        </div>

        <div class="member-card">
            <div class="card-details">
                <div>
                    <div class="gym-name">{{gymName}}</div>
                    <div class="plan-name">{{planName}}</div>
                </div>
                
                <div class="date-row">
                    <div class="date-box">
                        <label>Start Date</label>
                        <div>{{startDate}}</div>
                    </div>
                    <div class="date-box">
                        <label>Expiry Date</label>
                        <div>{{expiryDate}}</div>
                    </div>
                </div>
            </div>

            <div class="card-code-section">
                <div class="code-label">Access Code</div>
                <div class="access-code">{{accessCode}}</div>
                <div class="scan-instruction">Show at Reception</div>
            </div>
        </div>

        <div class="total-row">
            Paid Amount: ₹{{amount}}
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
    logger.info('[InvoiceService] Generating invoice PDF with Puppeteer', { invoiceNumber: data.invoiceNumber });

    let browser;
    try {
        // Replace placeholders
        let htmlContent = HTML_TEMPLATE
            .replace('{{invoiceNumber}}', data.invoiceNumber)
            .replace('{{date}}', data.date)
            .replace('{{userName}}', data.userName)
            .replace('{{userMobile}}', data.userMobile)
            .replace('{{gymName}}', data.gymName)
            .replace('{{planName}}', data.planName)
            .replace('{{startDate}}', data.startDate)
            .replace('{{expiryDate}}', data.expiryDate)
            .replace('{{accessCode}}', data.accessCode)
            .replace('{{amount}}', data.amount);

        // Launch Puppeteer
        // Use system chromium if available (for Docker/Alpine), otherwise use default (bundled)
        const executablePath = process.env.PUPPETEER_EXECUTABLE_PATH || undefined;

        browser = await puppeteer.launch({
            executablePath,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
            headless: true
        });

        const page = await browser.newPage();
        await page.setContent(htmlContent, { waitUntil: 'networkidle0' });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '0px',
                right: '0px',
                bottom: '0px',
                left: '0px'
            }
        });

        return Buffer.from(pdfBuffer);

    } catch (error: any) {
        logger.error('[InvoiceService] Error generating invoice PDF', { error: error.message });
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
