import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('landlord@test.com');
  const [password, setPassword] = useState('password');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.TENANT);
  const [error, setError] = useState('');
  
  const { login, register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (isLogin) {
      const result = await login(email, role); 
      if (result === true) {
        // Success
      } else if (typeof result === 'string') {
        setError(result);
      } else {
        setError('Invalid credentials or user not found.');
      }
    } else {
      const success = await register({ name, email, role, phone });
      if (success) {
        setIsLogin(true);
        if (role === UserRole.LANDLORD) {
           setError('Registration successful! NOTE: Landlord accounts require Admin approval before listing properties.');
        } else {
           setError('Registration successful! Please login.');
        }
      } else {
        setError('Email already exists.');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="bg-slate-900 p-6 text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Simba Estates</h1>
          <p className="text-slate-400">Manage your property efficiently</p>
        </div>
        
        <div className="p-8">
          <div className="flex gap-4 mb-6">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${isLogin ? 'bg-kenyaRed text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Login
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-center rounded-lg font-medium transition-colors ${!isLogin ? 'bg-kenyaRed text-white' : 'bg-gray-100 text-gray-600'}`}
            >
              Register
            </button>
          </div>

          {error && (
            <div className={`p-3 rounded-lg text-sm mb-4 ${error.includes('successful') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kenyaRed focus:border-transparent outline-none"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Kenyan format)</label>
                  <input
                    type="tel"
                    placeholder="07..."
                    required
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kenyaRed focus:border-transparent outline-none"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Account Type</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kenyaRed focus:border-transparent outline-none bg-white"
                  >
                    <option value={UserRole.TENANT}>I am a Tenant</option>
                    <option value={UserRole.LANDLORD}>I am a Landlord</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kenyaRed focus:border-transparent outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-kenyaRed focus:border-transparent outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-slate-900 text-white py-3 rounded-lg font-bold hover:bg-slate-800 transition-colors mt-6"
            >
              {isLogin ? 'Access Dashboard' : 'Create Account'}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Demo Credentials:</p>
            <p>Landlord: landlord@test.com / pass</p>
            <p>Tenant: tenant@test.com / pass</p>
            <p>Admin: admin@simba.co.ke / pass</p>
          </div>
        </div>
      </div>
    </div>
  );
};