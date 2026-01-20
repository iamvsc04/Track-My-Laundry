const Order = require("../models/Order");
const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

// Helper to format currency
const formatCurrency = (amount) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
};

exports.generateDailyReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const start = startDate ? new Date(startDate) : new Date();
    start.setHours(0, 0, 0, 0);

    const end = endDate ? new Date(endDate) : new Date();
    end.setHours(23, 59, 59, 999);

    // Fetch orders
    const orders = await Order.find({
      createdAt: { $gte: start, $lte: end },
    }).populate("user", "name email");

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
    const completedOrders = orders.filter(o => o.status === 'Delivered').length;
    
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {});

    // Generate HTML content
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Helvetica', sans-serif; padding: 40px; }
          h1 { color: #333; text-align: center; }
          .header { margin-bottom: 30px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
          .stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-bottom: 40px; }
          .stat-card { background: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center; }
          .stat-value { font-size: 24px; font-weight: bold; color: #2c3e50; }
          .stat-label { color: #7f8c8d; font-size: 14px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
          th { background-color: #f8f9fa; color: #2c3e50; }
          .status { padding: 4px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>TrackMyLaundry - Daily Report</h1>
          <p style="text-align: center; color: #666;">
            Period: ${start.toLocaleDateString()} - ${end.toLocaleDateString()}
          </p>
        </div>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-value">${totalOrders}</div>
            <div class="stat-label">Total Orders</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${formatCurrency(totalRevenue)}</div>
            <div class="stat-label">Total Revenue</div>
          </div>
          <div class="stat-card">
            <div class="stat-value">${completedOrders}</div>
            <div class="stat-label">Completed Orders</div>
          </div>
        </div>

        <h3>Order Status Breakdown</h3>
        <div class="stats-grid">
          ${Object.entries(statusCounts).map(([status, count]) => `
            <div class="stat-card">
              <div class="stat-value">${count}</div>
              <div class="stat-label">${status}</div>
            </div>
          `).join('')}
        </div>

        <h3>Order List</h3>
        <table>
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Date</th>
              <th>Status</th>
              <th>Amount</th>
            </tr>
          </thead>
          <tbody>
            ${orders.map(order => `
              <tr>
                <td>${order.orderNumber}</td>
                <td>${order.user ? order.user.name : 'Guest'}</td>
                <td>${new Date(order.createdAt).toLocaleTimeString()}</td>
                <td><span class="status">${order.status}</span></td>
                <td>${formatCurrency(order.totalAmount)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </body>
      </html>
    `;

    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox'] 
    });
    const page = await browser.newPage();
    await page.setContent(htmlContent);
    
    const pdfBuffer = await page.pdf({ 
      format: "A4",
      printBackground: true,
      margin: { top: "20px", right: "20px", bottom: "20px", left: "20px" } 
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Length": pdfBuffer.length,
      "Content-Disposition": `attachment; filename="report-${start.toLocaleDateString().replace(/\//g, '-')}.pdf"`,
    });

    res.send(pdfBuffer);

  } catch (error) {
    console.error("Report generation error:", error);
    res.status(500).json({ success: false, message: "Failed to generate report" });
  }
};
