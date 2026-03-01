import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { gsap } from 'gsap';
import { SignedIn, SignedOut, UserButton } from '@clerk/clerk-react';
import { Menu, X, Home, ShoppingBag, Heart, User, ShoppingCart } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CATEGORIES } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface NavbarProps {
  cartCount?: number;
  wishlistCount?: number;
}

export function Navbar({ }: NavbarProps) {
  const navRef = useRef<HTMLDivElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { cartItems, wishlist } = useApp();

  const totalCartItems = cartItems.reduce((sum, item) => sum + item.cartQuantity, 0);

  useEffect(() => {
    // Animate navbar on mount
    const ctx = gsap.context(() => {
      gsap.from(navRef.current, {
        y: -30,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out'
      });
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <div ref={navRef} className="border-b border-golden-200 px-4 md:px-8 lg:px-[60px] py-4 md:py-5 sticky top-0 bg-white z-40 w-full overflow-x-hidden">
        <div className="flex items-center justify-between gap-4 w-full md:justify-start">
          {/* Mobile Menu Button - Left */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700 hover:text-gray-900 flex-shrink-0"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          {/* Logo - Center on mobile, Left on desktop */}
          <Link to="/" className="text-lg md:text-xl lg:text-2xl font-extrabold whitespace-nowrap flex-1 text-center md:text-left md:flex-none" style={{ fontFamily: "'Century Gothic', 'CenturyGothic', 'Apple Gothic', sans-serif" }}>
            AURACLOTHINGS
          </Link>

          {/* Right: Menu + Auth */}
          <div className="flex items-center gap-4 flex-shrink-0">
            {/* Desktop Auth */}
            <div className="hidden md:flex items-center gap-4">
              <SignedOut>
                <Link to="/sign-in" className="hover:opacity-70 transition-opacity flex items-center">
                  <span className="text-xs md:text-sm font-semibold tracking-tight text-magenta-600 hover:text-magenta-700">Login</span>
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </SignedIn>
            </div>

            {/* Mobile Auth */}
            <div className="md:hidden flex items-center gap-4">
              <SignedOut>
                <Link to="/sign-in" className="hover:opacity-70 transition-opacity flex items-center">
                  <span className="text-xs font-semibold tracking-tight text-magenta-600 hover:text-magenta-700">Login</span>
                </Link>
              </SignedOut>
              <SignedIn>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-7 h-7"
                    }
                  }}
                />
              </SignedIn>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 bg-black/30 md:hidden z-40"
            />

            {/* Sidebar */}
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed left-0 top-0 h-screen w-64 bg-white z-50 overflow-y-auto md:hidden shadow-lg"
            >
              {/* Close button */}
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <span className="font-bold text-gray-900">Menu</span>
                <button
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-700 hover:text-gray-900"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Menu items */}
              <div className="px-4 py-4 flex flex-col gap-1">
                <Link
                  to="/"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Home size={20} />
                  <span className="text-sm font-medium">Home</span>
                </Link>

                <Link
                  to="/shop"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <ShoppingBag size={20} />
                  <span className="text-sm font-medium">Shop All</span>
                </Link>

                {CATEGORIES.map((category) => (
                  <Link
                    key={category.id}
                    to={`/shop/${category.id}`}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center gap-3 p-3 pl-8 rounded-lg hover:bg-gray-100 text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    <span className="text-sm font-medium">{category.name}</span>
                  </Link>
                ))}

                <div className="border-t border-gray-200 my-3"></div>

                <Link
                  to="/wishlist"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <Heart size={20} />
                  <span className="text-sm font-medium">Wishlist {wishlist.length > 0 && `(${wishlist.length})`}</span>
                </Link>

                <Link
                  to="/profile"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 text-gray-700 hover:text-gray-900 transition-colors"
                >
                  <User size={20} />
                  <span className="text-sm font-medium">Profile</span>
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}