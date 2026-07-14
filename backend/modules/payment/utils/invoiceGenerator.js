export const invoiceGenerator = {
  /**
   * Format styled HTML Invoice
   */
  formatInvoice: (txn) => {
    const formattedDate = new Date(txn.timestamp || txn.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const tenantName = txn.userId?.name || 'Valued Tenant';
    const tenantEmail = txn.userId?.email || 'N/A';
    const ownerName = txn.ownerId?.name || 'Property Host';
    const propertyTitle = txn.propertyId?.title || 'StayMate Rental Property';
    const taxAmount = Math.round(txn.amount * 0.18); // 18% Tax placeholder
    const baseAmount = txn.amount - taxAmount;

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Invoice ${txn.invoiceId || 'INV-TEMP'}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #1e293b; padding: 40px; margin: 0; background-color: #ffffff; }
    .header { display: flex; justify-content: space-between; border-b: 2px solid #e2e8f0; padding-bottom: 24px; }
    .logo { font-size: 24px; font-weight: 800; color: #0e8fe3; }
    .title { text-align: right; }
    .title h1 { margin: 0; font-size: 28px; font-weight: 900; color: #0f172a; }
    .title p { margin: 4px 0 0 0; font-size: 12px; color: #64748b; font-weight: 600; }
    .details { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-top: 32px; font-size: 13px; }
    .block h3 { margin: 0 0 8px 0; font-size: 11px; text-transform: uppercase; tracking: 0.05em; color: #64748b; font-weight: 700; }
    .block p { margin: 4px 0; line-height: 1.4; font-weight: 600; }
    .table { width: 100%; border-collapse: collapse; margin-top: 40px; }
    .table th { border-bottom: 2px solid #cbd5e1; text-align: left; padding: 12px 8px; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; }
    .table td { border-bottom: 1px solid #e2e8f0; padding: 16px 8px; font-size: 13px; font-weight: 600; }
    .totals { margin-top: 32px; display: flex; justify-content: flex-end; }
    .totals-table { width: 280px; border-collapse: collapse; }
    .totals-table td { padding: 8px; font-size: 13px; font-weight: 600; }
    .totals-table tr.grand-total { border-top: 2px solid #cbd5e1; font-size: 16px; font-weight: 800; }
    .footer { border-top: 1px solid #e2e8f0; margin-top: 60px; padding-top: 24px; text-align: center; font-size: 11px; color: #64748b; font-weight: 600; }
    @media print {
      body { padding: 0; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">StayMate Payments</div>
    <div class="title">
      <h1>INVOICE</h1>
      <p>Invoice #: ${txn.invoiceId || 'N/A'}</p>
      <p>Date: ${formattedDate}</p>
    </div>
  </div>

  <div class="details">
    <div class="block">
      <h3>Billing To (Tenant)</h3>
      <p>${tenantName}</p>
      <p>Email: ${tenantEmail}</p>
    </div>
    <div class="block" style="text-align: right;">
      <h3>Issued By (Landlord)</h3>
      <p>${ownerName}</p>
      <p>Platform: StayMate Operations</p>
    </div>
  </div>

  <table class="table">
    <thead>
      <tr>
        <th>Description</th>
        <th>Payment Type</th>
        <th>Gateway Method</th>
        <th style="text-align: right;">Amount</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>
          Booking Deposit for property listing:<br>
          <strong style="color: #0f172a;">${propertyTitle}</strong>
        </td>
        <td style="text-transform: capitalize;">${txn.paymentType.replace(/_/g, ' ')}</td>
        <td style="text-transform: uppercase;">${txn.method || 'UPI'}</td>
        <td style="text-align: right;">₹${baseAmount.toLocaleString('en-IN')}.00</td>
      </tr>
    </tbody>
  </table>

  <div class="totals">
    <table class="totals-table">
      <tr>
        <td style="color: #64748b;">Subtotal</td>
        <td style="text-align: right;">₹${baseAmount.toLocaleString('en-IN')}.00</td>
      </tr>
      <tr>
        <td style="color: #64748b;">Tax (GST 18% Placeholder)</td>
        <td style="text-align: right;">₹${taxAmount.toLocaleString('en-IN')}.00</td>
      </tr>
      <tr class="grand-total">
        <td>Total Paid</td>
        <td style="text-align: right; color: #0e8fe3;">₹${txn.amount.toLocaleString('en-IN')}.00</td>
      </tr>
    </table>
  </div>

  <div class="footer">
    <p>This is a computer-generated document. No signature is required.</p>
    <p>Thank you for booking your stay using StayMate!</p>
  </div>
  <script>
    window.addEventListener('message', (event) => {
      if (event.data === 'print') {
        window.focus();
        window.print();
      }
    });
  </script>
</body>
</html>
    `;
  },

  /**
   * Format styled HTML Receipt
   */
  formatReceipt: (txn) => {
    const formattedDate = new Date(txn.timestamp || txn.createdAt).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });

    const tenantName = txn.userId?.name || 'Valued Tenant';
    const propertyTitle = txn.propertyId?.title || 'StayMate Rental Property';

    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Payment Receipt ${txn.receiptNumber || 'RCPT-TEMP'}</title>
  <style>
    body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; text-align: center; color: #1e293b; background-color: #f8fafc; }
    .receipt-box { max-width: 480px; margin: 0 auto; background: #ffffff; padding: 40px; border-radius: 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05); text-align: left; }
    .logo { text-align: center; font-size: 20px; font-weight: 800; color: #0e8fe3; margin-bottom: 24px; }
    .success-icon { width: 56px; height: 56px; background-color: #ecfdf5; color: #10b981; border-radius: 50%; display: flex; items-center: center; justify-content: center; margin: 0 auto 16px auto; font-size: 28px; line-height: 56px; text-align: center; }
    .heading { text-align: center; margin-bottom: 32px; }
    .heading h2 { margin: 0; font-size: 20px; font-weight: 800; color: #0f172a; }
    .heading p { margin: 4px 0 0 0; font-size: 11px; text-transform: uppercase; color: #64748b; font-weight: 700; tracking: 0.05em; }
    .item { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px dashed #e2e8f0; font-size: 13px; font-weight: 600; }
    .item .label { color: #64748b; }
    .item .value { color: #0f172a; text-align: right; max-w: 220px; word-break: break-all; }
    .amount-row { display: flex; justify-content: space-between; padding: 20px 0; font-size: 16px; font-weight: 800; border-bottom: 2px solid #cbd5e1; }
    .footer { text-align: center; margin-top: 32px; font-size: 11px; color: #64748b; font-weight: 600; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="logo">StayMate Payments</div>
    
    <div class="success-icon">✓</div>
    
    <div class="heading">
      <h2>Payment Receipt</h2>
      <p>Receipt Reference: ${txn.receiptNumber || 'N/A'}</p>
    </div>

    <div class="item">
      <span class="label">Payment Date</span>
      <span class="value">${formattedDate}</span>
    </div>
    
    <div class="item">
      <span class="label">Billed To (Tenant)</span>
      <span class="value">${tenantName}</span>
    </div>

    <div class="item">
      <span class="label">Stay Location</span>
      <span class="value">${propertyTitle}</span>
    </div>

    <div class="item">
      <span class="label">Gateway / Type</span>
      <span class="value" style="text-transform: capitalize;">${txn.gateway} (${txn.paymentType.replace(/_/g, ' ')})</span>
    </div>

    <div class="item">
      <span class="label">Gateway Transaction Reference</span>
      <span class="value" style="font-family: monospace; font-size: 11px;">${txn.paymentGatewayId || 'N/A'}</span>
    </div>

    <div class="amount-row">
      <span>Amount Paid</span>
      <span style="color: #10b981;">₹${txn.amount.toLocaleString('en-IN')}.00</span>
    </div>

    <div class="footer">
      <p>A confirmation copy has been sent to your registered email and host.</p>
      <p>Thank you for using StayMate!</p>
    </div>
  </div>
  <script>
    window.addEventListener('message', (event) => {
      if (event.data === 'print') {
        window.focus();
        window.print();
      }
    });
  </script>
</body>
</html>
    `;
  }
};

export default invoiceGenerator;
