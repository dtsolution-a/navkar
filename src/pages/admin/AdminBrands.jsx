import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Eye, EyeOff, Upload } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminBrands() {
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ id: '', name: '', shortName: '', tagline: '', color: '#3B82F6', description: '', logo: '', sort_order: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file, 'brands');
      setForm(prev => ({ ...prev, logo: res.url }));
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => { loadBrands(); }, []);

  const loadBrands = async () => {
    try {
      const data = await api.getBrands();
      setBrands(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = brands.filter(b =>
    b.name?.toLowerCase().includes(search.toLowerCase()) ||
    b.id?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ id: '', name: '', shortName: '', tagline: '', color: '#3B82F6', description: '', logo: '', sort_order: 0 });
    setShowModal(true);
  };

  const openEdit = (brand) => {
    setEditing(brand);
    setForm({ ...brand });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        await api.updateBrand(editing.id, form);
      } else {
        await api.createBrand(form);
      }
      setShowModal(false);
      loadBrands();
      refreshSiteData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (brand) => {
    if (!window.confirm(`Delete brand "${brand.name}"? This will also delete all its categories and products.`)) return;
    try {
      await api.deleteBrand(brand.id);
      loadBrands();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleActive = async (brand) => {
    try {
      await api.updateBrand(brand.id, { is_active: brand.is_active ? 0 : 1 });
      loadBrands();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Brands</h1>
          <p className="text-gray-500 mt-1">{brands.length} total brands</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Brand
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search brands..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Brand</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">ID</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Tagline</th>
                <th className="text-center px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(brand => (
                <tr key={brand.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: brand.color }}>
                        {brand.shortName?.charAt(0) || brand.name?.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{brand.name}</p>
                        <p className="text-xs text-gray-500">{brand.shortName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs hidden sm:table-cell">{brand.id}</td>
                  <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-[200px] truncate">{brand.tagline}</td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => handleToggleActive(brand)} className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${brand.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {brand.is_active ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      {brand.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(brand)} className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(brand)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-400">No brands found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Brand' : 'Add New Brand'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Brand ID *</label>
                  <input type="text" value={form.id} onChange={e => setForm({...form, id: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none"
                    disabled={!!editing} required placeholder="e.g. parker" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                  <input type="text" value={form.shortName} onChange={e => setForm({...form, shortName: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                      className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
                    <input type="text" value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tagline</label>
                <input type="text" value={form.tagline} onChange={e => setForm({...form, tagline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Image</label>
                <div className="flex gap-2">
                  <input type="text" value={form.logo} onChange={e => setForm({...form, logo: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent focus:border-accent outline-none" placeholder="/images/brands/parker.jpg" />
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="brand-upload-input" />
                    <label htmlFor="brand-upload-input" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-250 border border-gray-300 text-gray-700 rounded-lg text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
                {form.logo && (
                  <img src={form.logo} alt="Preview" className="mt-2 h-12 w-auto object-contain rounded border bg-white p-1" />
                )}
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
                <button type="submit" disabled={saving} className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors disabled:opacity-50">
                  {saving ? 'Saving...' : editing ? 'Update Brand' : 'Create Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}