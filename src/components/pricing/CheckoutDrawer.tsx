import { useEffect, useState } from 'react';
import { useCheckout, PaymentElementProvider, PaymentElement, usePaymentElement } from '@clerk/clerk-react/experimental';
import { X, CreditCard, CheckCircle2, Loader2, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planPeriod: 'month' | 'annual';
  planName: string;
  planPrice: string;
  planDescription: string;
  monthlyPrice: number;
  isAnnual: boolean;
  annualTotal?: number;
  annualSavings?: number;
}

// Payment form component that uses PaymentElement
function PaymentForm({ onSuccess }: { onSuccess: () => void }) {
  const { submit, isFormReady } = usePaymentElement();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isFormReady || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const { data, error: submitError } = await submit();
      
      if (submitError) {
        setError((submitError as any).message || 'Payment validation failed');
        setIsProcessing(false);
        return;
      }

      if (data) {
        onSuccess();
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Payment Element Container */}
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
        <PaymentElement 
          fallback={
            <div className="flex items-center justify-center py-4">
              <Loader2 className="w-5 h-5 text-violet-600 animate-spin" />
              <span className="ml-2 text-gray-600 text-xs">Loading...</span>
            </div>
          }
        />
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2">
          <p className="text-red-600 text-xs font-medium text-center">{error}</p>
        </div>
      )}

      {/* Terms text - compact */}
      <p className="text-[10px] text-gray-400 text-center leading-tight">
        By providing your card information, you allow Clerk to charge your card for future payments in accordance with their terms.
      </p>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={!isFormReady || isProcessing}
        className={cn(
          "w-full py-2.5 rounded-lg font-bold text-sm text-white transition-all flex items-center justify-center gap-1.5",
          "bg-gradient-to-r from-violet-600 to-indigo-600",
          "hover:from-violet-700 hover:to-indigo-700",
          "shadow-md",
          "disabled:opacity-50 disabled:cursor-not-allowed"
        )}
      >
        {isProcessing ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <Lock className="w-3.5 h-3.5" />
            Subscribe
          </>
        )}
      </button>

      <p className="text-[10px] text-gray-400 text-center flex items-center justify-center gap-1">
        <Lock className="w-3 h-3" />
        Secure payment by Clerk
      </p>
    </form>
  );
}

export function CheckoutDrawer({
  isOpen,
  onClose,
  planId,
  planPeriod,
  planName,
  planPrice,
  planDescription,
  monthlyPrice,
  isAnnual,
  annualTotal,
  annualSavings,
}: CheckoutDrawerProps) {
  const { checkout } = useCheckout();
  const { status, start, confirm, isConfirming, isStarting, error } = checkout;
  const [paymentMethodAdded, setPaymentMethodAdded] = useState(false);

  useEffect(() => {
    if (isOpen && status === 'needs_initialization') {
      start();
    }
  }, [isOpen, status, start]);

  useEffect(() => {
    if (!isOpen) {
      setPaymentMethodAdded(false);
    }
  }, [isOpen]);

  const handlePaymentSuccess = async () => {
    setPaymentMethodAdded(true);
    try {
      await confirm({});
    } catch (err) {
      console.error('Failed to confirm checkout:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      {/* Backdrop blur */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className={cn(
          "relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden",
          "transform transition-all duration-300 ease-out",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95"
        )}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center">
                <CreditCard className="w-3.5 h-3.5 text-white" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Complete Your Purchase</h3>
                <p className="text-[10px] text-gray-500">Secure payment powered by Clerk</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          </div>

          {/* Content - Two Column Layout */}
          <div className="p-5">
            {isStarting ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
                <p className="text-gray-600 font-medium text-sm">Initializing checkout...</p>
              </div>
            ) : status === 'needs_confirmation' && !paymentMethodAdded ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left Column - Plan Summary */}
                <div className="bg-gray-50/50 border border-gray-100 rounded-xl p-5">
                  {/* Plan Header - Badge and Price */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-violet-600 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                      {planName}
                    </span>
                    <div className="text-right flex items-baseline gap-1">
                      <span className="text-2xl font-bold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                      <span className="text-sm text-gray-500">/mo</span>
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className="text-sm text-gray-600 mb-4 leading-relaxed">{planDescription}</p>
                  
                  {/* Divider */}
                  <div className="border-t border-gray-200 mb-4"></div>
                  
                  {/* Price Breakdown */}
                  <div className="space-y-3">
                    {/* Subtotal */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Subtotal</span>
                      <span className="font-semibold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                    </div>
                    
                    {/* Tax */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Tax</span>
                      <span className="text-gray-500 italic text-xs">Calculated at checkout</span>
                    </div>
                    
                    {/* Divider before Total */}
                    <div className="border-t border-gray-200 pt-3 mt-3">
                      {/* Total */}
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-900">Total</span>
                        <div className="text-right flex items-baseline gap-1">
                          <span className="text-xl font-bold text-gray-900">${monthlyPrice.toFixed(2)}</span>
                          <span className="text-xs text-gray-500">/mo</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Billing note */}
                    <p className="text-xs text-gray-400 text-center pt-2">
                      Billed monthly
                    </p>
                  </div>
                </div>

                {/* Right Column - Payment Form */}
                <div>
                  <p className="text-xs text-gray-600 mb-3">
                    Add your payment details to complete the subscription.
                  </p>
                  <PaymentElementProvider for="user">
                    <PaymentForm onSuccess={handlePaymentSuccess} />
                  </PaymentElementProvider>
                </div>
              </div>
            ) : status === 'needs_confirmation' && paymentMethodAdded ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
                <p className="text-gray-600 font-medium text-sm">Confirming subscription...</p>
              </div>
            ) : isConfirming ? (
              <div className="flex flex-col items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-violet-600 animate-spin mb-2" />
                <p className="text-gray-600 font-medium text-sm">Processing payment...</p>
              </div>
            ) : status === 'completed' ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-7 h-7 text-green-600" />
                </div>
                <h4 className="text-base font-bold text-gray-900 mb-1">Payment Successful!</h4>
                <p className="text-gray-600 text-center mb-5 text-sm">
                  Thank you for upgrading to Pro.
                </p>
                <button
                  onClick={onClose}
                  className="px-6 py-2.5 bg-violet-600 text-white rounded-lg font-bold hover:bg-violet-700 transition-colors text-sm"
                >
                  Continue
                </button>
              </div>
            ) : error ? (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-600 font-medium text-center text-sm">
                  {error.message || 'Payment failed. Please try again.'}
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
