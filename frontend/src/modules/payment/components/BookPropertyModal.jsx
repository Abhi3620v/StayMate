import React, { useState } from 'react';
import { usePayment } from '../context/PaymentContext';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { X, CreditCard, ShieldCheck, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export const BookPropertyModal = ({ property, onClose, onSuccess }) => {
  const { initiateOrder, verifySignature } = usePayment();
  const [loading, setLoading] = useState(false);
  const [mockOrderData, setMockOrderData] = useState(null);

  const rent = property.pricing?.rent || 5000;
  const deposit = Math.round(rent * 1.5); // Mock security deposit
  const serviceFee = 250; // Platform fee
  const totalAmount = deposit + serviceFee;

  const handleCheckoutSubmit = async () => {
    setLoading(true);
    try {
      // 1. Fetch order details from server
      const order = await initiateOrder(property._id, totalAmount, 'booking_deposit');
      
      // 2. Determine if Razorpay script exists (Live Checkout)
      if (window.Razorpay && order.keyId !== 'mock_key_id') {
        const options = {
          key: order.keyId,
          amount: order.amount,
          currency: order.currency,
          name: 'StayMate Bookings',
          description: `Booking Deposit for ${property.title}`,
          order_id: order.orderId,
          handler: async (response) => {
            try {
              await verifySignature(
                order.orderId,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
              onSuccess();
              onClose();
            } catch (err) {
              toast.error('Payment verification failed.');
            }
          },
          prefill: {
            name: 'StayMate User',
            email: 'tenant@staymate.com'
          },
          theme: {
            color: '#0e8fe3'
          }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // 3. Fallback to developer Mock Panel
        setMockOrderData(order);
      }
    } catch (err) {
      toast.error('Failed to initialize checkout.');
    } finally {
      setLoading(false);
    }
  };

  const handleMockSuccess = async () => {
    if (!mockOrderData) return;
    setLoading(true);
    try {
      const mockPaymentId = `pay_mock_${Math.random().toString(36).substr(2, 9)}`;
      const mockSignature = `mock_sig_${Math.random().toString(36).substr(2, 9)}`;
      
      await verifySignature(mockOrderData.orderId, mockPaymentId, mockSignature);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed mock payment.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-6 bg-white dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-[24px] shadow-premium-lg animate-scale-up space-y-5">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-secondary-100 dark:border-secondary-900 pb-3">
          <div>
            <h3 className="text-sm font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider flex items-center">
              <CreditCard className="h-4.5 w-4.5 mr-2 text-primary-500" /> Book Property
            </h3>
            <p className="text-[10px] text-secondary-400">Lock your stay with a secure booking deposit</p>
          </div>
          <button 
            onClick={onClose}
            className="text-secondary-400 hover:text-secondary-650 p-1 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-full transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Pricing breakdown */}
        {!mockOrderData ? (
          <div className="space-y-4">
            <div className="p-3 bg-secondary-50/20 border border-secondary-200/50 rounded-xl space-y-1">
              <span className="text-[9px] font-bold text-secondary-400 uppercase tracking-widest">Property Description</span>
              <h4 className="text-xs font-bold text-secondary-900 dark:text-white truncate">{property.title}</h4>
            </div>

            <div className="divide-y divide-secondary-100 dark:divide-secondary-900 text-xs font-semibold text-secondary-600">
              <div className="flex justify-between py-2.5">
                <span className="text-secondary-500">Security Deposit (1.5 Months)</span>
                <span className="text-secondary-800 dark:text-white">₹{deposit.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between py-2.5">
                <span className="text-secondary-500">Convenience Platform Fee</span>
                <span className="text-secondary-800 dark:text-white">₹{serviceFee}.00</span>
              </div>
              <div className="flex justify-between py-3.5 font-extrabold text-sm text-secondary-900 dark:text-white">
                <span>Total Payable Amount</span>
                <span className="text-primary-500">₹{totalAmount.toLocaleString('en-IN')}.00</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 p-3 bg-primary-50/10 text-primary-600 rounded-xl border border-primary-100/10">
              <ShieldCheck className="h-5 w-5 shrink-0" />
              <p className="text-[9px] leading-relaxed font-bold">
                Your deposit is securely escrowed. Receipts and printable invoices will generate instantly.
              </p>
            </div>

            <Button
              onClick={handleCheckoutSubmit}
              disabled={loading}
              className="w-full justify-center text-xs font-bold py-2.5 bg-primary-500 hover:bg-primary-600 rounded-xl mt-2"
            >
              Pay Booking Deposit
            </Button>
          </div>
        ) : (
          /* Mock developer panel */
          <div className="space-y-4 animate-fade-in">
            <div className="p-3 bg-warning-50/10 text-warning-600 border border-warning-100/10 rounded-xl flex items-start space-x-2">
              <Info className="h-5 w-5 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-[10px] font-bold uppercase tracking-wider">Gateway Sandbox Mode</h4>
                <p className="text-[9px] leading-relaxed mt-0.5">
                  Razorpay credentials are unset. Use this panel to mock gateway verification triggers.
                </p>
              </div>
            </div>

            <div className="p-4 bg-secondary-50/20 border border-secondary-200/50 rounded-xl font-mono text-[9px] text-secondary-700 space-y-1">
              <div>System Order: <strong className="text-secondary-900">{mockOrderData.orderId}</strong></div>
              <div>System Txn: <strong className="text-secondary-900">{mockOrderData.transactionId}</strong></div>
              <div>Amount: <strong className="text-secondary-900">₹{(mockOrderData.amount / 100).toLocaleString('en-IN')}.00</strong></div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                onClick={handleMockSuccess}
                disabled={loading}
                className="justify-center text-[10px] font-bold py-2 bg-success-500 hover:bg-success-600 rounded-xl"
              >
                Mock Success Payment
              </Button>
              <Button
                onClick={() => {
                  toast.error('Mock Checkout Cancelled.');
                  onClose();
                }}
                disabled={loading}
                variant="outline"
                className="justify-center text-[10px] font-bold py-2 border-secondary-200 rounded-xl"
              >
                Mock Fail Payment
              </Button>
            </div>
          </div>
        )}

      </Card>
    </div>
  );
};

export default BookPropertyModal;
