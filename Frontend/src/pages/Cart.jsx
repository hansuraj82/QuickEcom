import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadCart, deleteItem, updateQuantity } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';

export default function Cart() {

document.title = 'View - Cart |  QuickEcom';

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem('user'));

  const cart = useSelector((state) => state.cart.items);

  useEffect(() => {
    if (user) dispatch(loadCart());
  }, [dispatch, user]);

  // If user not logged in
  if (!user) {
    return (
      <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow text-center mt-10">
        <h2 className="text-2xl font-semibold mb-4">Login Required</h2>
        <p className="text-gray-600 mb-6">Please login to create and view your cart.</p>
        <button
          onClick={() => navigate('/login')}
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Calculate total
  const total = cart.reduce((sum, ci) => sum + ci.item.price * ci.qty, 0);

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow mt-10">
      <h2 className="text-2xl font-bold mb-6 border-b pb-3">Your Cart</h2>

      {cart.length === 0 ? (
        <div className="text-center py-10 text-gray-500">Your cart is empty 🛒</div>
      ) : (
        <div className="space-y-4">
          {cart.map((ci) => (
            <div
              key={ci.item._id}
              className="flex items-center justify-between p-4 border rounded-lg hover:shadow-md transition"
            >
              {/* Product Info with Image */}
              <div className="flex items-center gap-4">
                <img
                  src={ci.item.image || 'https://via.placeholder.com/80'}
                  alt={ci.item.title}
                  className="w-20 h-20 object-contain bg-gray-50 rounded"
                />
                <div>
                  <div className="font-semibold">{ci.item.title}</div>
                  <div className="text-sm text-gray-600">{ci.item.category}</div>
                  <div className="text-indigo-600 font-bold mt-1">₹{ci.item.price}</div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    dispatch(updateQuantity({ id: ci.item._id, qty: ci.qty - 1 }))
                  }
                  disabled={ci.qty <= 1}
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
                >
                  -
                </button>

                <span className="px-2 font-semibold">Qty: {ci.qty}</span>

                <button
                  onClick={() =>
                    dispatch(updateQuantity({ id: ci.item._id, qty: ci.qty + 1 }))
                  }
                  className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                >
                  +
                </button>

                <button
                  onClick={() => navigate(`/product/${ci.item._id}`)}
                  className="px-4 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition"
                >
                  Preview
                </button>

                <button
                  onClick={() => dispatch(deleteItem(ci.item._id))}
                  className="px-4 py-1 bg-red-600 text-white rounded hover:bg-red-700 transition"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}

          {/* Cart Total */}
          <div className="flex justify-between items-center mt-6 border-t pt-4">
            <div className="text-lg font-bold">Total: ₹{total}</div>
            <button
              onClick={() => alert('Proceed to checkout')}
              className="px-6 py-2 bg-green-600 text-white rounded-lg shadow hover:bg-green-700 transition"
            >
              Checkout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
