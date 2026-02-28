import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Trash2, ShoppingBag } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { config } from '../config/env';

export default function CartPage() {
  const navigate = useNavigate();
  const { cartItems, updateQuantity, removeFromCart } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.cartQuantity, 0);
  const shipping = subtotal >= config.shipping.freeThreshold ? 0 : config.shipping.standardCost;
  const tax = subtotal * config.tax.rate;
  const total = subtotal + shipping + tax;

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.cart-item', {
        x: -50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, pageRef);

    return () => ctx.revert();
  }, [cartItems]);

  return (
    <div ref={pageRef} className="min-h-screen">
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-[60px] py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4">
            Shopping Cart
          </h1>
          <p className="text-lg opacity-70">
            {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-[60px] py-8 md:py-12">
        {cartItems.length === 0 ? (
          <div className="text-center py-20">
            <ShoppingBag size={80} className="mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl mb-4">Your cart is empty</h2>
            <p className="text-lg opacity-70 mb-8">
              Add some fabrics to get started
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,400px] gap-8">
            {/* Cart Items */}
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="cart-item flex gap-6 p-6 border border-gray-200 rounded-3xl">
                  <div className="w-32 h-32 flex-shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    <img src={item.images[0]} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-medium mb-1">{item.name}</h3>
                    <p className="text-sm opacity-70 mb-4">SKU: {item.sku}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => updateQuantity(item.id, Math.max(5, item.cartQuantity - 1))}
                          className="w-8 h-8 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          -
                        </button>
                        <span className="w-12 text-center font-medium">{item.cartQuantity} m</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cartQuantity + 1)}
                          className="w-8 h-8 border-2 border-black rounded-lg hover:bg-black hover:text-white transition-all"
                        >
                          +
                        </button>
                      </div>
                      <p className="text-xl font-bold">${(item.price * item.cartQuantity).toFixed(2)}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="flex-shrink-0 w-10 h-10 border-2 border-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:sticky lg:top-4 h-fit">
              <div className="border border-gray-200 rounded-3xl p-8 space-y-6">
                <h2 className="text-2xl font-semibold">Order Summary</h2>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="opacity-70">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-70">Shipping</span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
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

                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full bg-black text-white px-8 py-4 rounded-full font-medium hover:bg-gray-800 transition-all"
                >
                  Proceed to Checkout
                </button>

                <button
                  onClick={() => navigate('/shop')}
                  className="w-full border-2 border-black px-8 py-4 rounded-full font-medium hover:bg-black hover:text-white transition-all"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}