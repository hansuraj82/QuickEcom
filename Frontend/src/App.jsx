import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Products from './pages/Product';
import Cart from './pages/Cart';
import ProductDetail from './pages/ProductDetail';
import { setToken } from './handleApi';
import { Dialog } from '@headlessui/react';

export default function App() {
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('user');
    return raw ? JSON.parse(raw) : null;
  });

  const [showUserPopup, setShowUserPopup] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user));
    else localStorage.removeItem('user');
  }, [user]);

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setShowLogoutConfirm(false);
  };

  const nav = (
    <header className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 shadow-lg p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <div className="text-2xl font-extrabold text-white tracking-wide">QuickEcom</div>
        <nav className="space-x-6 flex items-center text-white">
          <Link to="/" className="hover:text-teal-300 transition">Products</Link>
          <Link to="/cart" className="hover:text-teal-300 transition">Cart</Link>
          {user ? (
            <>
              <span
                onClick={() => setShowUserPopup(true)}
                className="cursor-pointer hover:text-teal-300 transition"
              >
                {user.name}
              </span>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="ml-2 px-4 py-1.5 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-1.5 bg-teal-500 hover:bg-teal-600 rounded-lg shadow-md text-white transition"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="px-4 py-1.5 bg-yellow-400 hover:bg-yellow-500 rounded-lg shadow-md text-gray-900 transition"
              >
                Signup
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-gray-100 to-gray-200">
      {nav}
      <main className="p-6 max-w-7xl mx-auto">
        <Routes>
          <Route path="/" element={<Products user={user} />} />
          <Route path="/cart" element={<Cart user={user} setUser={setUser} />} />
          <Route
            path="/signup"
            element={<Signup onSignup={(u, token) => { setUser(u); setToken(token); }} />}
          />
          <Route
            path="/login"
            element={<Login onLogin={(u, token) => { setUser(u); setToken(token); }} />}
          />
          <Route path="/product/:id" element={<ProductDetail />} />
        </Routes>
      </main>

      {/* User Details Popup */}
<Dialog open={showUserPopup} onClose={() => setShowUserPopup(false)} className="relative z-50">
  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" aria-hidden="true" />
  <div className="fixed inset-0 flex items-center justify-center p-4">
    <Dialog.Panel className="bg-white rounded-2xl overflow-hidden shadow-2xl w-full max-w-sm border border-gray-200">
      
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 text-center">
        <Dialog.Title className="text-lg font-bold text-white">User Details</Dialog.Title>
      </div>
      
      {/* Body */}
      {user && (
        <div className="p-6 space-y-4 text-gray-700">
          {/* Avatar */}
          <div className="flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 flex items-center justify-center text-white text-2xl font-bold shadow-md">
              {user.name.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="text-center space-y-2">
            <p className="text-xl font-semibold text-gray-900">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>

          <div className="border-t border-gray-200 pt-4 text-sm text-gray-600">
            <p className="italic">Welcome to QuickEcom</p>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-3 flex justify-end">
        <button
          onClick={() => setShowUserPopup(false)}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition transform hover:scale-105"
        >
          Close
        </button>
      </div>
    </Dialog.Panel>
  </div>
</Dialog>


      {/* Logout Confirmation Popup */}
      <Dialog open={showLogoutConfirm} onClose={() => setShowLogoutConfirm(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm border border-gray-200">
            <Dialog.Title className="text-lg font-bold mb-4 text-red-600">Confirm Logout</Dialog.Title>
            <p className="mb-4 text-gray-700">Are you sure you want to logout?</p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg shadow-md transition"
              >
                Logout
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  );
}
