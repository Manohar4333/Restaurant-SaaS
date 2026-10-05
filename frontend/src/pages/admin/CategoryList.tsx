import React, { useEffect, useState } from 'react';
import { api } from '../../api/client';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Plus, Tags, Trash2 } from 'lucide-react';

export const CategoryList: React.FC = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const fetchCategories = () => {
    setIsLoading(true);
    api
      .get('/admin/categories')
      .then((res) => setCategories(res.data.data))
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/admin/categories', { name, description, sortOrder: categories.length + 1 });
      setIsModalOpen(false);
      setName('');
      setDescription('');
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete category? Dishes under this category will need reassignment.')) return;
    try {
      await api.delete(`/admin/categories/${id}`);
      fetchCategories();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Menu Categories</h1>
          <p className="text-sm text-slate-500">Organize your dishes into digital menu sections (Starters, Main, Biryani, etc.)</p>
        </div>
        <Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Category
        </Button>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {categories.map((c) => (
          <div
            key={c._id}
            className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex items-center justify-between hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                <Tags className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">{c.name}</h3>
                <p className="text-xs text-slate-400">Order Priority: #{c.sortOrder}</p>
              </div>
            </div>
            <button
              onClick={() => handleDelete(c._id)}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Tandoori Specials"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short note about this section"
              rows={2}
              className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
