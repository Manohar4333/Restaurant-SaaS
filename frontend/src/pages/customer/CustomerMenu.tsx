import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { api } from '../../api/client';
import { useCart } from '../../contexts/CartContext';
import { Search, Plus, Minus, Check, Utensils } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CustomerMenu: React.FC = () => {
  const { restaurantSlug } = useParams<{ restaurantSlug: string }>();
  const [searchParams] = useSearchParams();
  const tableParam = searchParams.get('table');

  const { setContext, addItem, items, updateQuantity } = useCart();

  const [restaurant, setRestaurant] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [tableInfo, setTableInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!restaurantSlug) return;

    setIsLoading(true);
    Promise.all([
      api.get(`/public/restaurants/${restaurantSlug}`),
      api.get(`/public/restaurants/${restaurantSlug}/categories`),
      api.get(`/public/restaurants/${restaurantSlug}/products`),
      tableParam ? api.get(`/public/restaurants/${restaurantSlug}/tables/${tableParam}`).catch(() => null) : null,
    ])
      .then(([restRes, catRes, prodRes, tableRes]) => {
        setRestaurant(restRes.data.data);
        setCategories(catRes.data.data);
        setProducts(prodRes.data.data);
        if (tableRes?.data?.data) {
          setTableInfo(tableRes.data.data);
          setContext(restaurantSlug, tableParam || undefined, tableRes.data.data.tableNumber);
        } else {
          setContext(restaurantSlug);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setIsLoading(false));
  }, [restaurantSlug, tableParam]);

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      activeCategory === 'ALL' ||
      p.categoryId?._id === activeCategory ||
      p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getItemQuantity = (productId: string) => {
    const item = items.find((i) => i.product._id === productId);
    return item ? item.quantity : 0;
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-400">Loading digital menu...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Restaurant Hero Card */}
      <div className="relative bg-gradient-to-br from-orange-600 to-amber-600 text-white p-5 rounded-b-3xl shadow-md">
        <div className="flex items-center gap-3.5 mb-2">
          {restaurant?.logo ? (
            <img src={restaurant.logo} alt="Logo" className="w-14 h-14 rounded-2xl object-cover border-2 border-white/20 shadow-sm" />
          ) : (
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-2xl font-black">
              🍽️
            </div>
          )}
          <div>
            <h1 className="text-xl font-black tracking-tight">{restaurant?.businessName}</h1>
            <p className="text-xs text-orange-100">{restaurant?.address?.city || 'Downtown'}</p>
          </div>
        </div>

        {tableInfo && (
          <div className="mt-3 bg-white/15 backdrop-blur-md rounded-xl px-3 py-1.5 inline-flex items-center gap-2 text-xs font-semibold">
            <span>Dining at Table: {tableInfo.tableNumber}</span>
          </div>
        )}
      </div>

      {/* Search Input */}
      <div className="px-4">
        <div className="bg-white rounded-2xl p-2.5 px-3.5 border border-slate-200 shadow-sm flex items-center gap-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasty food..."
            className="flex-1 bg-transparent text-sm focus:outline-none placeholder-slate-400"
          />
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        <button
          onClick={() => setActiveCategory('ALL')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
            activeCategory === 'ALL'
              ? 'bg-orange-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
          }`}
        >
          All Items
        </button>
        {categories.map((c) => (
          <button
            key={c._id}
            onClick={() => setActiveCategory(c._id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
              activeCategory === c._id
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {/* Product List */}
      <div className="px-4 space-y-3">
        {filteredProducts.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">No dishes found.</div>
        ) : (
          filteredProducts.map((p) => {
            const quantity = getItemQuantity(p._id);
            const isAvailable = p.availability === 'AVAILABLE';

            return (
              <div
                key={p._id}
                className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between gap-4"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 text-sm">{p.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-2 my-1">{p.description}</p>
                  <p className="text-sm font-extrabold text-slate-900">₹{p.price}</p>
                </div>

                <div>
                  {!isAvailable ? (
                    <span className="text-[11px] font-semibold text-rose-500 bg-rose-50 px-2 py-1 rounded-lg">
                      Unavailable
                    </span>
                  ) : quantity === 0 ? (
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => addItem(p, 1, restaurantSlug)}
                      className="rounded-xl px-3 py-1.5 text-xs"
                    >
                      <Plus className="w-3.5 h-3.5 mr-1" />
                      Add
                    </Button>
                  ) : (
                    <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 rounded-xl p-1">
                      <button
                        onClick={() => updateQuantity(p._id, quantity - 1)}
                        className="w-7 h-7 rounded-lg bg-white text-orange-600 flex items-center justify-center font-bold text-xs shadow-sm"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="font-extrabold text-xs text-orange-950 px-1">{quantity}</span>
                      <button
                        onClick={() => updateQuantity(p._id, quantity + 1)}
                        className="w-7 h-7 rounded-lg bg-orange-600 text-white flex items-center justify-center font-bold text-xs shadow-sm"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
