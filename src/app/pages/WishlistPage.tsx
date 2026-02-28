import { useNavigate } from 'react-router';
import { useApp } from '../context/AppContext';
import { Trash2, Heart } from 'lucide-react';
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function WishlistPage() {
  const navigate = useNavigate();
  const { wishlist, toggleWishlist, addToCart, products } = useApp();
  const pageRef = useRef<HTMLDivElement>(null);

  // Get actual products that are in wishlist
  const wishlistProducts = products.filter(p => wishlist.includes(p._id));

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from('.wishlist-item', {
        y: 50,
        opacity: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: 'power3.out'
      });
    }, pageRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={pageRef} className="min-h-screen">
      <div className="bg-gradient-to-b from-gray-50 to-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-[60px] py-12 md:py-16">
          <h1 className="text-4xl md:text-5xl lg:text-6xl tracking-tight mb-4">
            My Wishlist
          </h1>
          <p className="text-lg opacity-70">
            {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 lg:px-[60px] py-8 md:py-12">
        {wishlistProducts.length === 0 ? (
          <div className="text-center py-20">
            <Heart size={80} className="mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl mb-4">Your wishlist is empty</h2>
            <p className="text-lg opacity-70 mb-8">
              Save your favorite items for later
            </p>
            <button
              onClick={() => navigate('/shop')}
              className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {wishlistProducts.map((product) => (
              <div key={product.id} className="wishlist-item group relative border border-gray-200 rounded-3xl overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-gray-100 cursor-pointer" onClick={() => navigate(`/product/${product.id}`)}>
                  <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">{product.name}</h3>
                  <div className="flex items-baseline gap-2 mb-4">
                    <p className="text-2xl font-bold">
                      ₹{(product.price - (product.price * product.offerPercentage / 100)).toFixed(2)}
                    </p>
                    {product.offerPercentage > 0 && (
                      <>
                        <p className="text-sm opacity-50 line-through">₹{product.price}</p>
                        <span className="text-xs bg-red-500 text-white px-2 py-0.5 rounded-full">
                          -{product.offerPercentage}%
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(product)}
                      className="flex-1 bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-800 transition-all"
                    >
                      Add to Cart
                    </button>
                    <button
                      onClick={() => toggleWishlist(product._id)}
                      className="w-10 h-10 border-2 border-red-500 rounded-full flex items-center justify-center hover:bg-red-500 hover:text-white transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}