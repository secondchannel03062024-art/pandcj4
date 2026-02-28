import { useState, useEffect, useRef } from 'react';
import { Menu, X, Plus, MessageSquare, Settings, LogOut } from 'lucide-react';
import { gsap } from 'gsap';
import { Link } from 'react-router';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sidebarRef.current || !overlayRef.current) return;

    if (isOpen) {
      // Animate sidebar opening
      gsap.to(sidebarRef.current, {
        x: 0,
        duration: 0.3,
        ease: 'power2.out'
      });
      gsap.to(overlayRef.current, {
        opacity: 1,
        pointerEvents: 'auto',
        duration: 0.3
      });
    } else {
      // Animate sidebar closing
      gsap.to(sidebarRef.current, {
        x: '-100%',
        duration: 0.3,
        ease: 'power2.in'
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        pointerEvents: 'none',
        duration: 0.3
      });
    }
  }, [isOpen]);

  const handleCloseSidebar = () => {
    setIsOpen(false);
  };

  const menuItems = [
    { icon: <Plus size={20} />, label: 'New Chat', href: '/' },
    { icon: <MessageSquare size={20} />, label: 'Browse Fabrics', href: '/shop' },
    { icon: <MessageSquare size={20} />, label: 'My Orders', href: '/orders' },
    { icon: <MessageSquare size={20} />, label: 'Wishlist', href: '/wishlist' },
    { icon: <MessageSquare size={20} />, label: 'Profile', href: '/profile' },
  ];

  return (
    <>
      {/* Toggle Button - Fixed position in top left */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-4 left-4 z-40 p-2 hover:bg-gray-100 rounded-lg transition-colors md:hidden"
        aria-label="Toggle sidebar"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay */}
      <div
        ref={overlayRef}
        onClick={handleCloseSidebar}
        className="fixed inset-0 bg-black/50 z-30 opacity-0 pointer-events-none md:hidden"
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="fixed left-0 top-0 h-screen w-64 bg-white border-r border-gray-200 z-35 flex flex-col transform -translate-x-full md:translate-x-0 md:w-64 md:relative md:z-0"
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-center">Auraclothings</h1>
        </div>

        {/* New Chat Button */}
        <div className="p-4">
          <Link
            to="/"
            onClick={handleCloseSidebar}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <Plus size={18} />
            <span className="text-sm font-medium">New</span>
          </Link>
        </div>

        {/* Menu Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 py-2 text-xs text-gray-500 uppercase font-semibold tracking-wider">Menu</p>
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.href}
              onClick={handleCloseSidebar}
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <span className="text-gray-600">{item.icon}</span>
              <span className="text-sm font-medium truncate">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 p-3 space-y-1">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings size={18} />
            <span className="text-sm font-medium">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <LogOut size={18} />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </div>

      {/* Content Wrapper - shifts when sidebar is open on desktop */}
      <style>{`
        @media (min-width: 768px) {
          body {
            display: flex;
          }
        }
      `}</style>
    </>
  );
}
