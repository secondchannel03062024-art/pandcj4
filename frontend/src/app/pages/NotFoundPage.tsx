import { useNavigate } from 'react-router';
import { Home, Search } from 'lucide-react';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-[150px] md:text-[200px] font-bold opacity-10 leading-none">
          404
        </h1>
        <h2 className="text-3xl md:text-4xl font-bold mb-4 -mt-8">
          Page Not Found
        </h2>
        <p className="text-lg opacity-70 mb-8 max-w-md mx-auto">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => navigate('/')}
            className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <Home size={20} />
            Go Home
          </button>
          <button
            onClick={() => navigate('/shop')}
            className="border-2 border-black px-8 py-3 rounded-full font-medium hover:bg-black hover:text-white transition-all flex items-center justify-center gap-2"
          >
            <Search size={20} />
            Browse Shop
          </button>
        </div>
      </div>
    </div>
  );
}
