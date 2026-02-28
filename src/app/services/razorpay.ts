// Razorpay Payment Integration Utility
import { config } from '../config/env';

// Define Razorpay types
interface RazorpayOptions {
  key: string;
  amount: number; // Amount in paise (1 rupee = 100 paise)
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  theme?: {
    color?: string;
  };
  handler: (response: RazorpayResponse) => void;
  modal?: {
    ondismiss?: () => void;
  };
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_signature?: string;
}

interface Window {
  Razorpay: new (options: RazorpayOptions) => {
    open: () => void;
    on: (event: string, handler: (response: any) => void) => void;
  };
}

declare const window: Window & typeof globalThis;

// Load Razorpay script dynamically
export const loadRazorpayScript = (): Promise<boolean> => {
  return new Promise((resolve) => {
    // Check if script is already loaded
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

// Payment options interface
export interface PaymentOptions {
  amount: number; // Amount in rupees
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  orderDetails?: string;
  notes?: Record<string, string>;
  onSuccess: (paymentId: string, response: RazorpayResponse) => void;
  onFailure: (error: any) => void;
  onDismiss?: () => void;
}

// Initialize Razorpay payment
export const initiateRazorpayPayment = async (options: PaymentOptions): Promise<void> => {
  // Load Razorpay script
  const scriptLoaded = await loadRazorpayScript();
  
  if (!scriptLoaded) {
    options.onFailure(new Error('Failed to load Razorpay SDK. Please check your internet connection.'));
    return;
  }

  // Check if Razorpay key is configured
  const razorpayKey = config.razorpay.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID;
  
  if (!razorpayKey) {
    // Show detailed error with instructions
    const errorMessage = `
⚠️ Razorpay is not configured!

To enable payments, please follow these steps:

1. Sign up for Razorpay at: https://razorpay.com
2. Get your Test API Key from: https://dashboard.razorpay.com/app/website-app-settings/api-keys
3. Add this to your .env file:
   VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id_here
4. Restart the development server

For testing, you can use this test key: rzp_test_1234567890
(This is a demo key - replace with your actual key for real payments)
    `.trim();
    
    console.error(errorMessage);
    options.onFailure(new Error('Razorpay key is not configured. Please check console for setup instructions.'));
    return;
  }

  // Convert amount to paise (Razorpay expects amount in paise)
  const amountInPaise = Math.round(options.amount * 100);

  // Razorpay options
  const razorpayOptions: RazorpayOptions = {
    key: razorpayKey,
    amount: amountInPaise,
    currency: config.currency.code,
    name: config.app.name,
    description: options.orderDetails || 'Order Payment',
    prefill: {
      name: options.customerName,
      email: options.customerEmail,
      contact: options.customerPhone,
    },
    notes: options.notes || {},
    theme: {
      color: '#000000', // Black theme matching your store
    },
    handler: (response: RazorpayResponse) => {
      // Payment successful
      options.onSuccess(response.razorpay_payment_id, response);
    },
    modal: {
      ondismiss: () => {
        if (options.onDismiss) {
          options.onDismiss();
        }
      },
    },
  };

  // Create Razorpay instance
  const razorpay = new window.Razorpay(razorpayOptions);

  // Handle payment failure
  razorpay.on('payment.failed', (response: any) => {
    options.onFailure(response.error);
  });

  // Open Razorpay checkout
  razorpay.open();
};

// Verify payment on backend (this should ideally be done on server-side)
// For now, we'll just validate that we have a payment ID
export const verifyPayment = (paymentId: string): boolean => {
  // In production, this should make an API call to your backend
  // to verify the payment signature using Razorpay's key_secret
  return !!paymentId && paymentId.startsWith('pay_');
};

// Format amount for display
export const formatCurrency = (amount: number): string => {
  return `${config.currency.symbol}${amount.toFixed(2)}`;
};