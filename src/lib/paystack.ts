/**
 * Safely triggers the Paystack Inline modal regardless of SDK version (v1 or v2).
 */
export function openPaystackModal({
  key,
  email,
  amountInKobo,
  reference,
  onSuccess,
  onCancel,
}: {
  key: string;
  email: string;
  amountInKobo: number;
  reference: string;
  onSuccess: (response: any) => void;
  onCancel?: () => void;
}): boolean {
  if (typeof window === 'undefined') return false;

  const PaystackPop = (window as any).PaystackPop;
  if (!PaystackPop) {
    console.error('PaystackPop is not loaded on window');
    return false;
  }

  try {
    // Try V2 API: new PaystackPop().newTransaction(...)
    if (typeof PaystackPop === 'function') {
      try {
        const popup = new PaystackPop();
        if (popup && typeof popup.newTransaction === 'function') {
          popup.newTransaction({
            key,
            email,
            amount: amountInKobo,
            reference,
            onSuccess: (trx: any) => onSuccess(trx),
            onCancel: () => onCancel && onCancel(),
          });
          return true;
        }
      } catch (v2Err) {
        console.warn('Paystack v2 initialization failed, falling back to v1', v2Err);
      }
    }

    // Try V1 API: PaystackPop.setup({ ... }).openIframe()
    if (PaystackPop.setup) {
      const handler = PaystackPop.setup({
        key,
        email,
        amount: amountInKobo,
        reference,
        callback: (response: any) => onSuccess(response),
        onClose: () => onCancel && onCancel(),
      });
      if (handler && typeof handler.openIframe === 'function') {
        handler.openIframe();
        return true;
      }
    }
  } catch (err) {
    console.error('Error launching Paystack modal:', err);
  }

  return false;
}
