import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, Search, X, Eye, EyeOff, Upload } from 'lucide-react';
import api from './AdminAPI';
import { refreshSiteData } from '../../hooks/useSiteData';

export default function AdminGallery() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ url: '', title: '', sort_order: 0, is_active: 1 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadPhotos(); }, []);

  const loadPhotos = async () => {
    try {
      const data = await api.getGalleryPhotos();
      setPhotos(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const filtered = photos.filter(p =>
    p.title?.toLowerCase().includes(search.toLowerCase()) ||
    p.url?.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ url: '', title: '', sort_order: 0, is_active: 1 });
    setShowModal(true);
  };

  const openEdit = (photo) => {
    setEditing(photo);
    setForm({ ...photo });
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.url) return alert('Photo URL/File is required');
    setSaving(true);
    try {
      if (editing) {
        await api.updateGalleryPhoto(editing.id, form);
      } else {
        await api.createGalleryPhoto(form);
      }
      setShowModal(false);
      loadPhotos();
      refreshSiteData();
    } catch (err) { alert(err.message); }
    finally { setSaving(false); }
  };

  const handleDelete = async (photo) => {
    if (!window.confirm(`Delete photo "${photo.title || 'Untitled'}"?`)) return;
    try {
      await api.deleteGalleryPhoto(photo.id);
      loadPhotos();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleToggleActive = async (photo) => {
    try {
      await api.updateGalleryPhoto(photo.id, { ...photo, is_active: photo.is_active ? 0 : 1 });
      loadPhotos();
      refreshSiteData();
    } catch (err) { alert(err.message); }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await api.uploadFile(file, 'gallery');
      setForm(prev => ({ ...prev, url: res.url, title: prev.title || file.name.split('.').shift() }));
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
          <h1 className="text-2xl font-bold text-gray-900">Gallery Photos</h1>
          <p className="text-gray-500 mt-1">{photos.length} total gallery slider photos</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2 px-4 py-2 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors text-sm font-medium">
          <Plus className="w-4 h-4" /> Add Photo
        </button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text" placeholder="Search photos..."
          value={search} onChange={e => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none"
        />
      </div>

      {/* Grid of gallery cards for visual editing */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-gray-400">No photos found</div>
        ) : filtered.map(photo => (
          <div key={photo.id} className={`bg-white rounded-xl border border-gray-200 overflow-hidden flex flex-col hover:shadow-md transition-shadow ${!photo.is_active ? 'opacity-60' : ''}`}>
            <div className="relative aspect-[3/2] bg-gray-100 border-b border-gray-150">
              <img src={photo.url} alt="" className="w-full h-full object-cover" />
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => handleToggleActive(photo)}
                  className={`p-1.5 rounded-lg border backdrop-blur-md shadow-sm transition-colors ${photo.is_active ? 'bg-white/90 text-green-600 border-gray-100 hover:bg-white' : 'bg-gray-800/80 text-gray-400 border-gray-700 hover:bg-gray-800'}`}
                  title={photo.is_active ? 'Deactivate' : 'Activate'}
                >
                  {photo.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => openEdit(photo)}
                  className="p-1.5 rounded-lg border bg-white/90 text-gray-600 border-gray-100 hover:bg-white backdrop-blur-md shadow-sm"
                  title="Edit Description / Order"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(photo)}
                  className="p-1.5 rounded-lg border bg-red-50 text-red-600 border-red-100 hover:bg-red-100 shadow-sm"
                  title="Delete Photo"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[10px] font-mono text-white">
                Order: {photo.sort_order}
              </span>
            </div>
            <div className="p-3 flex-1 flex flex-col justify-between">
              <h3 className="font-semibold text-sm text-gray-800 truncate mb-1">{photo.title || 'Untitled'}</h3>
              <p className="text-[10px] text-gray-400 font-mono truncate">{photo.url}</p>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">{editing ? 'Edit Photo' : 'Add Photo'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="p-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Photo Image *</label>
                <div className="flex gap-2">
                  <input type="text" value={form.url} onChange={e => setForm({...form, url: e.target.value})}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="/images/gallery/photo.jpg" required />
                  <div className="relative">
                    <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" id="gallery-upload-input" />
                    <label htmlFor="gallery-upload-input" className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-250 border border-gray-300 text-gray-700 rounded-lg text-sm cursor-pointer transition-colors">
                      <Upload className="w-4 h-4" /> {uploading ? '...' : 'Upload'}
                    </label>
                  </div>
                </div>
                {form.url && (
                  <img src={form.url} alt="Preview" className="mt-2 h-24 w-auto object-cover rounded border" />
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Image Description / Title</label>
                <input type="text" value={form.title} onChange={e => setForm({...form, title: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-accent outline-none" placeholder="e.g. Surat Office Reception" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Sort Order</label>
                <input type="number" value={form.sort_order} onChange={e => setForm({...form, sort_order: parseInt(e.target.value) || 0})}
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
