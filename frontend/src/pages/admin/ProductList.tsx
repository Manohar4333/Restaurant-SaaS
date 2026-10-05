import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { Plus, Search, UtensilsCrossed, Trash2 } from 'lucide-react';

export const ProductList: React.FC = () => {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    categoryId: '',
    name: '',
    description: '',
    price: 100,
  });

  const fetchData = () => {
    setIsLoading(true);
    Promise.all([
      api.get(`/admin/products?search=${search}`),
      api.get('/admin/categories'),
    ])
      .then(([prodRes, catRes]) => {
        setProducts(prodRes.data.data.items);
        setCategories(catRes.data.data);
        if (catRes.data.data.length > 0 && !formData.categoryId) {
          setFormData((prev) => ({ ...prev, categoryId: catRes.data.data[0]._id }));
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const toggleAvailability = async (productId: string) => {
    try {
      await api.patch(`/admin/products/${productId}/availability`, {});
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update availability');
    }
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/admin/products/${productId}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/products', {
        ...formData,
        price: Number(formData.price),
      });
      setIsModalOpen(false);
      setFormData({ categoryId: categories[0]?._id || '', name: '', description: '', price: 100 });
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create product');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Products</h1>
          <p className="text-sm text-slate-500">Manage dishes, prices, and fast kitchen availability toggles</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Menu Item
        </Button>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search products by dish name..."
          className="flex-1 bg-transparent text-sm focus:outline-none placeholder-slate-400"
        />
      </div>

      {/* Grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <div className="col-span-full py-16 text-center text-slate-400">Loading products...</div>
        ) : products.length === 0 ? (
          <div className="col-span-full py-16 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            No products found.
          </div>
        ) : (
          products.map((p) => (
            <div
              key={p._id}
              className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {p.categoryId?.name || 'General'}
                  </span>
                  <Badge variant={p.availability === 'AVAILABLE' ? 'success' : 'danger'}>
                    {p.availability}
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 text-base mb-1">{p.name}</h4>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{p.description || 'Delicious freshly prepared dish.'}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-lg font-black text-slate-900">₹{p.price}</span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleAvailability(p._id)}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700"
                  >
                    Toggle
                  </button>
                  <button
                    onClick={() => handleDelete(p._id)}
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Product">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              required
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Product Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              placeholder="e.g. Garlic Naan"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Price (₹)</label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
              required
              min={0}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Short description of ingredients and preparation"
              rows={3}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Add Item
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
