import React, { useState } from 'react';
import { login, setToken as saveToken } from '../handleApi';
import { useNavigate, Link } from 'react-router-dom';
import { Dialog } from '@headlessui/react';

export default function Login({ onLogin }) {

document.title = 'Login |  QuickEcom';

  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(form);
      const { token, user } = res.data;
      saveToken(token);
      onLogin(user, token);

      // merge local cart into server cart after login
      const localCart = JSON.parse(localStorage.getItem('local_cart') || '[]');
      if (localCart.length) {
        await fetch((import.meta.env.VITE_API_BASE || 'http://localhost:3001') + '/api/cart', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: 'Bearer ' + token,
          },
          body: JSON.stringify({
            items: localCart.map((i) => ({ itemId: i.itemId, qty: i.qty })),
          }),
        });
        localStorage.removeItem('local_cart');
      }

      nav('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-100 via-white to-purple-100">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-gray-100">
        <h2 className="text-2xl font-bold text-center text-indigo-700 mb-6">
          Welcome Back 👋
        </h2>
        <form onSubmit={submit} className="space-y-4">
          <input
            required
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            required
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition duration-200 shadow-md hover:shadow-lg"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Don’t have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-600 hover:underline font-medium"
          >
            Signup
          </Link>
        </p>
      </div>

      {/* Error Popup */}
      <Dialog open={!!error} onClose={() => setError(null)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm border border-red-200">
            <Dialog.Title className="text-lg font-bold mb-2 text-red-600">Login Failed</Dialog.Title>
            <p className="text-gray-700">{error}</p>
            <div className="mt-4 text-right">
              <button
                onClick={() => setError(null)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
