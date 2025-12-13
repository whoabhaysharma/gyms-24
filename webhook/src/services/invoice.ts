import PdfPrinter from 'pdfmake';
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

const fonts = {
    Roboto: {
        normal: 'Helvetica',
        bold: 'Helvetica-Bold',
        italics: 'Helvetica-Oblique',
        bolditalics: 'Helvetica-BoldOblique'
    },
    Courier: {
        normal: 'Courier',
        bold: 'Courier-Bold',
        italics: 'Courier-Oblique',
        bolditalics: 'Courier-BoldOblique'
    }
};

const printer = new PdfPrinter(fonts);

export const generateInvoicePdf = async (data: InvoiceData): Promise<Buffer> => {
    logWithContext('InvoiceService', 'Generating invoice PDF with PDFMake', { invoiceNumber: data.invoiceNumber });

    try {
        const docDefinition: any = {
            content: [
                // Header
                {
                    columns: [
                        {
                            stack: [
                                {
                                    text: [
                                        { text: 'Gyms24', fontSize: 28, bold: true, color: '#1a1a1a' },
                                        { text: ' ●', color: '#39FF14', fontSize: 20 } // Neon Green Dot
                                    ]
                                },
                                {
                                    text: [
                                        { text: 'Online Booking Platform\n', bold: true },
                                        'Email: help@gyms24.in\n',
                                        'Web: www.gyms24.in'
                                    ],
                                    color: '#777',
                                    fontSize: 10,
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        },
                        {
                            stack: [
                                { text: 'INVOICE', fontSize: 24, bold: true, alignment: 'right' },
                                {
                                    text: [
                                        { text: `#${data.invoiceNumber}`, bold: true, color: '#000' },
                                        { text: ' | ', color: '#ddd' },
                                        { text: data.date }
                                    ],
                                    alignment: 'right',
                                    color: '#555',
                                    fontSize: 12,
                                    margin: [0, 5, 0, 0]
                                }
                            ]
                        }
                    ],
                    margin: [0, 0, 0, 30]
                },

                // Billed To
                {
                    stack: [
                        { text: 'BILLED TO USER', fontSize: 9, bold: true, color: '#777' },
                        { text: data.userName, fontSize: 16, bold: true, margin: [0, 2, 0, 0] },
                        { text: `+91 ${data.userMobile}`, fontSize: 12, margin: [0, 2, 0, 0] }
                    ],
                    margin: [0, 0, 0, 20]
                },

                // Member Card (Subscription Details)
                {
                    table: {
                        widths: ['65%', '35%'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: data.gymName.toUpperCase(), fontSize: 16, bold: true },
                                        { text: data.planName, color: '#555', margin: [0, 5, 0, 10] },
                                        {
                                            canvas: [{ type: 'line', x1: 0, y1: 0, x2: 280, y2: 0, lineWidth: 1, lineColor: '#eee' }],
                                            margin: [0, 0, 0, 10]
                                        },
                                        {
                                            columns: [
                                                {
                                                    stack: [
                                                        { text: 'START DATE', fontSize: 8, bold: true, color: '#888' },
                                                        { text: data.startDate, fontSize: 12, bold: true }
                                                    ]
                                                },
                                                {
                                                    stack: [
                                                        { text: 'EXPIRY DATE', fontSize: 8, bold: true, color: '#888' },
                                                        { text: data.expiryDate, fontSize: 12, bold: true }
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                    margin: [15, 15, 15, 15],
                                    fillColor: '#fff',
                                    border: [true, true, false, true] // Left, Top, Right, Bottom
                                },
                                {
                                    stack: [
                                        { text: 'ACCESS CODE', fontSize: 10, bold: true, opacity: 0.8, margin: [0, 0, 0, 5] },
                                        {
                                            text: data.accessCode,
                                            fontSize: 24,
                                            bold: true,
                                            font: 'Courier', // Monospace look
                                            background: '#fff',
                                            color: '#000',
                                            decoration: 'underline', // Slight emphasis
                                            margin: [0, 5, 0, 5]
                                        },
                                        { text: 'Show at Reception', fontSize: 9, bold: true }
                                    ],
                                    alignment: 'center',
                                    margin: [0, 35, 0, 0], // Center vertically roughly
                                    fillColor: '#39FF14', // Neon Green
                                    border: [false, true, true, true]
                                }
                            ]
                        ]
                    },
                    layout: {
                        hLineWidth: (i: number) => 2,
                        vLineWidth: (i: number) => 2,
                        hLineColor: (i: number) => '#000',
                        vLineColor: (i: number) => '#000',
                    },
                    margin: [0, 10, 0, 10]
                },

                // Totals
                {
                    text: [
                        { text: 'Paid Amount: ', bold: true },
                        { text: `₹${data.amount}`, fontSize: 16, bold: true }
                    ],
                    alignment: 'right',
                    margin: [0, 10, 0, 0]
                },

                // Footer
                {
                    stack: [
                        { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#eee' }], margin: [0, 40, 0, 10] },
                        { text: 'Thank you for choosing Gyms24.', alignment: 'center', color: '#999', fontSize: 10 },
                        { text: 'Need help? Email help@gyms24.in or visit www.gyms24.in', alignment: 'center', color: '#999', fontSize: 10, margin: [0, 2, 0, 0] }
                    ]
                }
            ],
            defaultStyle: {
                font: 'Roboto',
                fontSize: 12,
                lineHeight: 1.2
            }
        };

        return new Promise((resolve, reject) => {
            const pdfDoc = printer.createPdfKitDocument(docDefinition);
            const chunks: any[] = [];
            pdfDoc.on('data', (chunk: any) => chunks.push(chunk));
            pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
            pdfDoc.on('error', (err: any) => reject(err));
            pdfDoc.end();
        });

    } catch (error) {
        logWithContext('InvoiceService', 'Error generating invoice PDF', { error }, 'error');
        throw error;
    }
};
