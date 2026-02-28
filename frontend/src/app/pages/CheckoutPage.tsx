import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { config } from '../config/env';
import { initiateRazorpayPayment, formatCurrency } from '../services/razorpay';
import { Loader2 } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isLoaded: isUserLoaded } = useUser();
  const { cartItems, clearCart, createOrder, validateCoupon } = useApp();
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });

  useEffect(() => {
    if (isUserLoaded && user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.primaryEmailAddress?.emailAddress || '',
        phone: user.primaryPhoneNumber?.phoneNumber || prev.phone
      }));
    }
  }, [isUserLoaded, user]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  const shipping = subtotal >= config.shipping.freeThreshold ? 0 : config.shipping.standardCost;
  const discount = appliedCoupon ? appliedCoupon.discount : 0;
  const tax = (subtotal - discount) * config.tax.rate;
  const total = subtotal - discount + shipping + tax;

  const handleApplyCoupon = () => {
    setCouponError('');
    const result = validateCoupon(couponCode, subtotal);
    
    if (result.valid && result.coupon) {
      let discountAmount = 0;
      if (result.coupon.discountType === 'percentage') {
        discountAmount = (subtotal * result.coupon.discountValue) / 100;
        if (result.coupon.maxDiscount) {
          discountAmount = Math.min(discountAmount, result.coupon.maxDiscount);
        }
      } else {
        discountAmount = result.coupon.discountValue;
      }
      
      setAppliedCoupon({ code: result.coupon.code, discount: discountAmount });
    } else {
      setCouponError(result.error || 'Invalid coupon');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isProcessing) return;
    setIsProcessing(true);

    try {
      // Initiate Razorpay payment
      await initiateRazorpayPayment({
        amount: total,
        customerName: `${formData.firstName} ${formData.lastName}`,
        customerEmail: formData.email,
        customerPhone: formData.phone,
        orderDetails: `Payment for ${cartItems.length} items`,
        notes: {
          customerName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          phone: formData.phone,
        },
        onSuccess: (paymentId, response) => {
          // Payment successful - Create order in database
          const order = createOrder({
            customerName: `${formData.firstName} ${formData.lastName}`,
            customerEmail: formData.email,
            customerPhone: formData.phone,
            shippingAddress: {
              street: formData.address,
              city: formData.city,
              state: formData.state,
              zipCode: formData.zipCode,
              country: formData.country
            },
            items: cartItems.map(item => ({
              productId: item._id,
              productName: item.name,
              sku: item.sku,
              quantity: item.cartQuantity,
              price: item.price,
              image: item.images[0]
            })),
            subtotal,
            discount,
            shipping,
            total,
            couponCode: appliedCoupon?.code,
            status: 'processing', // Set to processing since payment is done
            paymentStatus: 'completed' // Payment is completed
          });

          // Save customer email for order tracking
          localStorage.setItem('customerEmail', formData.email);

          // Clear cart
          clearCart();

          // Navigate to order confirmation
          navigate(`/order-confirmation/${order._id}?payment=${paymentId}`);
          
          setIsProcessing(false);
        },
        onFailure: (error) => {
          console.error('Payment failed:', error);
          
          // Check if it's a configuration error
          if (error.message?.includes('not configured')) {
            const shouldContinue = window.confirm(
              '⚠️ Razorpay is not configured!\n\n' +
              'To enable real payments:\n' +
              '1. Get your API key from https://razorpay.com\n' +
              '2. Add VITE_RAZORPAY_KEY_ID to your .env file\n' +
              '3. Restart the server\n\n' +
              'Click OK to continue without payment (DEMO MODE) or Cancel to go back.'
            );
            
            if (shouldContinue) {
              // Demo mode - create order without payment
              const order = createOrder({
                customerName: `${formData.firstName} ${formData.lastName}`,
                customerEmail: formData.email,
                customerPhone: formData.phone,
                shippingAddress: {
                  street: formData.address,
                  city: formData.city,
                  state: formData.state,
                  zipCode: formData.zipCode,
                  country: formData.country
                },
                items: cartItems.map(item => ({
                  productId: item._id,
                  productName: item.name,
                  sku: item.sku,
                  quantity: item.cartQuantity,
                  price: item.price,
                  image: item.images[0]
                })),
                subtotal,
                discount,
                shipping,
                total,
                couponCode: appliedCoupon?.code,
                status: 'pending', // Pending since no payment
                paymentStatus: 'pending' // Pending payment
              });

              // Save customer email for order tracking
              localStorage.setItem('customerEmail', formData.email);

              clearCart();
              navigate(`/order-confirmation/${order._id}?demo=true`);
            }
          } else {
            alert(`Payment failed: ${error.description || error.message || 'Please try again'}`);
          }
          
          setIsProcessing(false);
        },
        onDismiss: () => {
          setIsProcessing(false);
        }
      });
    } catch (error) {
      console.error('Payment initiation error:', error);
      alert('Failed to initiate payment. Please try again.');
      setIsProcessing(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  if (cartItems.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-[60px] py-8 md:py-12">
        <h1 className="text-4xl md:text-5xl tracking-tight mb-8">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
          {/* Checkout Form */}
          <div className="space-y-8">
            {!user && (
              <div className="bg-black text-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Have an account?</h3>
                  <p className="opacity-70">Sign in for a faster checkout experience and to track your orders.</p>
                </div>
                <button 
                  type="button"
                  onClick={() => navigate('/sign-in?redirect_url=/checkout')}
                  className="whitespace-nowrap px-8 py-3 bg-white text-black font-bold rounded-full hover:bg-gray-100 transition-all"
                >
                  Sign In
                </button>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Contact Information */}
              <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Contact Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name *</label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name *</label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    value={formData.lastName}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email *</label>
                  <input
                    type="email"
                    name="email"
                    required
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Phone *</label>
                  <input
                    type="tel"
                    name="phone"
                    required
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Shipping Address</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Address *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">City *</label>
                    <input
                      type="text"
                      name="city"
                      required
                      value={formData.city}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">State *</label>
                    <input
                      type="text"
                      name="state"
                      required
                      value={formData.state}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Zip Code *</label>
                    <input
                      type="text"
                      name="zipCode"
                      required
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Country *</label>
                    <select
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    >
                      <option value="India">India</option>
                      <option value="USA">USA</option>
                      <option value="UK">UK</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Coupon Code */}
            <div className="bg-white rounded-3xl p-8">
              <h2 className="text-2xl font-semibold mb-6">Coupon Code</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Enter Coupon Code</label>
                  <input
                    type="text"
                    name="couponCode"
                    value={couponCode}
                    onChange={e => setCouponCode(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  className="w-full bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all"
                >
                  Apply Coupon
                </button>
                {couponError && <p className="text-red-500 text-sm">{couponError}</p>}
                {appliedCoupon && (
                  <p className="text-green-500 text-sm">
                    Coupon applied: {appliedCoupon.code} - ${appliedCoupon.discount.toFixed(2)} discount
                  </p>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={isProcessing}
              className="w-full bg-black text-white px-8 py-4 rounded-full text-lg font-medium hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="animate-spin" size={20} />
                  Processing Payment...
                </>
              ) : (
                'Proceed to Payment'
              )}
            </button>
          </form>
        </div>

        {/* Order Summary */}
          <div className="lg:sticky lg:top-4 h-fit">
            <div className="bg-white rounded-3xl p-8 space-y-6">
              <h2 className="text-2xl font-semibold">Order Summary</h2>
              
              <div className="space-y-4">
                {cartItems.map(item => (
                  <div key={item.id} className="flex gap-4">
                    <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                      <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name}</p>
                      <p className="text-sm opacity-70">Qty: {item.cartQuantity}</p>
                    </div>
                    <p className="font-medium">${(item.price * item.cartQuantity).toFixed(2)}</p>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span className="opacity-70">Subtotal</span>
                  <span className="font-medium">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Shipping</span>
                  <span className="font-medium">${shipping.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Discount</span>
                  <span className="font-medium">-${discount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-70">Tax</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="border-t pt-3 flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}