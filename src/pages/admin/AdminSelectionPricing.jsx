import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Tag, Pencil, Save, Power } from 'lucide-react';
import api from './AdminAPI';

const CATEGORY_META = [
  { key: 'compressorMarkupPct', label: 'Air Compressor' },
  { key: 'dryerMarkupPct', label: 'Air Dryer' },
  { key: 'filterMarkupPct', label: 'Air Filter' },
];

// A markup form always holds all three category percentages internally —
// "same for all" is just a UI convenience that keeps them in sync while
// the toggle is on, not a different data shape (mirrors the server always
// storing three columns — see schema.js).
const emptyForm = { name: '', sameForAll: true, shared: '0', compressorMarkupPct: '0', dryerMarkupPct: '0', filterMarkupPct: '0' };

function formToPayload(form) {
  if (form.sameForAll) {
    const v = Number(form.shared);
    return { name: form.name, compressorMarkupPct: v, dryerMarkupPct: v, filterMarkupPct: v };
  }
  return {
    name: form.name,
    compressorMarkupPct: Number(form.compressorMarkupPct),
    dryerMarkupPct: Number(form.dryerMarkupPct),
    filterMarkupPct: Number(form.filterMarkupPct),
  };
}

function setToForm(set) {
  const allSame = set.compressorMarkupPct === set.dryerMarkupPct && set.dryerMarkupPct === set.filterMarkupPct;
  return {
    name: set.name,
    sameForAll: allSame,
    shared: String(allSame ? set.compressorMarkupPct : 0),
    compressorMarkupPct: String(set.compressorMarkupPct),
    dryerMarkupPct: String(set.dryerMarkupPct),
    filterMarkupPct: String(set.filterMarkupPct),
  };
}

function MarkupBadge({ pct }) {
  const n = Number(pct);
  const positive = n > 0;
  const zero = n === 0;
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${zero ? 'bg-gray-100 text-gray-500' : positive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
      {positive ? '+' : ''}{n}%
    </span>
  );
}

function PctField({ label, value, onChange }) {
  return (
    <div>
      <label className="block text-xs font-medium text-gray-500 mb-1">{label}</label>
      <div className="relative">
        <input
          type="number"
          step="any"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full border border-gray-300 rounded-lg pl-3 pr-7 py-2 text-sm"
        />
        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">%</span>
      </div>
    </div>
  );
}

function PricingForm({ form, setForm, onSubmit, submitLabel, error }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">Set name</label>
        <input required placeholder="e.g. Set Alpha" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, sameForAll: true }))}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border ${form.sameForAll ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-gray-300 text-gray-600'}`}
        >
          Same % for all categories
        </button>
        <button
          type="button"
          onClick={() => setForm((f) => ({ ...f, sameForAll: false }))}
          className={`flex-1 text-sm px-3 py-2 rounded-lg border ${!form.sameForAll ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-gray-300 text-gray-600'}`}
        >
          Different % per category
        </button>
      </div>

      {form.sameForAll ? (
        <PctField label="Markup / markdown (%)" value={form.shared} onChange={(v) => setForm((f) => ({ ...f, shared: v }))} />
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {CATEGORY_META.map(({ key, label }) => (
            <PctField key={key} label={label} value={form[key]} onChange={(v) => setForm((f) => ({ ...f, [key]: v }))} />
          ))}
        </div>
      )}
      <p className="text-xs text-gray-400">
        Positive adds to the real list price (e.g. 20 = +20%), negative subtracts (e.g. -20 = -20%). Applies on top of
        the catalog's own price — a salesman with no set assigned sees the real price, unmarked up.
      </p>

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      <button className="btn-primary w-full justify-center text-sm">{submitLabel}</button>
    </form>
  );
}

export default function AdminSelectionPricing() {
  const [sets, setSets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewSet, setShowNewSet] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [newError, setNewError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState('');

  const loadSets = async () => {
    setLoading(true);
    try {
      const data = await api.request('GET', '/selection-tool/admin/pricing-sets');
      setSets(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadSets(); }, []);

  const createSet = async (e) => {
    e.preventDefault();
    setNewError('');
    try {
      await api.request('POST', '/selection-tool/admin/pricing-sets', formToPayload(newForm));
      setNewForm(emptyForm);
      setShowNewSet(false);
      loadSets();
    } catch (err) { setNewError(err.message); }
  };

  const startEdit = (set) => {
    setEditingId(set.id);
    setEditForm(setToForm(set));
    setEditError('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    try {
      await api.request('PUT', `/selection-tool/admin/pricing-sets/${editingId}`, formToPayload(editForm));
      setEditingId(null);
      loadSets();
    } catch (err) { setEditError(err.message); }
  };

  const toggleActive = async (set) => {
    try {
      await api.request('PUT', `/selection-tool/admin/pricing-sets/${set.id}`, { isActive: !set.isActive });
      loadSets();
    } catch (err) { alert(err.message); }
  };

  const deleteSet = async (set) => {
    if (!window.confirm(`Delete pricing set "${set.name}"? This is blocked if any salesman is still assigned.`)) return;
    try {
      await api.request('DELETE', `/selection-tool/admin/pricing-sets/${set.id}`);
      if (editingId === set.id) setEditingId(null);
      loadSets();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Pricing sets</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Each set is a % markup or markdown on the catalog's real price — same across all categories, or set
            independently per category. Assign a set to a salesman on the Salesmen page; unassigned salesmen see the
            real price.
          </p>
        </div>
        <button onClick={() => setShowNewSet(true)} className="btn-primary text-sm">
          <Plus className="w-4 h-4" /> New set
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Loading…</p>
        ) : sets.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No pricing sets yet.</p>
        ) : sets.map((s) => (
          <div key={s.id} className="p-4">
            {editingId === s.id ? (
              <div className="max-w-lg">
                <PricingForm form={editForm} setForm={setEditForm} onSubmit={saveEdit} submitLabel="Save changes" error={editError} />
                <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Cancel</button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Tag className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{s.name}</span>
                    {!s.isActive && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    {CATEGORY_META.map(({ key, label }) => (
                      <span key={key} className="inline-flex items-center gap-1.5 text-xs text-gray-500">
                        {label} <MarkupBadge pct={s[key]} />
                      </span>
                    ))}
                  </div>
                </div>
                <div className="inline-flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} title={s.isActive ? 'Deactivate' : 'Activate'} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(s)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteSet(s)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showNewSet && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">New pricing set</h2>
              <button onClick={() => setShowNewSet(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <PricingForm form={newForm} setForm={setNewForm} onSubmit={createSet} submitLabel="Create" error={newError} />
          </div>
        </div>
      )}
    </div>
  );
}
