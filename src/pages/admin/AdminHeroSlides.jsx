import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Eye, EyeOff, Upload } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminHeroSlides() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ image: '', tag: '', headline: '', sub: '', accent: 'from-blue-600/20 to-indigo-900/60', sort_order: 0, is_active: 1 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadSlides(); }, []);

  const loadSlides = async () => {
    try {
      const data = await api.getHeroSlides();
      setSlides(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = slides.filter(s =>
    s.headline?.toLowerCase().includes(search.toLowerCase()) ||
    s.tag?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ image: '', tag: '', headline: '', sub: '', accent: 'from-blue-600/20 to-indigo-900/60', sort_order: 0, is_active: 1 });
    setShowModal(true);
  };

  const openEdit = (slide) => {
    setEditing(slide);
    setForm({ ...slide });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.image || !form.headline) return alert('Image and Headline are required');
    setSaving(true);
    try {
      if (editing) {
        await api.updateHeroSlide(editing.id, form);
      } else {
        await api.createHeroSlide(form);
      }
      setShowModal(false);
      loadSlides();
      refreshSiteData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (slide) => {
    if (!window.confirm(`Delete slide "${slide.headline}"?`)) return;
    try {
      await api.deleteHeroSlide(slide.id);
      loadSlides();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleActive = async (slide) => {
    try {
      await api.updateHeroSlide(slide.id, { ...slide, is_active: slide.is_active ? 0 : 1 });
      loadSlides();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file, 'hero');
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
          <h1 className="text-2xl font-bold text-gray-900">Hero Carousel Slides</h1>
          <p className="text-gray-500 mt-1">{slides.length} total banner slides</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Slide
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search slides..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
        />
      </div>

      {/* Slide List */}
      <div className="space-y-4">
        {filtered.map(slide => (
          <div key={slide.id} className={`bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center gap-4 ${!slide.is_active ? 'opacity-65' : ''}`}>
            {slide.image && (
              <div className="w-full md:w-44 aspect-[16/9] rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-200">
                <img src={slide.image} alt="" className="w-full h-full object-cover" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="text-[10px] font-bold tracking-wider text-accent uppercase">{slide.tag || 'No Tag'}</span>
                  <h3 className="font-semibold text-gray-900 text-base mt-0.5">{slide.headline}</h3>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2">{slide.sub}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => handleToggleActive(slide)}
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${slide.is_active ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {slide.is_active ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                    {slide.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button onClick={() => openEdit(slide)} className="p-1.5 text-gray-400 hover:text-accent hover:bg-accent/5 rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(slide)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-55 rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 text-xs text-gray-400 font-mono">
                <span>Order: {slide.sort_order}</span>
                <span className="truncate max-w-[200px]">Color Wash: {slide.accent}</span>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="py-12 text-center text-gray-400 bg-white rounded-xl border border-gray-200">No slides found</div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Slide' : 'Add Slide'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slide Image *</label>
                <div className="flex gap-2">
                  <input type="text" value={form.image} onChange={e => setForm({...form, image: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="/images/hero/slide-1.jpg" required />
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="hero-upload-input" />
                    <label htmlFor="hero-upload-input" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-250 border border-gray-300 text-gray-700 rounded-lg text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
                {form.image && (
                  <img src={form.image} alt="Preview" className="mt-2 h-24 w-auto object-cover rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tag Line (distributor/partner info)</label>
                <input type="text" value={form.tag} onChange={e => setForm({...form, tag: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. Parker Hannifin · Authorized Distributor" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slide Headline *</label>
                <input type="text" value={form.headline} onChange={e => setForm({...form, headline: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. India's Trusted Partner" required />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Slide Subheadline</label>
                <input type="text" value={form.sub} onChange={e => setForm({...form, sub: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. Pneumatics · Hydraulics · Instrumentation" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Accent Wash CSS</label>
                  <select value={form.accent} onChange={e => setForm({...form, accent: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none">
                    <option value="from-blue-600/20 to-indigo-900/60">Blue Gradient</option>
                    <option value="from-sky-700/20 to-blue-950/60">Sky Blue Gradient</option>
                    <option value="from-indigo-700/20 to-slate-950/60">Indigo Dark Gradient</option>
                    <option value="from-teal-700/20 to-blue-950/60">Teal Clean Energy</option>
                    <option value="from-purple-700/20 to-indigo-950/60">Purple Gradient</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                  <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" />
                </div>
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
