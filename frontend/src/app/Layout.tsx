import { Outlet, useNavigate } from 'react-router';
import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ShoppingCart } from './components/ShoppingCart';
import { useApp } from './context/AppContext';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Layout() {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const navigate = useNavigate();
  const appRef = useRef<HTMLDivElement>(null);
  const { cartItems, wishlist, updateQuantity, removeFromCart } = useApp();

  useEffect(() => {
    // Page load animation
    const ctx = gsap.context(() => {
      gsap.from(appRef.current, {
        opacity: 0,
        duration: 0.6,
        ease: 'power2.out'
      });
    }, appRef);

    // Refresh ScrollTrigger on resize
    const handleResize = () => {
      ScrollTrigger.refresh();
    };

    window.addEventListener('resize', handleResize);

    return () => {
      ctx.revert();
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  return (
    <div ref={appRef} className="min-h-screen bg-white">
      <Sidebar />
      
      <div className="w-full">
        <Navbar
          onCartClick={() => setIsCartOpen(true)}
          onWishlistClick={() => navigate('/wishlist')}
          cartCount={totalCartItems}
          wishlistCount={wishlist.length}
        />
        
        <main>
          <Outlet />
        </main>
        
        <Footer />
      </div>
      
      <ShoppingCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        onUpdateQuantity={updateQuantity}
        onRemoveItem={removeFromCart}
      />
    </div>
  );
}
