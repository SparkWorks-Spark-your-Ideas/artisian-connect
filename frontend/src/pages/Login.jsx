import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../components/AppIcon';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { api } from '../utils/api';

const Login = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    userType: 'artisan'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isLogin) {
        // Login
        const response = await api.auth.login({
          email: formData.email,
          password: formData.password
        });

        console.log('✅ Login successful:', response.data);

        // Store auth token and user data
        if (response.data.data.token) {
          localStorage.setItem('authToken', response.data.data.token);
        }
        if (response.data.data.user) {
          localStorage.setItem('userProfile', JSON.stringify(response.data.data.user));
        }

        // Redirect to dashboard
        navigate('/dashboard');
      } else {
        // Register
        const response = await api.auth.register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
          userType: formData.userType
        });

        console.log('✅ Registration successful:', response.data);

        // Store auth token and user data
        if (response.data.data.token) {
          localStorage.setItem('authToken', response.data.data.token);
        }
        if (response.data.data.user) {
          localStorage.setItem('userProfile', JSON.stringify(response.data.data.user));
        }

        // Redirect to dashboard
        navigate('/dashboard');
      }
    } catch (err) {
      console.error('❌ Authentication error:', err);
      
      // Handle validation errors with details
      if (err.response?.data?.details && Array.isArray(err.response.data.details)) {
        const errorList = err.response.data.details.map(d => `${d.field}: ${d.message}`).join(', ');
        setError(errorList);
      } else {
        setError(err.response?.data?.message || err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 text-white rounded-2xl mb-4">
            <Icon name="Package" size={32} />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">ArtisanConnect</h1>
          <p className="text-gray-600">Empowering Indian Artisans</p>
        </div>

        {/* Login/Register Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to continue to your dashboard' : 'Join our community of artisans'}
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <Icon name="AlertCircle" size={20} className="text-red-500 mr-2 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="John"
                    minLength={2}
                    required
                  />
                  <Input
                    label="Last Name"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Doe"
                    minLength={2}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    I am a...
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'artisan' })}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.userType === 'artisan'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <Icon name="Hammer" size={24} className="mx-auto mb-2" />
                      <span className="font-medium">Artisan</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, userType: 'customer' })}
                      className={`p-4 border-2 rounded-lg text-center transition-all ${
                        formData.userType === 'customer'
                          ? 'border-orange-500 bg-orange-50 text-orange-700'
                          : 'border-gray-200 hover:border-orange-200'
                      }`}
                    >
                      <Icon name="ShoppingBag" size={24} className="mx-auto mb-2" />
                      <span className="font-medium">Customer</span>
                    </button>
                  </div>
                </div>
              </>
            )}

            <Input
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              required
            />

            <Input
              label="Password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={6}
              required
            />

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <Icon name="Loader" size={20} className="mr-2 animate-spin" />
                  {isLogin ? 'Signing in...' : 'Creating account...'}
                </span>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError(null);
              }}
              className="text-orange-600 hover:text-orange-700 font-medium"
            >
              {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </div>
    </div>
  );
};

export default Login;
