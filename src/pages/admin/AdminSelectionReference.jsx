import { useEffect, useState } from 'react';
import { Plus, X, Trash2, Pencil, FileText, Power, Upload } from 'lucide-react';
import api from './AdminAPI';

const CATEGORIES = [
  { value: 'compressor', label: 'Air Compressor' },
  { value: 'dryer', label: 'Air Dryer' },
  { value: 'filter', label: 'Air Filter' },
];

const API_BASE = (import.meta.env.VITE_API_URL || '') + '/api';

// Table data is edited as tab-separated text (paste straight from Excel/
// Sheets) rather than raw JSON — first line is the header row, every line
// after is a data row. Converts both ways so an existing entry can be
// re-opened and edited the same way it was typed in.
function tableDataToTsv(tableData) {
  if (!tableData) return '';
  const { columns = [], rows = [] } = tableData;
  return [columns, ...rows].map((r) => r.join('\t')).join('\n');
}
function tsvToTableData(tsv) {
  const lines = tsv.split('\n').map((l) => l.replace(/\r$/, '')).filter((l) => l.trim() !== '');
  if (lines.length === 0) return null;
  const [header, ...rest] = lines.map((l) => l.split('\t'));
  return { columns: header, rows: rest };
}

const emptyForm = { name: '', category: 'compressor', brand: '', family: '', tableTsv: '', pdfPage: '', file: null, removePdf: false };

function formToFormData(form, { isUpdate } = {}) {
  const fd = new FormData();
  fd.append('name', form.name);
  fd.append('category', form.category);
  fd.append('brand', form.brand || '');
  fd.append('family', form.family || '');
  const tableData = form.tableTsv.trim() ? tsvToTableData(form.tableTsv) : null;
  fd.append('tableData', tableData ? JSON.stringify(tableData) : '');
  fd.append('pdfPage', form.pdfPage || '');
  if (form.file) fd.append('file', form.file);
  if (isUpdate && form.removePdf) fd.append('removePdf', 'true');
  return fd;
}

async function submitMultipart(method, url, formData) {
  const token = localStorage.getItem('admin_token');
  const res = await fetch(`${API_BASE}${url}`, { method, headers: { Authorization: `Bearer ${token}` }, body: formData });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

function seriesToForm(s) {
  return {
    name: s.name,
    category: s.category,
    brand: s.brand || '',
    family: s.family || '',
    tableTsv: tableDataToTsv(s.tableData),
    pdfPage: s.pdfPage ? String(s.pdfPage) : '',
    file: null,
    removePdf: false,
  };
}

function ReferenceForm({ form, setForm, existingPdf, onSubmit, submitLabel, error, saving }) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Series name</label>
          <input required placeholder="e.g. KRD series" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
          <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Brand (optional — blank matches any)</label>
          <input placeholder="e.g. Kaishan" value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Family (optional — blank matches any under this brand)</label>
          <input placeholder="e.g. KRD" value={form.family} onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        Shown to a salesman only when a matched result's brand/family fits this rule — and only after they tap "Show
        reference table" for it, never automatically.
      </p>

      <div>
        <label className="block text-xs font-medium text-gray-500 mb-1">
          Table data (optional) — paste straight from Excel/Sheets, first row is the header
        </label>
        <textarea
          rows={6}
          value={form.tableTsv}
          onChange={(e) => setForm((f) => ({ ...f, tableTsv: e.target.value }))}
          placeholder={'Model\tFlow cfm\tPower kW\nKRD 2\t10\t0.18\nKRD 3\t14\t0.25'}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm font-mono text-xs"
        />
      </div>

      <div className="grid sm:grid-cols-2 gap-3 items-end">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">PDF (optional)</label>
          <input type="file" accept=".pdf" onChange={(e) => setForm((f) => ({ ...f, file: e.target.files[0] || null }))} className="w-full text-sm" />
          {existingPdf && !form.file && (
            <div className="flex items-center gap-2 mt-1.5">
              <a href={existingPdf.url} target="_blank" rel="noreferrer" className="text-xs text-accent hover:underline inline-flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" /> {existingPdf.name}
              </a>
              <button type="button" onClick={() => setForm((f) => ({ ...f, removePdf: !f.removePdf }))} className={`text-xs ${form.removePdf ? 'text-red-600 font-medium' : 'text-gray-400 hover:text-red-500'}`}>
                {form.removePdf ? 'Will be removed' : 'Remove'}
              </button>
            </div>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Open PDF at page (optional)</label>
          <input type="number" min="1" placeholder="e.g. 8" value={form.pdfPage} onChange={(e) => setForm((f) => ({ ...f, pdfPage: e.target.value }))} className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm" />
        </div>
      </div>
      <p className="text-xs text-gray-400 -mt-2">
        Use this to point several series at one shared multi-page catalog PDF instead of uploading it repeatedly —
        upload it once on the first series, then reuse the same file (re-select it) on the others with their own page number.
      </p>

      {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
      <button disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-50">
        {saving ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}

export default function AdminSelectionReference() {
  const [series, setSeries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('compressor');

  const [showNew, setShowNew] = useState(false);
  const [newForm, setNewForm] = useState(emptyForm);
  const [newError, setNewError] = useState('');
  const [creating, setCreating] = useState(false);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(emptyForm);
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.request('GET', '/selection-tool/admin/reference-series');
      setSeries(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const visible = series.filter((s) => s.category === category);

  const createSeries = async (e) => {
    e.preventDefault();
    setNewError('');
    setCreating(true);
    try {
      await submitMultipart('POST', '/selection-tool/admin/reference-series', formToFormData(newForm));
      setNewForm(emptyForm);
      setShowNew(false);
      load();
    } catch (err) { setNewError(err.message); }
    finally { setCreating(false); }
  };

  const startEdit = (s) => {
    setEditingId(s.id);
    setEditForm(seriesToForm(s));
    setEditError('');
  };

  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setSavingEdit(true);
    try {
      await submitMultipart('PUT', `/selection-tool/admin/reference-series/${editingId}`, formToFormData(editForm, { isUpdate: true }));
      setEditingId(null);
      load();
    } catch (err) { setEditError(err.message); }
    finally { setSavingEdit(false); }
  };

  const toggleActive = async (s) => {
    try {
      await api.request('PUT', `/selection-tool/admin/reference-series/${s.id}`, { isActive: !s.isActive });
      load();
    } catch (err) { alert(err.message); }
  };

  const deleteSeries = async (s) => {
    if (!window.confirm(`Delete reference series "${s.name}"? This also removes its uploaded PDF.`)) return;
    try {
      await api.request('DELETE', `/selection-tool/admin/reference-series/${s.id}`);
      if (editingId === s.id) setEditingId(null);
      load();
    } catch (err) { alert(err.message); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Selection: Reference series</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Vendor spec tables and PDFs shown to a salesman alongside matching results — each entry matches by
            category/brand/family, and stays collapsed until the salesman opts in.
          </p>
        </div>
        <button onClick={() => setShowNew(true)} className="btn-primary text-sm"><Plus className="w-4 h-4" /> New series</button>
      </div>

      <div className="flex items-center gap-3 mb-4">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium ${category === c.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {c.label}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
        {loading ? (
          <p className="p-4 text-sm text-gray-400">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="p-4 text-sm text-gray-400">No reference series for this category yet.</p>
        ) : visible.map((s) => (
          <div key={s.id} className="p-4">
            {editingId === s.id ? (
              <div className="max-w-2xl">
                <ReferenceForm
                  form={editForm}
                  setForm={setEditForm}
                  existingPdf={s.pdfUrl ? { url: s.pdfUrl, name: s.pdfOriginalName } : null}
                  onSubmit={saveEdit}
                  submitLabel="Save changes"
                  error={editError}
                  saving={savingEdit}
                />
                <button onClick={() => setEditingId(null)} className="text-xs text-gray-400 hover:text-gray-600 mt-2">Cancel</button>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">{s.name}</span>
                    {!s.isActive && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Inactive</span>}
                  </div>
                  <p className="text-xs text-gray-500">
                    Matches: {s.brand || 'any brand'} {s.family ? `· ${s.family}` : '· any family'}
                  </p>
                  <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-400">
                    {s.tableData && <span>{s.tableData.rows.length} row table</span>}
                    {s.pdfUrl && (
                      <a href={s.pdfUrl} target="_blank" rel="noreferrer" className="text-accent hover:underline inline-flex items-center gap-1">
                        <FileText className="w-3.5 h-3.5" /> {s.pdfOriginalName}{s.pdfPage ? ` (p.${s.pdfPage})` : ''}
                      </a>
                    )}
                  </div>
                </div>
                <div className="inline-flex gap-1 flex-shrink-0">
                  <button onClick={() => toggleActive(s)} title={s.isActive ? 'Deactivate' : 'Activate'} className="p-1.5 text-gray-400 hover:bg-gray-100 rounded-lg">
                    <Power className="w-4 h-4" />
                  </button>
                  <button onClick={() => startEdit(s)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                  <button onClick={() => deleteSeries(s)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {showNew && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2"><Upload className="w-4 h-4" /> New reference series</h2>
              <button onClick={() => setShowNew(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <ReferenceForm form={newForm} setForm={setNewForm} existingPdf={null} onSubmit={createSeries} submitLabel="Create" error={newError} saving={creating} />
          </div>
        </div>
      )}
    </div>
  );
}
