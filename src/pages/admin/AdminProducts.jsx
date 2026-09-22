import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, GripVertical, Upload } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [brandFilter, setBrandFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: '', categoryId: '', name: '', description: '', image: '', specs: [], sort_order: 0, catalogue_page: '' });
  const [specInput, setSpecInput] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [prods, cats, brs] = await Promise.all([api.getProducts(), api.getCategories(), api.getBrands()]);
      setProducts(prods);
      setCategories(cats);
      setBrands(brs);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = products.filter(p => {
    const matchSearch = p.name?.toLowerCase().includes(search.toLowerCase()) || p.id?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !categoryFilter || p.categoryId === categoryFilter;
    return matchSearch && matchCat;
  });

  const categoriesFiltered = brandFilter
    ? categories.filter(c => c.brandId === brandFilter)
    : categories;

  const getCategoryName = (catId) => categories.find(c => c.id === catId)?.name || catId;
  const getBrandForCategory = (catId) => {
    const cat = categories.find(c => c.id === catId);
    if (!cat) return '';
    const brand = brands.find(b => b.id === cat.brandId);
    return brand?.name || '';
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ id: '', categoryId: '', name: '', description: '', image: '', specs: [], sort_order: 0, catalogue_page: '' });
    setSpecInput('');
    setShowModal(true);
  };

  const openEdit = (prod) => {
    setEditing(prod);
    setForm({ ...prod, specs: prod.specs || [] });
    setSpecInput('');
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { ...form, catalogue_page: form.catalogue_page === '' ? null : Number(form.catalogue_page) };
      if (editing) {
        await api.updateProduct(editing.id, payload);
      } else {
        await api.createProduct(payload);
      }
      setShowModal(false);
      loadData();
      refreshSiteData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (prod) => {
    if (!window.confirm(`Delete product "${prod.name}"?`)) return;
    try {
      await api.deleteProduct(prod.id);
      loadData();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const addSpec = () => {
    if (specInput.trim()) {
      setForm({ ...form, specs: [...form.specs, specInput.trim()] });
      setSpecInput('');
    }
  };

  const removeSpec = (index) => {
    setForm({ ...form, specs: form.specs.filter((_, i) => i !== index) });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await api.uploadFile(file, 'products');
      setForm({ ...form, image: result.url });
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products</h1>
          <p className="text-gray-500 mt-1">{products.length} total products</p>
        </div>
        <button onClick={openCreate} className="flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
        </div>
        <select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setCategoryFilter(''); }}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none">
          <option value="">All Brands</option>
          {brands.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
        </select>
        <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none">
          <option value="">All Categories</option>
          {categoriesFiltered.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Product</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden lg:table-cell">Brand</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">ID</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(prod => (
                <tr key={prod.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                        {prod.image ? (
                          <img src={prod.image} alt="" className="w-full h-full object-cover" onError={e => e.target.style.display = 'none'} />
                        ) : (
                          <span className="text-xs text-gray-400">No img</span>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{prod.name}</p>
                        <p className="text-xs text-gray-500 line-clamp-1 max-w-[250px]">{prod.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{getCategoryName(prod.categoryId)}</td>
                  <td className="px-4 py-3 text-gray-500 hidden lg:table-cell">{getBrandForCategory(prod.categoryId)}</td>
                  <td className="px-4 py-3 text-gray-400 font-mono text-xs hidden sm:table-cell">{prod.id}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(prod)} className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(prod)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No products found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product ID *</label>
                  <input type="text" value={form.id} onChange={e => setForm({...form, id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                    disabled={!!editing} required placeholder="e.g. p-pn-001" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
                  <select value={form.categoryId} onChange={e => setForm({...form, categoryId: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required>
                    <option value="">Select Category</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({brands.find(b => b.id === c.brandId)?.shortName || c.brandId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
                <div className="flex gap-3">
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="Image URL" />
                  <label className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                  </label>
                </div>
                {form.image && (
                  <div className="mt-2 relative inline-block">
                    <img src={form.image} alt="" className="h-20 rounded-lg border border-gray-200" onError={e => e.target.style.display = 'none'} />
                    <button type="button" onClick={() => setForm({...form, image: ''})} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"><X className="w-3 h-3" /></button>
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catalogue page number</label>
                <input type="number" min="1" step="1" value={form.catalogue_page ?? ''} onChange={e => setForm({...form, catalogue_page: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 24" />
                <p className="text-xs text-gray-400 mt-1">Page inside the fixed "Navkar Catalogue 2026" PDF — clicking this product on the site opens the catalogue at this page. Leave blank if not in the catalogue.</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Specifications</label>
                <div className="flex gap-2 mb-2">
                  <input type="text" value={specInput} onChange={e => setSpecInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
                    placeholder="Add specification (e.g. Pressure: 10 bar)" />
                  <button type="button" onClick={addSpec} className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm">Add</button>
                </div>
                {form.specs.length > 0 && (
                  <div className="space-y-1">
                    {form.specs.map((spec, i) => (
                      <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg text-sm">
                        <GripVertical className="w-3 h-3 text-gray-300" />
                        <span className="flex-1">{spec}</span>
                        <button type="button" onClick={() => removeSpec(i)} className="text-red-400 hover:text-red-600"><X className="w-3.5 h-3.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}