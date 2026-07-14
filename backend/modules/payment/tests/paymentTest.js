import paymentService, { mockTransactions } from '../services/paymentService.js';
import invoiceGenerator from '../utils/invoiceGenerator.js';
import { mockUsers, mockProperties } from '../../../config/inMemoryDb.js';

let passed = 0;
let failed = 0;

const assertEqual = (actual, expected, msg) => {
  if (actual === expected) {
    console.log(`  ✓ [PASS] ${msg}`);
    passed++;
  } else {
    console.error(`  ❌ [FAIL] ${msg} | Expected: ${expected} | Got: ${actual}`);
    failed++;
  }
};

const runTests = async () => {
  console.log('🚀 [STARTING PAYMENT SYSTEM INTEGRATION TESTS]\n');

  // Clear and seed mock databases
  mockTransactions.length = 0;
  mockProperties.length = 0;
  mockUsers.length = 0;

  const mockTenantId = 'mock_tenant_id_123';
  const mockPropertyId = 'mock_property_id_123';
  const amount = 5250; // Rent + Platform convenience charge

  // Seed mock property and tenant
  mockProperties.push({
    _id: mockPropertyId,
    title: 'Test Stay Pune',
    ownerId: 'mock_owner_id_123'
  });
  mockUsers.push({
    _id: mockTenantId,
    name: 'John Doe',
    email: 'john.doe@test.com'
  });

  // 1. Test Order Initiation Flow
  console.log('--- testing Order Creation ---');
  const order = await paymentService.createOrder({
    userId: mockTenantId,
    propertyId: mockPropertyId,
    amount,
    paymentType: 'booking_deposit'
  });

  assertEqual(typeof order.orderId, 'string', 'Should return orderId string');
  assertEqual(order.amount, amount * 100, 'Should convert amount to paise');
  assertEqual(mockTransactions.length, 1, 'Mock database should record one transaction');
  assertEqual(mockTransactions[0].status, 'pending', 'Initiated transaction status should be pending');
  assertEqual(mockTransactions[0].transactionId.startsWith('TXN-'), true, 'Should generate custom TXN reference hash');

  // 2. Test Signature Verification Flow
  console.log('\n--- testing Payment Verification ---');
  const completedTxn = await paymentService.verifyPayment({
    userId: mockTenantId,
    orderId: order.orderId,
    paymentId: 'pay_mock_1783968212',
    signature: 'mock_signature'
  });

  assertEqual(completedTxn.status, 'completed', 'Verified transaction status should transition to completed');
  assertEqual(completedTxn.paymentGatewayId, 'pay_mock_1783968212', 'Should save payment gateway reference');
  assertEqual(typeof completedTxn.invoiceId, 'string', 'Should auto-generate Invoice ID');
  assertEqual(completedTxn.invoiceId.startsWith('INV-'), true, 'Invoice reference should follow INV- format');

  // 3. Test HTML Invoice format builder
  console.log('\n--- testing Invoice & Receipt formatting ---');
  const invoiceHtml = invoiceGenerator.formatInvoice(completedTxn);
  const receiptHtml = invoiceGenerator.formatReceipt(completedTxn);

  assertEqual(invoiceHtml.includes('INVOICE'), true, 'Invoice template should contain title header');
  assertEqual(invoiceHtml.includes(completedTxn.invoiceId), true, 'Invoice template should print invoice reference');
  assertEqual(receiptHtml.includes('Receipt'), true, 'Receipt template should contain Receipt title');

  // 4. Test Analytics aggregation
  console.log('\n--- testing Payment Analytics stats ---');
  const stats = await paymentService.getAnalytics();
  assertEqual(stats.totalRevenue, amount, 'Gross revenue should aggregate completed transaction totals');
  assertEqual(stats.completedCount, 1, 'Completed transactions count should be 1');

  // Summary
  console.log('\n======================================================');
  console.log(`[TESTS COMPLETED] Passed: ${passed} | Failed: ${failed}`);
  console.log('======================================================');

  if (failed > 0) {
    process.exit(1);
  }
};

runTests().catch(err => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
