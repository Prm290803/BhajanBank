import { useState } from 'react';
import { useAuth } from '../../Auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';

function Login() {
  const { login } = useAuth(); // Uncommented this
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
 const [showPassword, setShowPassword] = useState(false);
   const [isLoading, setIsLoading] = useState(false);
  
   
 const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const result = await login(email, password);
      console.log(email, password);
      console.log(result);
      if (result.success) {
        // Redirect after successful login
        navigate('/data'); // Or your desired protected route
      } else {
        setError(result.message || 'Login failed');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">Login</h2>
        </div>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="mt-1 appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    Password
  </label>
  <div className="relative mt-1">
    <input
      id="password"
      name="password"
      type={showPassword ? 'text' : 'password'}
      autoComplete="current-password"
      required
      className="block w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
    />
    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-[#00000] focus:outline-none"
    >
      {showPassword ? (
        <EyeIcon className="h-5 w-5" aria-hidden="false" />
      ) : (
        <EyeSlashIcon className="h-5 w-5" aria-hidden="true" />
      )}
    </button>
  </div>
  </div>

         

        <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        <div className="text-center text-sm text-gray-600">
          <p>
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/register')}
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Register
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;