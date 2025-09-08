import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchItemById } from '../handleApi'; // ⬅️ you need this API

export default function ProductDetail() {

document.title = 'Product - Detail |  QuickEcom';

  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchItemById(id); // call backend /items/:id
        setProduct(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (!product) return <div>Product not found</div>;

  return (
    <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded"
      >
        ← Back
      </button>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex items-center justify-center bg-gray-100 rounded">
          {product.image ? (
            <img src={product.image} alt={product.title} className="max-h-80" />
          ) : (
            <span>No Image</span>
          )}
        </div>
        <div>
          <h2 className="text-2xl font-bold">{product.title}</h2>
          <p className="text-gray-600">{product.category}</p>
          <p className="mt-4 text-lg">Price: ₹{product.price}</p>
          <p className="mt-2">{product.description}</p>
        </div>
      </div>
    </div>
  );
}
