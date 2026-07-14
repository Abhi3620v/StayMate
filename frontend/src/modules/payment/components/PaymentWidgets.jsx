import React, { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  FileText, Receipt, Download, X, DollarSign, 
  CreditCard, CheckCircle2, AlertTriangle, ArrowUpRight 
} from 'lucide-react';

/**
 * 1. PaymentStatusBadge
 */
export const PaymentStatusBadge = ({ status }) => {
  const getBadgeStyle = () => {
    switch (status) {
      case 'completed':
      case 'captured':
        return 'bg-success-50 text-success-600 dark:bg-success-950/20 dark:text-success-400 border-success-100/10';
      case 'failed':
        return 'bg-error-50 text-error-600 dark:bg-error-950/20 dark:text-error-400 border-error-100/10';
      case 'pending':
        return 'bg-warning-50 text-warning-600 dark:bg-warning-950/20 dark:text-warning-400 border-warning-100/10';
      default:
        return 'bg-secondary-100 text-secondary-600 dark:bg-secondary-800 dark:text-secondary-400';
    }
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getBadgeStyle()}`}>
      {status}
    </span>
  );
};

/**
 * 2. RevenueCard
 */
export const RevenueCard = ({ title, value, change, icon }) => {
  return (
    <Card className="p-5 border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 shadow-premium-sm hover:shadow-premium-md transition-shadow flex items-center justify-between">
      <div className="space-y-1">
        <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-widest block">{title}</span>
        <h3 className="text-xl font-black text-secondary-900 dark:text-white leading-none">{value}</h3>
      </div>
      <div className="h-10 w-10 bg-primary-50 dark:bg-primary-950/20 text-primary-500 rounded-xl flex items-center justify-center">
        {icon}
      </div>
    </Card>
  );
};

/**
 * 3. PaymentHistoryTable
 */
export const PaymentHistoryTable = ({ transactions, onInspectInvoice, onInspectReceipt }) => {
  return (
    <div className="overflow-x-auto rounded-[20px] border border-secondary-200/50 dark:border-secondary-900 bg-white dark:bg-secondary-900 shadow-premium-sm">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-secondary-50 dark:bg-secondary-950 text-secondary-450 text-[10px] uppercase font-bold border-b border-secondary-100/50 dark:border-secondary-900/50">
            <th className="px-5 py-4">Transaction ID</th>
            <th className="px-5 py-4">Property</th>
            <th className="px-5 py-4">Date</th>
            <th className="px-5 py-4">Type</th>
            <th className="px-5 py-4">Amount</th>
            <th className="px-5 py-4">Status</th>
            <th className="px-5 py-4 text-right">Documents</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-secondary-100 dark:divide-secondary-900 text-xs font-semibold text-secondary-750 dark:text-secondary-300">
          {transactions.map((txn, idx) => (
            <tr key={idx} className="hover:bg-secondary-50/30 dark:hover:bg-secondary-900/10 transition-colors">
              <td className="px-5 py-3 font-mono text-[10px] text-secondary-900 dark:text-white">
                {txn.transactionId}
              </td>
              <td className="px-5 py-3 max-w-[180px] truncate">
                {txn.propertyId?.title || 'StayMate Rental Listing'}
              </td>
              <td className="px-5 py-3 text-secondary-500">
                {new Date(txn.timestamp || txn.createdAt).toLocaleDateString()}
              </td>
              <td className="px-5 py-3 capitalize">
                {txn.paymentType.replace(/_/g, ' ')}
              </td>
              <td className="px-5 py-3 font-extrabold text-secondary-900 dark:text-white">
                ₹{txn.amount.toLocaleString('en-IN')}
              </td>
              <td className="px-5 py-3">
                <PaymentStatusBadge status={txn.status} />
              </td>
              <td className="px-5 py-3 text-right space-x-2">
                {txn.status === 'completed' ? (
                  <>
                    <button 
                      onClick={() => onInspectInvoice(txn.transactionId)}
                      className="text-primary-500 hover:text-primary-650 inline-flex items-center text-[10px] font-bold"
                    >
                      <FileText className="h-3 w-3 mr-0.5" /> Invoice
                    </button>
                    <button 
                      onClick={() => onInspectReceipt(txn.transactionId)}
                      className="text-success-600 hover:text-success-700 inline-flex items-center text-[10px] font-bold"
                    >
                      <Receipt className="h-3 w-3 mr-0.5" /> Receipt
                    </button>
                  </>
                ) : (
                  <span className="text-secondary-400 font-normal italic">None</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * 4. DocumentPreviewModal
 */
export const DocumentPreviewModal = ({ title, transactionId, type, onClose }) => {
  const printDocument = () => {
    const frame = document.getElementById('print-iframe');
    if (frame) {
      frame.contentWindow.postMessage('print', '*');
    }
  };

  const baseUrl = import.meta.env.VITE_BACKEND_URL || (import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000');
  const endpointUrl = `${baseUrl}/api/v1/payments/${type}s/${transactionId}`;

  // Read cookies or tokens to pass authenticated session requests
  // In dev setup, we can point standard iframe. To bypass raw cookies auth gating, the backend route
  // resolves using the token or we load standard iframe directly. 
  // (Standard practice: pass token in query if cookies aren't shared)
  const token = localStorage.getItem('accessToken');
  const iframeSrc = token ? `${endpointUrl}?token=${token}` : endpointUrl;

  return (
    <div className="fixed inset-0 bg-secondary-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-3xl h-[85vh] bg-white dark:bg-secondary-950 border border-secondary-100 dark:border-secondary-900 rounded-[24px] shadow-premium-lg flex flex-col overflow-hidden animate-scale-up">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-secondary-100 dark:border-secondary-900 shrink-0">
          <div>
            <h3 className="text-sm font-extrabold text-secondary-900 dark:text-white uppercase tracking-wider">{title}</h3>
            <p className="text-[10px] text-secondary-400">Ref: {transactionId}</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Button onClick={printDocument} size="sm" variant="outline" className="text-[10px] font-bold py-1 px-3">
              <Download className="h-3.5 w-3.5 mr-1" /> Print / Save
            </Button>
            <button 
              onClick={onClose}
              className="text-secondary-400 hover:text-secondary-650 p-1 hover:bg-secondary-50 dark:hover:bg-secondary-900 rounded-full transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Iframe Content */}
        <div className="flex-1 bg-secondary-50 dark:bg-secondary-950 p-4">
          <iframe 
            id="print-iframe"
            src={iframeSrc} 
            className="w-full h-full border-none rounded-xl bg-white shadow-premium-sm"
            title="Document Render Frame"
          />
        </div>
      </Card>
    </div>
  );
};
