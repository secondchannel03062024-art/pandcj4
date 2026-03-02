import { useState } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, User, Eye, EyeOff, AlertCircle, Loader } from 'lucide-react';
import { GoogleLoginButton, FacebookLoginButton } from '../components/OAuthButtons';

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, loginWithGoogle, loginWithFacebook, loading: authLoading, error: authError } = useAuth();
  
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;
      
      if (isSignUp) {
        // Validate signup
        if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
          throw new Error('All fields are required');
        }
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Passwords do not match');
        }
        if (formData.password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }
        
        result = await register(
          formData.name,
          formData.email,
          formData.password,
          formData.confirmPassword
        );
      } else {
        // Validate login
        if (!formData.email || !formData.password) {
          throw new Error('Email and password are required');
        }
        
        result = await login(formData.email, formData.password);
      }

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      setError('');
      
      // Decode JWT token from Google
      const base64Url = credentialResponse.credential.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      
      const decoded = JSON.parse(jsonPayload);
      
      const result = await loginWithGoogle(
        decoded.sub,
        decoded.name,
        decoded.email,
        decoded.picture
      );

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Google login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFacebookSuccess = async (response) => {
    try {
      setLoading(true);
      setError('');
      
      const result = await loginWithFacebook(
        response.accessToken,
        response.name,
        response.email,
        response.picture?.data?.url
      );

      if (result.success) {
        navigate('/');
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Facebook login failed. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-800 via-gray-700 to-yellow-900 flex items-center justify-center px-4 py-8">
      <div className="max-w-6xl w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Left Side - Image/GIF */}
          <div className="hidden lg:flex items-center justify-center">
            <div className="relative">
              {/* Decorative elements */}
              <div className="absolute -top-8 -left-8 w-32 h-32 bg-yellow-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
              
              {/* Auth Image */}
              <div className="relative z-10 rounded-3xl overflow-hidden shadow-2xl">
                <img 
                  src="https://images.unsplash.com/photo-1557821552-17105176677c?w=600&h=600&fit=crop"
                  alt="Fashion Authentication"
                  className="w-full h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 via-transparent to-transparent flex items-end p-8">
                  <div className="text-white">
                    <h3 className="text-3xl font-bold mb-2">Welcome to AURACLOTHINGS</h3>
                    <p className="text-yellow-100 text-lg">Premium fabrics for your creativity</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Auth Form */}
          <div className="w-full max-w-md mx-auto">
            <div className="bg-white/5 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-yellow-400/30">
              {/* Header */}
              <div className="mb-8">
                <h1 className="text-4xl font-bold text-white mb-2">
                  {isSignUp ? 'Create Account' : 'Welcome Back'}
                </h1>
                <p className="text-yellow-100 text-sm">
                  {isSignUp 
                    ? 'Join our community of fashion enthusiasts'
                    : 'Sign in to continue to AURACLOTHINGS'
                  }
                </p>
              </div>

              {/* Error message */}
              {(error || authError) && (
                <div className="mb-6 p-4 rounded-xl bg-red-500/30 border border-red-400/50 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-300 flex-shrink-0 mt-0.5" />
                  <p className="text-red-100 text-sm">{error || authError}</p>
                </div>
              )}

              {/* Social Login Buttons */}
              <div className="space-y-3 mb-6">
                <GoogleLoginButton 
                  onSuccess={handleGoogleSuccess}
                  disabled={loading || authLoading}
                />
                <FacebookLoginButton 
                  onSuccess={handleFacebookSuccess}
                  disabled={loading || authLoading}
                />
              </div>

              {/* Divider */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex-1 h-px bg-white/20"></div>
                <span className="text-white/50 text-sm">or continue with email</span>
                <div className="flex-1 h-px bg-white/20"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name field (Sign Up only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-gray-100 text-sm font-medium mb-2">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        disabled={loading || authLoading}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-yellow-400/30 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>
                )}

                {/* Email field */}
                <div>
                  <label className="block text-gray-100 text-sm font-medium mb-2">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="you@example.com"
                      disabled={loading || authLoading}
                      className="w-full pl-12 pr-4 py-3 rounded-xl bg-white/5 border border-yellow-400/30 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                {/* Password field */}
                <div>
                  <label className="block text-gray-100 text-sm font-medium mb-2">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      placeholder="••••••••"
                      disabled={loading || authLoading}
                      className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-yellow-400/30 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading || authLoading}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password field (Sign Up only) */}
                {isSignUp && (
                  <div>
                    <label className="block text-gray-100 text-sm font-medium mb-2">Confirm Password</label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-yellow-400" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        placeholder="••••••••"
                        disabled={loading || authLoading}
                        className="w-full pl-12 pr-12 py-3 rounded-xl bg-white/5 border border-yellow-400/30 text-gray-100 placeholder:text-gray-400 focus:outline-none focus:border-yellow-400 focus:bg-white/10 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        disabled={loading || authLoading}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-yellow-400 hover:text-yellow-300 disabled:opacity-50"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                )}

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={loading || authLoading}
                  className="w-full mt-6 py-3 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-600 text-gray-900 font-bold rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
                >
                  {loading || authLoading ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      Processing...
                    </>
                  ) : isSignUp ? (
                    'Create Account'
                  ) : (
                    'Sign In'
                  )}
                </button>
              </form>

              {/* Toggle Sign Up / Sign In */}
              <p className="text-center text-gray-300 text-sm mt-6">
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <button
                  type="button"
                  onClick={() => {
                    setIsSignUp(!isSignUp);
                    setFormData({ name: '', email: '', password: '', confirmPassword: '' });
                    setError('');
                  }}
                  className="text-yellow-400 hover:text-yellow-300 font-semibold transition-colors"
                >
                  {isSignUp ? 'Sign In' : 'Sign Up'}
                </button>
              </p>
            </div>

            {/* Terms */}
            <p className="text-center text-gray-400 text-xs mt-6">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
