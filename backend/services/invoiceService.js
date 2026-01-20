const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs').promises;

class InvoiceService {
  constructor() {
    this.browser = null;
    this.isInitialized = false;
  }

  async initialize() {
    if (this.isInitialized && this.browser) return;

    try {
      this.browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-accelerated-2d-canvas',
          '--no-first-run',
          '--no-zygote',
          '--disable-gpu'
        ]
      });
      this.isInitialized = true;
      console.log('Puppeteer initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Puppeteer:', error);
      throw error;
    }
  }

  async generateInvoiceHTML(invoiceData) {
    const {
      invoiceNumber,
      date,
      customer,
      order,
      payment,
      company = {
        name: 'TrackMyLaundry',
        address: '123 Laundry Street, Clean City, 12345',
        phone: '+91 98765 43210',
        email: 'contact@trackmylaundry.com',
        website: 'www.trackmylaundry.com'
      }
    } = invoiceData;

    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice #${invoiceNumber}</title>
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Arial', sans-serif;
                line-height: 1.6;
                color: #333;
                background: #fff;
            }
            
            .invoice-container {
                max-width: 800px;
                margin: 0 auto;
                padding: 40px;
                background: white;
                box-shadow: 0 0 20px rgba(0,0,0,0.1);
            }
            
            .header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 40px;
                padding-bottom: 20px;
                border-bottom: 3px solid #6b7cff;
            }
            
            .company-info h1 {
                color: #6b7cff;
                font-size: 28px;
                margin-bottom: 5px;
            }
            
            .company-info p {
                color: #666;
                font-size: 14px;
                margin-bottom: 2px;
            }
            
            .invoice-info {
                text-align: right;
            }
            
            .invoice-info h2 {
                color: #333;
                font-size: 24px;
                margin-bottom: 10px;
            }
            
            .invoice-info p {
                font-size: 14px;
                color: #666;
            }
            
            .billing-section {
                display: flex;
                justify-content: space-between;
                margin-bottom: 40px;
            }
            
            .billing-info {
                width: 45%;
            }
            
            .billing-info h3 {
                color: #333;
                margin-bottom: 10px;
                font-size: 16px;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            
            .billing-info p {
                margin-bottom: 5px;
                font-size: 14px;
            }
            
            .order-details {
                background: #f8f9ff;
                padding: 20px;
                border-radius: 8px;
                margin-bottom: 30px;
            }
            
            .order-details h3 {
                color: #6b7cff;
                margin-bottom: 15px;
                font-size: 18px;
            }
            
            .order-meta {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .order-meta-item {
                background: white;
                padding: 10px;
                border-radius: 4px;
                border-left: 3px solid #6b7cff;
            }
            
            .order-meta-item strong {
                display: block;
                color: #333;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .order-meta-item span {
                font-size: 14px;
                color: #666;
            }
            
            .items-table {
                width: 100%;
                border-collapse: collapse;
                margin-bottom: 30px;
                background: white;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            
            .items-table thead {
                background: #6b7cff;
                color: white;
            }
            
            .items-table th,
            .items-table td {
                padding: 15px;
                text-align: left;
                border-bottom: 1px solid #eee;
            }
            
            .items-table th {
                font-weight: 600;
                text-transform: uppercase;
                font-size: 12px;
                letter-spacing: 1px;
            }
            
            .items-table tbody tr:hover {
                background: #f8f9ff;
            }
            
            .items-table tbody tr:last-child td {
                border-bottom: none;
            }
            
            .text-right {
                text-align: right;
            }
            
            .text-center {
                text-align: center;
            }
            
            .total-section {
                float: right;
                width: 300px;
                background: #f8f9ff;
                padding: 20px;
                border-radius: 8px;
                border: 1px solid #e0e6ff;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                font-size: 14px;
            }
            
            .total-row.final {
                border-top: 2px solid #6b7cff;
                font-weight: bold;
                font-size: 18px;
                color: #6b7cff;
                margin-top: 10px;
                padding-top: 15px;
            }
            
            .payment-info {
                clear: both;
                margin-top: 40px;
                padding: 20px;
                background: #e8f5e8;
                border-radius: 8px;
                border-left: 5px solid #4caf50;
            }
            
            .payment-info h3 {
                color: #2e7d32;
                margin-bottom: 10px;
            }
            
            .payment-details {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .payment-detail strong {
                display: block;
                color: #2e7d32;
                font-size: 12px;
                text-transform: uppercase;
            }
            
            .status-badge {
                display: inline-block;
                padding: 4px 12px;
                border-radius: 20px;
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .status-completed {
                background: #e8f5e8;
                color: #2e7d32;
            }
            
            .status-pending {
                background: #fff3cd;
                color: #856404;
            }
            
            .footer {
                margin-top: 50px;
                text-align: center;
                padding-top: 20px;
                border-top: 1px solid #eee;
                color: #666;
                font-size: 12px;
            }
            
            .footer p {
                margin-bottom: 5px;
            }
            
            @media print {
                body {
                    -webkit-print-color-adjust: exact;
                }
                .invoice-container {
                    box-shadow: none;
                    padding: 20px;
                }
            }
        </style>
    </head>
    <body>
        <div class="invoice-container">
            <!-- Header -->
            <div class="header">
                <div class="company-info">
                    <h1>${company.name}</h1>
                    <p>${company.address}</p>
                    <p>Phone: ${company.phone}</p>
                    <p>Email: ${company.email}</p>
                    <p>Website: ${company.website}</p>
                </div>
                <div class="invoice-info">
                    <h2>INVOICE</h2>
                    <p><strong>Invoice #:</strong> ${invoiceNumber}</p>
                    <p><strong>Date:</strong> ${new Date(date).toLocaleDateString()}</p>
                    <p><strong>Order #:</strong> ${order.number}</p>
                </div>
            </div>
            
            <!-- Billing Information -->
            <div class="billing-section">
                <div class="billing-info">
                    <h3>Bill To:</h3>
                    <p><strong>${customer.name}</strong></p>
                    <p>${customer.email}</p>
                    <p>${customer.mobile}</p>
                </div>
                <div class="billing-info">
                    <h3>Service Details:</h3>
                    <p><strong>Service Type:</strong> ${order.serviceType || 'Standard Wash'}</p>
                    <p><strong>Pickup Date:</strong> ${order.pickup?.date ? new Date(order.pickup.date).toLocaleDateString() : 'N/A'}</p>
                    <p><strong>Delivery Date:</strong> ${order.delivery?.date ? new Date(order.delivery.date).toLocaleDateString() : 'N/A'}</p>
                </div>
            </div>
            
            <!-- Order Details -->
            <div class="order-details">
                <h3>Order Information</h3>
                <div class="order-meta">
                    <div class="order-meta-item">
                        <strong>Order Number</strong>
                        <span>${order.number}</span>
                    </div>
                    <div class="order-meta-item">
                        <strong>Status</strong>
                        <span class="status-badge ${order.status === 'Delivered' ? 'status-completed' : 'status-pending'}">${order.status || 'Completed'}</span>
                    </div>
                    <div class="order-meta-item">
                        <strong>Service Type</strong>
                        <span>${order.serviceType || 'Standard Wash'}</span>
                    </div>
                    <div class="order-meta-item">
                        <strong>Total Items</strong>
                        <span>${order.items?.reduce((sum, item) => sum + (item.quantity || 0), 0) || 0}</span>
                    </div>
                </div>
            </div>
            
            <!-- Items Table -->
            <table class="items-table">
                <thead>
                    <tr>
                        <th>Item Type</th>
                        <th>Service</th>
                        <th class="text-center">Quantity</th>
                        <th class="text-right">Rate</th>
                        <th class="text-right">Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${(order.items || []).map(item => `
                        <tr>
                            <td>${item.type || 'Item'}</td>
                            <td>${item.service || 'Standard'}</td>
                            <td class="text-center">${item.quantity || 1}</td>
                            <td class="text-right">₹${((item.price || 0) / (item.quantity || 1)).toFixed(2)}</td>
                            <td class="text-right">₹${(item.price || 0).toFixed(2)}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            
            <!-- Total Section -->
            <div class="total-section">
                <div class="total-row">
                    <span>Subtotal:</span>
                    <span>₹${(order.subtotal || order.total || 0).toFixed(2)}</span>
                </div>
                <div class="total-row">
                    <span>Tax (10%):</span>
                    <span>₹${(order.tax || (order.total || 0) * 0.1).toFixed(2)}</span>
                </div>
                ${order.discount ? `
                <div class="total-row">
                    <span>Discount:</span>
                    <span>-₹${order.discount.toFixed(2)}</span>
                </div>
                ` : ''}
                <div class="total-row final">
                    <span>Total Amount:</span>
                    <span>₹${(order.total || 0).toFixed(2)}</span>
                </div>
            </div>
            
            <!-- Payment Information -->
            <div class="payment-info">
                <h3>Payment Information</h3>
                <div class="payment-details">
                    <div class="payment-detail">
                        <strong>Payment Method</strong>
                        <span>${payment.method || 'Online Payment'}</span>
                    </div>
                    <div class="payment-detail">
                        <strong>Transaction ID</strong>
                        <span>${payment.transactionId || 'N/A'}</span>
                    </div>
                    <div class="payment-detail">
                        <strong>Payment Status</strong>
                        <span class="status-badge status-completed">PAID</span>
                    </div>
                    <div class="payment-detail">
                        <strong>Amount Paid</strong>
                        <span>₹${(payment.amount || order.total || 0).toFixed(2)}</span>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="footer">
                <p><strong>Thank you for choosing TrackMyLaundry!</strong></p>
                <p>For any queries, please contact us at ${company.email} or ${company.phone}</p>
                <p>Visit us at ${company.website}</p>
            </div>
        </div>
    </body>
    </html>
    `;
  }

  async generateInvoicePDF(invoiceData) {
    try {
      await this.initialize();

      if (!this.browser) {
        throw new Error('Puppeteer browser not initialized');
      }

      const page = await this.browser.newPage();
      
      try {
        const html = await this.generateInvoiceHTML(invoiceData);
        
        await page.setContent(html, { 
          waitUntil: 'networkidle0',
          timeout: 30000 
        });

        // Generate PDF
        const pdf = await page.pdf({
          format: 'A4',
          printBackground: true,
          margin: {
            top: '20px',
            right: '20px',
            bottom: '20px',
            left: '20px',
          },
          displayHeaderFooter: false,
        });

        return pdf;
      } finally {
        await page.close();
      }
    } catch (error) {
      console.error('Error generating PDF invoice:', error);
      throw error;
    }
  }

  async saveInvoicePDF(invoiceData, filePath) {
    try {
      const pdf = await this.generateInvoicePDF(invoiceData);
      await fs.writeFile(filePath, pdf);
      return filePath;
    } catch (error) {
      console.error('Error saving PDF invoice:', error);
      throw error;
    }
  }

  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.isInitialized = false;
    }
  }

  // Create invoice directory if it doesn't exist
  async ensureInvoiceDirectory() {
    const invoiceDir = path.join(process.cwd(), 'invoices');
    try {
      await fs.access(invoiceDir);
    } catch {
      await fs.mkdir(invoiceDir, { recursive: true });
    }
    return invoiceDir;
  }

  // Generate invoice file path
  generateInvoiceFilePath(invoiceNumber) {
    const timestamp = new Date().toISOString().split('T')[0];
    return path.join(process.cwd(), 'invoices', `invoice-${invoiceNumber}-${timestamp}.pdf`);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Shutting down invoice service...');
  await invoiceService.cleanup();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Shutting down invoice service...');
  await invoiceService.cleanup();
  process.exit(0);
});

// Export singleton instance
const invoiceService = new InvoiceService();
module.exports = invoiceService;
