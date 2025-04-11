import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUserRole } from '../utils/decodeToken';
import axios from 'axios';


const AdminPanel = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState('');
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return navigate('/login');

    const role = getUserRole(token);
    setRole(role);

    if (role !== 'admin') {
      alert('Unauthorized: Admins only');
      navigate('/chat');
    } else {
      fetchProducts();
    }
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err) {
      console.error('Failed to fetch products', err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error('Failed to delete', err);
    }
  };

  const handleAdd = async () => {
    const name = prompt('Enter product name:');
    const price = prompt('Enter product price:');
    const description = prompt('Enter description:');
    const size = prompt('Enter size:');
    if (name && price && description && size) {
      try {
        await axios.post('http://localhost:5000/api/products', {
          name, price, description, size
        });
        fetchProducts();
      } catch (err) {
        console.error('Failed to add product', err);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4 text-blue-600">Admin Panel</h1>

      <button
        onClick={handleAdd}
        className="mb-4 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        ➕ Add Product
      </button>

      <div className="overflow-x-auto bg-white rounded shadow p-4">
        <table className="w-full text-left border">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">ID</th>
              <th className="p-2 border">Name</th>
              <th className="p-2 border">Price</th>
              <th className="p-2 border">Size</th>
              <th className="p-2 border">Description</th>
              <th className="p-2 border">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="p-2 border">{p.id}</td>
                <td className="p-2 border">{p.name}</td>
                <td className="p-2 border">${p.price}</td>
                <td className="p-2 border">{p.size}</td>
                <td className="p-2 border">{p.description}</td>
                <td className="p-2 border space-x-2">
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                    onClick={() => handleDelete(p.id)}
                  >
                    Delete
                  </button>
                  {/* Optional Update Button Placeholder */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;
