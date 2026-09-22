import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Check, Eye, EyeOff, Upload } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminSolutions() {
  const [solutions, setSolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ icon: 'Package', name: '', description: '', brands: '', href: '', image: '', accent: '#2563EB', number: '', sort_order: 0, is_active: 1 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadSolutions(); }, []);

  const loadSolutions = async () => {
    try {
      const data = await api.getSolutions();
      setSolutions(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = solutions.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.description?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ icon: 'Package', name: '', description: '', brands: '', href: '', image: '', accent: '#2563EB', number: '', sort_order: 0, is_active: 1 });
    setShowModal(true);
  };

  const openEdit = (solution) => {
    setEditing(solution);
    setForm({ ...solution });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.name) return alert('Name is required');
    setSaving(true);
    try {
      if (editing) {
        await api.updateSolution(editing.id, form);
      } else {
        await api.createSolution(form);
      }
      setShowModal(false);
      loadSolutions();
      refreshSiteData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (solution) => {
    if (!window.confirm(`Delete solution "${solution.name}"?`)) return;
    try {
      await api.deleteSolution(solution.id);
      loadSolutions();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleActive = async (solution) => {
    try {
      await api.updateSolution(solution.id, { ...solution, is_active: solution.is_active ? 0 : 1 });
      loadSolutions();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file, 'solutions');
      setForm(prev => ({ ...prev, image: res.url }));
    } catch (err) {
      alert(err.message || 'Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent"></div></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Industrial Solutions</h1>
          <p className="text-gray-500 mt-1">{solutions.length} total solution cards</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Solution
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search solutions..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-250 text-gray-500 font-semibold">
                <th className="px-4 py-3">No. / Icon</th>
                <th className="px-4 py-3">Solution Name</th>
                <th className="px-4 py-3">Brands</th>
                <th className="px-4 py-3">Sort Order</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-150">
              {filtered.map(solution => (
                <tr key={solution.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono text-gray-400">{solution.number || '--'}</span>
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-medium text-accent">
                        {solution.icon}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {solution.image && (
                        <img src={solution.image} alt="" className="w-10 h-7 object-cover rounded bg-gray-50 border border-gray-100" />
                      )}
                      <div>
                        <div className="font-semibold text-gray-900">{solution.name}</div>
                        <div className="text-xs text-gray-500 line-clamp-1">{solution.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-gray-600 text-xs">{solution.brands || 'None'}</span>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs">{solution.sort_order}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleToggleActive(solution)}
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${solution.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}
                    >
                      {solution.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                      {solution.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => openEdit(solution)} className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button onClick={() => handleDelete(solution)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-400">No solutions found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Solution' : 'Add Solution'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Number Prefix</label>
                  <input type="text" value={form.number} onChange={e => setForm({...form, number: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. 01" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Icon Name *</label>
                  <select value={form.icon} onChange={e => setForm({...form, icon: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none">
                    <option value="Wind">Wind (Compressed Air)</option>
                    <option value="Settings2">Settings2 (Pneumatics)</option>
                    <option value="Gauge">Gauge (Instrumentation)</option>
                    <option value="Cable">Cable (Hydraulics)</option>
                    <option value="Zap">Zap (Gas Gen)</option>
                    <option value="Leaf">Leaf (Clean Energy)</option>
                    <option value="Package">Package (Default)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solution Name *</label>
                <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" required />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent Color</label>
                  <div className="flex gap-2">
                    <input type="color" value={form.accent} onChange={e => setForm({...form, accent: e.target.value})}
                      className="w-10 h-9 rounded border border-gray-300 cursor-pointer" />
                    <input type="text" value={form.accent} onChange={e => setForm({...form, accent: e.target.value})}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Brands (comma separated)</label>
                <input type="text" value={form.brands} onChange={e => setForm({...form, brands: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. Parker, Kaishan" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Link Path</label>
                <input type="text" value={form.href} onChange={e => setForm({...form, href: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. /products/parker" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Solution Image</label>
                <div className="flex gap-2">
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="/images/categories/hydraulics.jpg" />
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="sol-upload-input" />
                    <label htmlFor="sol-upload-input" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-250 border border-gray-300 text-gray-700 rounded-lg text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-20 w-auto object-cover rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea rows="3" value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
              </div>

              <div className="flex items-center gap-2">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={form.is_active === 1} onChange={e => setForm({...form, is_active: e.target.checked ? 1 : 0})} className="sr-only peer" />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-accent rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-green-500"></div>
                </label>
                <span className="text-sm text-gray-600">Active / Visible</span>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg">Cancel</button>
                <button type="submit" disabled={saving || uploading} className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg disabled:opacity-50">
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
