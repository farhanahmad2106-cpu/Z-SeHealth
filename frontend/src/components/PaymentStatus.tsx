import { CheckCircle, XCircle, ArrowRight, Mail, Phone, Copy, RefreshCw } from 'lucide-react';
import { useState } from 'react';

interface PaymentStatusProps {
  status: 'success' | 'failure';
  planName?: string;        // e.g., "Z-Elite"
  transactionId?: string;   // Razorpay payment ID
  subscriptionId?: string;  // Razorpay subscription ID
  upiTransactionId?: string; // UPI Ref No (if paid via UPI)
  onClose: () => void;
  onRetry?: () => void;
  onGoToDashboard?: () => void;
}

// ⚠️ PLACEHOLDER — fill in your contact details below
const SUPPORT_EMAIL: string = 'support@z-sehealth.com'; // TODO: Replace with your actual support email
const SUPPORT_PHONE: string = '';                         // TODO: Replace with your actual phone number (e.g., '+91 98765 43210')

export default function PaymentStatus({
  status,
  planName = 'Premium',
  transactionId,
  subscriptionId,
  upiTransactionId,
  onClose,
  onRetry,
  onGoToDashboard,
}: PaymentStatusProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      // Fallback for older browsers
      const el = document.createElement('textarea');
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    }
  };

  const buildEmailBody = () => {
    const lines = [
      `Hi Z-SeHealth Support,`,
      ``,
      `I'm having an issue with my payment.`,
      ``,
      `Plan: ${planName}`,
      transactionId   ? `Payment ID: ${transactionId}` : '',
      subscriptionId  ? `Subscription ID: ${subscriptionId}` : '',
      upiTransactionId ? `UPI Transaction ID: ${upiTransactionId}` : '',
      ``,
      `Please look into this and help me resolve the issue.`,
      ``,
      `Thank you.`,
    ].filter(Boolean).join('\n');
    return encodeURIComponent(lines);
  };

  const buildEmailSubject = () =>
    encodeURIComponent(`Payment Issue — ${planName} — Z-SeHealth`);

  if (status === 'success') {
    return (
      <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
        <div className="bg-slate-900 border border-slate-800 rounded-4xl p-8 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300 text-center">
          {/* Success Icon */}
          <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-emerald-400" />
          </div>

          <h1 className="text-2xl font-bold font-outfit text-white mb-2">Payment Successful! 🎉</h1>
          <p className="text-gray-400 text-sm mb-2">
            Welcome to <span className="text-emerald-400 font-bold">{planName}</span>! Your premium features are now active.
          </p>
          <p className="text-xs text-gray-600 mb-6">Your AI scan quota has been upgraded immediately.</p>

          {/* Transaction Receipt */}
          {(transactionId || subscriptionId || upiTransactionId) && (
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 mb-6 text-left space-y-2.5">
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Payment Receipt</p>
              {transactionId && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Payment ID</p>
                    <p className="text-xs text-white font-mono">{transactionId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(transactionId, 'paymentId')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-all active:scale-95 flex-shrink-0"
                    aria-label="Copy payment ID"
                  >
                    {copied === 'paymentId' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {subscriptionId && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">Subscription ID</p>
                    <p className="text-xs text-white font-mono">{subscriptionId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(subscriptionId, 'subId')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-all active:scale-95 flex-shrink-0"
                    aria-label="Copy subscription ID"
                  >
                    {copied === 'subId' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
              {upiTransactionId && (
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-[10px] text-gray-500 uppercase tracking-wide">UPI Transaction ID</p>
                    <p className="text-xs text-white font-mono">{upiTransactionId}</p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(upiTransactionId, 'upiId')}
                    className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-all active:scale-95 flex-shrink-0"
                    aria-label="Copy UPI transaction ID"
                  >
                    {copied === 'upiId' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}
            </div>
          )}

          <button
            onClick={onGoToDashboard ?? onClose}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
            id="payment-success-dashboard-btn"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  // --- FAILURE SCREEN ---
  return (
    <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-slate-900 border border-slate-800 rounded-4xl p-8 max-w-sm w-full shadow-2xl animate-in slide-in-from-bottom-5 duration-300 text-center">
        {/* Failure Icon */}
        <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-10 h-10 text-rose-400" />
        </div>

        <h1 className="text-2xl font-bold font-outfit text-white mb-2">Payment Failed</h1>
        <p className="text-gray-400 text-sm mb-6">
          Something went wrong with your payment. No amount was deducted. Please try again or contact support.
        </p>

        {/* Transaction Details (if we have a reference) */}
        {(transactionId || subscriptionId || upiTransactionId) && (
          <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-4 mb-6 text-left space-y-2.5">
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Payment Reference</p>
            {transactionId && (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">Payment ID</p>
                  <p className="text-xs text-white font-mono">{transactionId}</p>
                </div>
                <button onClick={() => copyToClipboard(transactionId, 'failPaymentId')} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-all active:scale-95 flex-shrink-0">
                  {copied === 'failPaymentId' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
            {upiTransactionId && (
              <div className="flex items-center justify-between gap-2">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase tracking-wide">UPI Transaction ID</p>
                  <p className="text-xs text-white font-mono">{upiTransactionId}</p>
                </div>
                <button onClick={() => copyToClipboard(upiTransactionId, 'failUpiId')} className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-gray-400 hover:text-white transition-all active:scale-95 flex-shrink-0">
                  {copied === 'failUpiId' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Contact support — shown when user has paid but got an error */}
        {(transactionId || upiTransactionId) && (
          <div className="bg-amber-500/5 border border-amber-500/20 rounded-2xl p-4 mb-5 text-left">
            <p className="text-xs font-semibold text-amber-400 mb-1">Already paid? We've got you.</p>
            <p className="text-xs text-gray-500 leading-relaxed mb-3">
              If your UPI/Card was charged but access wasn't granted, send us your payment receipt and we'll resolve it within 24 hours.
            </p>
            <div className="flex flex-col gap-2">
              {SUPPORT_EMAIL && (
                <a
                  href={`mailto:${SUPPORT_EMAIL}?subject=${buildEmailSubject()}&body=${buildEmailBody()}`}
                  className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  id="payment-fail-email-link"
                >
                  <Mail className="w-3.5 h-3.5" />
                  {SUPPORT_EMAIL}
                </a>
              )}
              {SUPPORT_PHONE && (
                <a
                  href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`}
                  className="flex items-center gap-2 text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
                  id="payment-fail-phone-link"
                >
                  <Phone className="w-3.5 h-3.5" />
                  {SUPPORT_PHONE}
                </a>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          {onRetry && (
            <button
              onClick={onRetry}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold text-sm flex items-center justify-center gap-2 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95"
              id="payment-fail-retry-btn"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3 rounded-2xl bg-slate-800 text-gray-400 hover:text-white hover:bg-slate-700 text-sm font-medium transition-all active:scale-95"
          >
            Back to App
          </button>
        </div>
      </div>
    </div>
  );
}
