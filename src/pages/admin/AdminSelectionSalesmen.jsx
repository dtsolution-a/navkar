import { useEffect, useState } from 'react';
import { Plus, X, UserCog, Ban, CheckCircle2, Archive, Pencil } from 'lucide-react';
import api from './AdminAPI';

const STATUS_STYLES = {
  active: 'bg-green-50 text-green-700',
  inactive: 'bg-amber-50 text-amber-700',
  archived: 'bg-gray-100 text-gray-500',
};

const emptyCreateForm = { username: '', email: '', password: '' };
const emptyEditForm = { username: '', email: '', password: '' };

export default function AdminSelectionSalesmen() {
  const [salesmen, setSalesmen] = useState([]);
  const [pricingSets, setPricingSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [createForm, setCreateForm] = useState(emptyCreateForm);
  const [editing, setEditing] = useState(null); // salesman row being edited, or null
  const [editForm, setEditForm] = useState(emptyEditForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const [s, p] = await Promise.all([
        api.request('GET', '/selection-tool/admin/salesmen'),
        api.request('GET', '/selection-tool/admin/pricing-sets'),
      ]);
      setSalesmen(s);
      setPricingSets(p);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const createSalesman = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      await api.request('POST', '/selection-tool/admin/salesmen', createForm);
      setShowCreate(false);
      setCreateForm(emptyCreateForm);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const openEdit = (s) => {
    setEditing(s);
    setEditForm({ username: s.username, email: s.email, password: '' });
    setError('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { username: editForm.username, email: editForm.email };
      if (editForm.password) payload.password = editForm.password;
      await api.request('PUT', `/selection-tool/admin/salesmen/${editing.id}`, payload);
      setEditing(null);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const setStatus = async (salesman, status) => {
    await api.request('PATCH', `/selection-tool/admin/salesmen/${salesman.id}/status`, { status });
    load();
  };

  const assignPricingSet = async (salesman, pricingSetId) => {
    await api.request('PATCH', `/selection-tool/admin/salesmen/${salesman.id}/pricing-set`, { pricingSetId: pricingSetId || null });
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Salesmen</h1>
          <p className="text-sm text-gray-500 mt-0.5">Selection Tool logins — create accounts and control pricing visibility per salesman.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New salesman
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Username</th>
              <th className="text-left px-4 py-3 font-medium">Email</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Pricing set</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : salesmen.length === 0 ? (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">No salesmen yet.</td></tr>
            ) : salesmen.map((s) => (
              <tr key={s.id}>
                <td className="px-4 py-3 font-medium text-gray-900 flex items-center gap-2">
                  <UserCog className="w-4 h-4 text-gray-400" /> {s.username}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${STATUS_STYLES[s.status] || STATUS_STYLES.active}`}>{s.status}</span>
                </td>
                <td className="px-4 py-3">
                  <select
                    value={s.pricing_set_id || ''}
                    onChange={(e) => assignPricingSet(s, e.target.value)}
                    className="text-sm border border-gray-300 rounded-lg px-2 py-1.5"
                  >
                    <option value="">— None (pricing hidden) —</option>
                    {pricingSets.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button title="Edit" onClick={() => openEdit(s)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    {s.status !== 'active' && (
                      <button title="Activate" onClick={() => setStatus(s, 'active')} className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg"><CheckCircle2 className="w-4 h-4" /></button>
                    )}
                    {s.status === 'active' && (
                      <button title="Deactivate" onClick={() => setStatus(s, 'inactive')} className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg"><Ban className="w-4 h-4" /></button>
                    )}
                    {s.status !== 'archived' && (
                      <button title="Archive" onClick={() => setStatus(s, 'archived')} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"><Archive className="w-4 h-4" /></button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New salesman login</h2>
              <button onClick={() => setShowCreate(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={createSalesman} className="space-y-3">
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <input required placeholder="Username" value={createForm.username} onChange={(e) => setCreateForm((f) => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              <input required type="email" placeholder="Email" value={createForm.email} onChange={(e) => setCreateForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              <input required type="password" placeholder="Password" value={createForm.password} onChange={(e) => setCreateForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              <button disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-60">{saving ? 'Creating…' : 'Create login'}</button>
            </form>
          </div>
        </div>
      )}

      {editing && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">Edit {editing.username}</h2>
              <button onClick={() => setEditing(null)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveEdit} className="space-y-3">
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Username</label>
                <input required value={editForm.username} onChange={(e) => setEditForm((f) => ({ ...f, username: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Email</label>
                <input required type="email" value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">New password (leave blank to keep current)</label>
                <input type="password" placeholder="••••••••" value={editForm.password} onChange={(e) => setEditForm((f) => ({ ...f, password: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
              </div>
              <button disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-60">{saving ? 'Saving…' : 'Save changes'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
