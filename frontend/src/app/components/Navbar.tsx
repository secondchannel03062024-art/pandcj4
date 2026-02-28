import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { gsap } from 'gsap';
import { CATEGORIES } from '../types';

interface NavbarProps {
  onCartClick: () => void;
  onWishlistClick: () => void;
  cartCount: number;
  wishlistCount: number;
}

export function Navbar({ onCartClick, onWishlistClick, cartCount, wishlistCount }: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const navRef = useRef<HTMLDivElement>(null);
  const mobileMenuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (mobileMenuRef.current) {
      if (mobileMenuOpen) {
        gsap.fromTo(mobileMenuRef.current,
          { height: 0, opacity: 0 },
          { height: 'auto', opacity: 1, duration: 0.4, ease: 'power2.out' }
        );
      } else {
        gsap.to(mobileMenuRef.current,
          { height: 0, opacity: 0, duration: 0.3, ease: 'power2.in' }
        );
      }
    }
  }, [mobileMenuOpen]);

  const handleCategoryClick = (categoryId: string) => {
    navigate(`/shop/${categoryId}`);
    setMobileMenuOpen(false);
  };

  const handleSubCategoryClick = (categoryId: string, subCategoryId: string) => {
    navigate(`/shop/${categoryId}/${subCategoryId}`);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Single Combined Navigation Bar */}
      <div ref={navRef} className="border-b border-[rgba(0,0,0,0.05)] px-4 md:px-8 lg:px-[60px] py-4 md:py-5 sticky top-0 bg-white z-50">
        <div className="flex items-center justify-between gap-4">
          {/* Left: Menu Toggle */}
          <div className="flex items-center">
            <button 
              className="mr-4"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
          
          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2 text-lg md:text-xl lg:text-2xl font-extrabold whitespace-nowrap" style={{ fontFamily: "'Century Gothic', 'CenturyGothic', 'Apple Gothic', sans-serif" }}>
            AURACLOTHINGS
          </Link>

          {/* Right: Icons (Wishlist & Cart & Auth) */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="relative hover:opacity-70 transition-opacity"
              onClick={onWishlistClick}
              aria-label="Wishlist"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" stroke="currentColor" strokeWidth="2" fill="none"/>
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </button>
            
            <button 
              className="relative hover:opacity-70 transition-opacity cart-icon"
              onClick={onCartClick}
              aria-label="Shopping Cart"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 2L7 6M17 2l2 4M4 6h16M5 6l1 14c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2l1-14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-black text-white text-xs rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div ref={mobileMenuRef} className="bg-white border-b border-[rgba(0,0,0,0.05)] px-4 py-4 space-y-4 overflow-hidden">
          <Link 
            to="/shop" 
            className="block py-2 font-semibold hover:opacity-70 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            All Fabrics
          </Link>
          
          <Link 
            to="/orders" 
            className="block py-2 font-semibold hover:opacity-70 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            Orders
          </Link>
          
          <Link 
            to="/profile" 
            className="block py-2 font-semibold hover:opacity-70 transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          >
            My Profile
          </Link>

          <div className="border-t pt-4">
            <p className="text-sm font-bold opacity-70 mb-3">Categories</p>
            {CATEGORIES.map((category) => (
              <div key={category.id} className="mb-2">
                <button
                  onClick={() => {
                    if (expandedCategory === category.id) {
                      setExpandedCategory(null);
                    } else {
                      setExpandedCategory(category.id);
                      handleCategoryClick(category.id);
                    }
                  }}
                  className="flex items-center justify-between w-full py-2 font-medium hover:opacity-70 transition-opacity"
                >
                  {category.name}
                  <ChevronRight 
                    size={16} 
                    className={`transition-transform ${expandedCategory === category.id ? 'rotate-90' : ''}`}
                  />
                </button>
                {expandedCategory === category.id && (
                  <div className="ml-4 mt-2 space-y-2">
                    {category.subCategories.map((sub) => (
                      <button
                        key={sub.id}
                        onClick={() => handleSubCategoryClick(category.id, sub.id)}
                        className="block py-1 text-sm opacity-70 hover:opacity-100 transition-opacity"
                      >
                        {sub.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </>
  );
}