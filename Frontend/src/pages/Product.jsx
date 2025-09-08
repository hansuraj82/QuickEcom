import React, { useEffect, useState, useRef, useCallback } from 'react';
import { fetchItems } from '../handleApi';
import { useDispatch, useSelector } from 'react-redux';
import { loadCart, saveCart } from '../slices/cartSlice';
import { Dialog } from '@headlessui/react';
import { Search } from 'lucide-react';

// Custom debounce hook
function useDebounce(value, delay = 500) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);

  return debounced;
}

export default function Products() {

document.title = 'Home |  QuickEcom';

  const [items, setItems] = useState([]);
  const [filters, setFilters] = useState({ q: '', category: '', min: '', max: '', sort: '' });
  const debouncedFilters = useDebounce(filters, 500);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const [showError, setShowError] = useState(false);
  const [toast, setToast] = useState('');

  const dispatch = useDispatch();
  const cart = useSelector((state) => state.cart.items);

  const observer = useRef();

  const buildQuery = (overrides = {}) => {
    const q = {};
    const source = { ...filters, ...overrides };
    if (source.q) q.q = source.q;
    if (source.category) q.category = source.category;
    if (source.min) q.min = source.min;
    if (source.max) q.max = source.max;
    if (source.sort) q.sort = source.sort;
    return q;
  };

  const fetchResults = async ({ pageNum = 1, reset = false } = {}) => {
    if (loading) return;
    setLoading(true);
    try {
      const query = buildQuery();
      const res = await fetchItems({ ...query, page: pageNum, limit: 9 });
      const fetched = Array.isArray(res.data) ? res.data : [];

      if (reset) {
        setItems(fetched);
      } else {
        setItems((prev) => [...prev, ...fetched]);
      }

      setHasMore(fetched.length >= 9);
      setPage(pageNum);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    dispatch(loadCart());
    fetchResults({ pageNum: 1, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  const lastItemRef = useCallback(
    (node) => {
      if (loading) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          fetchResults({ pageNum: page + 1, reset: false });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, hasMore, page]
  );

  // Apply button
  const apply = () => {
    if (filters.min && filters.max && Number(filters.min) > Number(filters.max)) {
      setShowError(true);
      return;
    }
    fetchResults({ pageNum: 1, reset: true });
  };

  // Debounced filters (fires when typing stops)
  useEffect(() => {
    if (debouncedFilters.min && debouncedFilters.max && Number(debouncedFilters.min) > Number(debouncedFilters.max)) {
      setShowError(true);
      return;
    }
    fetchResults({ pageNum: 1, reset: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedFilters]);

  // Enter key immediate search
  const onSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      apply();
    }
  };

  const addToCart = (item) => {
    const existing = cart.find((x) => x.item._id === item._id);
    let updated;
    if (existing) {
      updated = cart.map((x) => (x.item._id === item._id ? { ...x, qty: x.qty + 1 } : x));
    } else {
      updated = [...cart, { item, qty: 1 }];
    }
    dispatch(saveCart(updated));
    setToast(`${item.title} added to cart!`);
    setTimeout(() => setToast(''), 1800);
  };

  return (
    <div>
      {/* Search bar */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-11/12 md:w-2/3">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
            <Search size={18} />
          </div>
          <input
            placeholder="Search for products..."
            value={filters.q}
            onChange={(e) => setFilters({ ...filters, q: e.target.value })}
            onKeyDown={onSearchKeyDown}
            className="w-full pl-11 pr-4 py-3 border rounded-full shadow-sm focus:ring-2 focus:ring-indigo-400 outline-none bg-white"
          />
        </div>
      </div>

      {/* Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow flex gap-4 items-end justify-between">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 flex-1">
          <input
            placeholder="Category"
            value={filters.category}
            onChange={(e) => setFilters({ ...filters, category: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
          />
          <input
            placeholder="Min Price"
            type="number"
            value={filters.min}
            onChange={(e) => setFilters({ ...filters, min: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
          />
          <input
            placeholder="Max Price"
            type="number"
            value={filters.max}
            onChange={(e) => setFilters({ ...filters, max: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none"
          />
          <select
            value={filters.sort}
            onChange={(e) => setFilters({ ...filters, sort: e.target.value })}
            className="p-2 border rounded focus:ring-2 focus:ring-indigo-300 outline-none bg-white"
          >
            <option value="">Sort by</option>
            <option value="price_asc">Price: Low → High</option>
            <option value="price_desc">Price: High → Low</option>
          </select>
        </div>
        <button
          onClick={apply}
          className="px-6 py-2 bg-gradient-to-r from-indigo-600 to-blue-500 text-white rounded-lg shadow hover:opacity-95"
        >
          Apply
        </button>
      </div>

      {/* Products */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.length === 0 && !loading ? (
          <div className="col-span-full text-center p-10 bg-white rounded-lg shadow text-gray-500">
            <div className="text-2xl font-semibold mb-2">No Products Found</div>
            <div className="text-sm">Try different keywords or clear filters.</div>
          </div>
        ) : (
          items.map((it, idx) => (
            <div
              key={it._id}
              ref={idx === items.length - 1 ? lastItemRef : null}
              className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition transform hover:-translate-y-1"
            >
              <div className="h-48 flex items-center justify-center bg-gray-50 rounded">
                {it.image ? (
                  <img src={it.image} alt={it.title} className="max-h-44 object-contain" />
                ) : (
                  <span className="text-gray-400">No Image</span>
                )}
              </div>
              <h3 className="font-semibold mt-3 text-gray-800">{it.title}</h3>
              <p className="text-sm text-gray-500">{it.category}</p>
              <div className="flex items-center justify-between mt-3">
                <div className="font-bold text-lg text-indigo-600">₹{it.price}</div>
                <button
                  onClick={() => addToCart(it)}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  Add
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {loading && <div className="text-center mt-6 text-gray-500">Loading more products...</div>}

      {/* Error Popup */}
      <Dialog open={showError} onClose={() => setShowError(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/40" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 shadow-xl w-full max-w-sm">
            <Dialog.Title className="text-lg font-bold mb-4 text-red-600">Invalid Filter</Dialog.Title>
            <p className="mb-4">Minimum price cannot be greater than maximum price.</p>
            <div className="flex justify-end">
              <button
                onClick={() => setShowError(false)}
                className="px-4 py-2 bg-red-600 text-white rounded"
              >
                Okay
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
