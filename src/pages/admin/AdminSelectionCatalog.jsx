import { useEffect, useMemo, useState } from 'react';
import { Plus, X, Trash2, Pencil, Upload, Search, AlertTriangle, CheckCircle2, Loader2, SlidersHorizontal, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';
import api from './AdminAPI';

const CATEGORIES = [
  { value: 'compressor', label: 'Air Compressor' },
  { value: 'dryer', label: 'Air Dryer' },
  { value: 'filter', label: 'Air Filter' },
];

const emptyVariantForm = {
  category: 'compressor', brand: '', family: '', modelCode: '', driveType: '',
  workingPressureBar: '', workingPressureMinBar: '', capacityCfm: '', capacityM3Min: '',
  listPrice: '', specificPower: '', specs: [],
};

const emptyFilters = { brand: '', family: '', driveType: '', pressureMin: '', pressureMax: '', capacityMin: '', capacityMax: '', hasPricing: '' };

export default function AdminSelectionCatalog() {
  const [category, setCategory] = useState('compressor');
  const [query, setQuery] = useState('');
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyVariantForm);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [showUpload, setShowUpload] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [showExport, setShowExport] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.request('GET', `/selection-tool/admin/variants?category=${category}`);
      setVariants(data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [category]);
  // Filters/selection are per-category — switching tabs shouldn't carry over
  // a brand filter or checked rows that don't even apply to the new list.
  useEffect(() => { setFilters(emptyFilters); setSelectedIds(new Set()); setQuery(''); }, [category]);

  const brandOptions = useMemo(() => [...new Set(variants.map((v) => v.brand).filter(Boolean))].sort(), [variants]);
  const familyOptions = useMemo(() => [...new Set(variants.filter((v) => !filters.brand || v.brand === filters.brand).map((v) => v.family).filter(Boolean))].sort(), [variants, filters.brand]);
  const driveOptions = useMemo(() => [...new Set(variants.map((v) => v.drive_type).filter(Boolean))].sort(), [variants]);

  const activeFilterCount = Object.values(filters).filter((v) => v !== '').length;

  // Filtered client-side against the already-loaded category list — instant
  // as you type/select, no round trip, no reliance on a blur/Enter event firing.
  const visibleVariants = variants.filter((v) => {
    if (query && !v.model_code.toLowerCase().includes(query.toLowerCase())) return false;
    if (filters.brand && v.brand !== filters.brand) return false;
    if (filters.family && v.family !== filters.family) return false;
    if (filters.driveType && v.drive_type !== filters.driveType) return false;
    if (filters.pressureMin !== '' && !(v.working_pressure_bar >= Number(filters.pressureMin))) return false;
    if (filters.pressureMax !== '' && !(v.working_pressure_bar <= Number(filters.pressureMax))) return false;
    if (filters.capacityMin !== '' && !(v.capacity_cfm >= Number(filters.capacityMin))) return false;
    if (filters.capacityMax !== '' && !(v.capacity_cfm <= Number(filters.capacityMax))) return false;
    if (filters.hasPricing === 'yes' && !v.list_price) return false;
    if (filters.hasPricing === 'no' && v.list_price) return false;
    return true;
  });

  const visibleIds = useMemo(() => new Set(visibleVariants.map((v) => v.id)), [visibleVariants]);
  const allVisibleSelected = visibleVariants.length > 0 && visibleVariants.every((v) => selectedIds.has(v.id));
  const selectedInView = visibleVariants.filter((v) => selectedIds.has(v.id)).length;

  const toggleSelectAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) visibleVariants.forEach((v) => next.delete(v.id));
      else visibleVariants.forEach((v) => next.add(v.id));
      return next;
    });
  };
  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ ...emptyVariantForm, category });
    setError('');
    setShowForm(true);
  };

  const openEdit = async (v) => {
    setError('');
    const full = await api.request('GET', `/selection-tool/admin/variants/${v.id}`);
    setEditingId(v.id);
    setForm({
      category: full.category, brand: full.brand || '', family: full.family || '', modelCode: full.model_code,
      driveType: full.drive_type || '', workingPressureBar: full.working_pressure_bar ?? '', workingPressureMinBar: full.working_pressure_min_bar ?? '',
      capacityCfm: full.capacity_cfm ?? '', capacityM3Min: full.capacity_m3min ?? '', listPrice: full.list_price ?? '', specificPower: full.specific_power ?? '',
      specs: full.specs.map((s) => ({ groupLabel: s.group_label, key: s.key, value: s.value, unit: s.unit || '' })),
    });
    setShowForm(true);
  };

  const deleteVariant = async (v) => {
    if (!window.confirm(`Delete "${v.model_code}"? This also removes it from any pricing sets.`)) return;
    try {
      await api.request('DELETE', `/selection-tool/admin/variants/${v.id}`);
      load();
    } catch (err) { alert(err.message); }
  };

  const numOrUndef = (v) => (v === '' || v === null ? undefined : Number(v));

  const saveForm = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      category: form.category, brand: form.brand || undefined, family: form.family || undefined, modelCode: form.modelCode,
      driveType: form.driveType || undefined,
      // Dryer/Filter source sheets carry no pressure column — the form hides
      // this field for those categories (see below) and the matching
      // formulas for their correction-table brands (Coldspell/KRD/Parker/
      // KFT) run off an industry-standard 7 bar reference point regardless
      // of what's stored here, so this is filled in automatically rather
      // than asked of the admin as if it were real per-model data.
      workingPressureBar: form.category === 'compressor' ? numOrUndef(form.workingPressureBar) : 7,
      workingPressureMinBar: form.category === 'compressor' ? numOrUndef(form.workingPressureMinBar) : undefined,
      capacityCfm: numOrUndef(form.capacityCfm), capacityM3Min: numOrUndef(form.capacityM3Min),
      listPrice: numOrUndef(form.listPrice), specificPower: numOrUndef(form.specificPower),
      specs: form.specs.filter((s) => s.key),
    };
    try {
      if (editingId) await api.request('PUT', `/selection-tool/admin/variants/${editingId}`, payload);
      else await api.request('POST', '/selection-tool/admin/variants', payload);
      setShowForm(false);
      load();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const updateSpec = (i, field, value) => {
    setForm((f) => ({ ...f, specs: f.specs.map((s, idx) => (idx === i ? { ...s, [field]: value } : s)) }));
  };
  const addSpecRow = () => setForm((f) => ({ ...f, specs: [...f.specs, { groupLabel: 'General', key: '', value: '', unit: '' }] }));
  const removeSpecRow = (i) => setForm((f) => ({ ...f, specs: f.specs.filter((_, idx) => idx !== i) }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Product catalog</h1>
          <p className="text-sm text-gray-500 mt-0.5">Upload a spec sheet, or add/edit a model by hand — either way it's live for salesmen immediately.</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowUpload(true)} className="btn-secondary text-sm"><Upload className="w-4 h-4" /> Upload file</button>
          <button onClick={openCreate} className="btn-primary text-sm"><Plus className="w-4 h-4" /> Add product manually</button>
        </div>
      </div>

      <div className="flex items-center gap-3 mb-4 flex-wrap">
        {CATEGORIES.map((c) => (
          <button
            key={c.value}
            onClick={() => setCategory(c.value)}
            className={`text-sm px-3 py-1.5 rounded-full font-medium ${category === c.value ? 'bg-accent text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
          >
            {c.label}
          </button>
        ))}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-2.5 top-2.5" />
          <input
            placeholder="Search model code…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-8 pr-3 py-1.5 text-sm border border-gray-300 rounded-lg w-56"
          />
        </div>
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`text-sm px-3 py-1.5 rounded-lg font-medium inline-flex items-center gap-1.5 border ${activeFilterCount > 0 ? 'border-accent text-accent bg-accent/5' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}
        >
          <SlidersHorizontal className="w-4 h-4" /> Filters {activeFilterCount > 0 && <span className="bg-accent text-white text-[11px] rounded-full w-4 h-4 flex items-center justify-center">{activeFilterCount}</span>}
        </button>
        <button onClick={() => setShowExport(true)} className="btn-secondary text-sm ml-auto">
          <FileSpreadsheet className="w-4 h-4" /> Export to Excel
        </button>
      </div>

      {showFilters && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4 grid sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
            <select value={filters.brand} onChange={(e) => setFilters((f) => ({ ...f, brand: e.target.value, family: '' }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              <option value="">All brands</option>
              {brandOptions.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Family</label>
            <select value={filters.family} onChange={(e) => setFilters((f) => ({ ...f, family: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              <option value="">All families</option>
              {familyOptions.map((fam) => <option key={fam} value={fam}>{fam}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Drive type</label>
            <select value={filters.driveType} onChange={(e) => setFilters((f) => ({ ...f, driveType: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              <option value="">Any</option>
              {driveOptions.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          {category === 'compressor' && (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Pressure (bar)</label>
              <div className="flex gap-1.5">
                <input type="number" step="any" placeholder="Min" value={filters.pressureMin} onChange={(e) => setFilters((f) => ({ ...f, pressureMin: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                <input type="number" step="any" placeholder="Max" value={filters.pressureMax} onChange={(e) => setFilters((f) => ({ ...f, pressureMax: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              </div>
            </div>
          )}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Capacity (cfm)</label>
            <div className="flex gap-1.5">
              <input type="number" step="any" placeholder="Min" value={filters.capacityMin} onChange={(e) => setFilters((f) => ({ ...f, capacityMin: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
              <input type="number" step="any" placeholder="Max" value={filters.capacityMax} onChange={(e) => setFilters((f) => ({ ...f, capacityMax: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">List price</label>
            <select value={filters.hasPricing} onChange={(e) => setFilters((f) => ({ ...f, hasPricing: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm">
              <option value="">Any</option>
              <option value="yes">Has a price</option>
              <option value="no">Missing a price</option>
            </select>
          </div>
          <div className="sm:col-span-3 lg:col-span-6 flex justify-between items-center pt-1">
            <span className="text-xs text-gray-400">{visibleVariants.length} of {variants.length} models match.</span>
            {activeFilterCount > 0 && <button onClick={() => setFilters(emptyFilters)} className="text-xs text-accent font-medium">Clear all filters</button>}
          </div>
        </div>
      )}

      {selectedInView > 0 && (
        <div className="flex items-center justify-between bg-accent/5 border border-accent/20 rounded-lg px-4 py-2 mb-4 text-sm">
          <span className="text-accent font-medium">{selectedInView} model{selectedInView === 1 ? '' : 's'} selected</span>
          <button onClick={() => setSelectedIds(new Set())} className="text-gray-500 hover:text-gray-700">Clear selection</button>
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
            <tr>
              <th className="px-4 py-3 w-8"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} className="w-4 h-4 rounded border-gray-300 text-accent" /></th>
              <th className="text-left px-4 py-3 font-medium">Model</th>
              <th className="text-left px-4 py-3 font-medium">Brand / Family</th>
              {/* Dryer/Filter source files (Dryer ver 2.xlsx, Filters ver 2.xlsx)
                  carry no pressure column at all — a "7 bar" here would be the
                  internal correction-formula reference value, not something
                  the source data actually said, so this column only shows for
                  compressor, where every source genuinely rates a pressure. */}
              {category === 'compressor' && <th className="text-left px-4 py-3 font-medium">Pressure</th>}
              <th className="text-left px-4 py-3 font-medium">Capacity</th>
              <th className="text-left px-4 py-3 font-medium">List price</th>
              <th className="text-right px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={category === 'compressor' ? 7 : 6} className="px-4 py-8 text-center text-gray-400">Loading…</td></tr>
            ) : visibleVariants.length === 0 ? (
              <tr><td colSpan={category === 'compressor' ? 7 : 6} className="px-4 py-8 text-center text-gray-400">{query || activeFilterCount > 0 ? 'No models match your search/filters.' : 'No models in this category yet.'}</td></tr>
            ) : visibleVariants.map((v) => (
              <tr key={v.id} className={selectedIds.has(v.id) ? 'bg-accent/5' : ''}>
                <td className="px-4 py-3"><input type="checkbox" checked={selectedIds.has(v.id)} onChange={() => toggleSelectOne(v.id)} className="w-4 h-4 rounded border-gray-300 text-accent" /></td>
                <td className="px-4 py-3 font-medium text-gray-900">{v.model_code}{v.drive_type && <span className="ml-2 text-xs text-gray-400">{v.drive_type}</span>}</td>
                <td className="px-4 py-3 text-gray-600">{v.brand} · {v.family}</td>
                {category === 'compressor' && <td className="px-4 py-3 text-gray-600">{v.working_pressure_bar ?? '—'} bar</td>}
                <td className="px-4 py-3 text-gray-600">{v.capacity_cfm ?? '—'} cfm</td>
                <td className="px-4 py-3 text-gray-600">{v.list_price ? `₹${Number(v.list_price).toLocaleString('en-IN')}` : '—'}</td>
                <td className="px-4 py-3 text-right">
                  <div className="inline-flex gap-1">
                    <button onClick={() => openEdit(v)} className="p-1.5 text-accent hover:bg-accent/10 rounded-lg"><Pencil className="w-4 h-4" /></button>
                    <button onClick={() => deleteVariant(v)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showForm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl w-full max-w-2xl p-6 my-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">{editingId ? `Edit ${form.modelCode}` : 'Add product manually'}</h2>
              <button onClick={() => setShowForm(false)}><X className="w-5 h-5 text-gray-400" /></button>
            </div>
            <form onSubmit={saveForm} className="space-y-4">
              {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
                  <select value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
                  <input value={form.brand} onChange={(e) => setForm((f) => ({ ...f, brand: e.target.value }))} placeholder="e.g. Kaishan" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Family / product line</label>
                  <input value={form.family} onChange={(e) => setForm((f) => ({ ...f, family: e.target.value }))} placeholder="e.g. KRSP" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Model code (unique)</label>
                <input required value={form.modelCode} onChange={(e) => setForm((f) => ({ ...f, modelCode: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
              </div>

              {/* Dryer/Filter source sheets (Dryer ver 2.xlsx, Filters ver
                  2.xlsx) never carried a pressure column — asking for one
                  here would invite a made-up per-model value where none
                  exists; those categories' correction formulas run off a
                  fixed reference point instead (see saveForm above). */}
              <div className={`grid gap-3 ${form.category === 'compressor' ? 'sm:grid-cols-3' : 'sm:grid-cols-1'}`}>
                {form.category === 'compressor' && (
                  <>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Working pressure (bar)</label>
                      <input type="number" step="any" value={form.workingPressureBar} onChange={(e) => setForm((f) => ({ ...f, workingPressureBar: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 mb-1">Min pressure (bar, optional)</label>
                      <input type="number" step="any" value={form.workingPressureMinBar} onChange={(e) => setForm((f) => ({ ...f, workingPressureMinBar: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                    </div>
                  </>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Capacity (cfm)</label>
                  <input type="number" step="any" value={form.capacityCfm} onChange={(e) => setForm((f) => ({ ...f, capacityCfm: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
              </div>

              <div className="grid sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Drive type</label>
                  <input value={form.driveType} onChange={(e) => setForm((f) => ({ ...f, driveType: e.target.value }))} placeholder="fixed / vsd" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">List price (₹, optional)</label>
                  <input type="number" step="any" value={form.listPrice} onChange={(e) => setForm((f) => ({ ...f, listPrice: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Specific power (optional)</label>
                  <input type="number" step="any" value={form.specificPower} onChange={(e) => setForm((f) => ({ ...f, specificPower: e.target.value }))} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-medium text-gray-500">Other specs (shown in the salesman PDF report)</label>
                  <button type="button" onClick={addSpecRow} className="text-xs text-accent font-medium">+ Add spec row</button>
                </div>
                <div className="space-y-2 max-h-56 overflow-y-auto">
                  {form.specs.map((s, i) => (
                    <div key={i} className="grid grid-cols-[1fr_1fr_60px_24px] gap-2">
                      <input placeholder="Key (e.g. Motor rated kW)" value={s.key} onChange={(e) => updateSpec(i, 'key', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      <input placeholder="Value" value={s.value} onChange={(e) => updateSpec(i, 'value', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      <input placeholder="Unit" value={s.unit} onChange={(e) => updateSpec(i, 'unit', e.target.value)} className="border border-gray-300 rounded-lg px-2 py-1.5 text-sm" />
                      <button type="button" onClick={() => removeSpecRow(i)} className="text-gray-400 hover:text-red-500"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {form.specs.length === 0 && <p className="text-xs text-gray-400">No extra specs added.</p>}
                </div>
              </div>

              <button disabled={saving} className="btn-primary w-full justify-center text-sm disabled:opacity-60">{saving ? 'Saving…' : editingId ? 'Save changes' : 'Add product'}</button>
            </form>
          </div>
        </div>
      )}

      {showUpload && <UploadModal onClose={() => setShowUpload(false)} onSaved={load} />}
      {showExport && (
        <ExportModal
          category={category}
          categoryLabel={CATEGORIES.find((c) => c.value === category)?.label || category}
          allCount={variants.length}
          filteredCount={visibleVariants.length}
          selectedCount={selectedIds.size}
          hasActiveFilters={activeFilterCount > 0 || !!query}
          getAll={() => variants}
          getFiltered={() => visibleVariants}
          getSelected={() => variants.filter((v) => selectedIds.has(v.id))}
          onClose={() => setShowExport(false)}
        />
      )}
    </div>
  );
}

function UploadModal({ onClose, onSaved }) {
  const [file, setFile] = useState(null);
  const [category, setCategory] = useState('compressor');
  const [brand, setBrand] = useState('');
  const [password, setPassword] = useState('');
  const [previewing, setPreviewing] = useState(false);
  const [preview, setPreview] = useState(null); // { fileName, shapeUsed, count, variants, warning }
  const [included, setIncluded] = useState({}); // variantIndex -> bool
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(null);

  const runPreview = async (e) => {
    e.preventDefault();
    if (!file) return;
    setError('');
    setPreviewing(true);
    setPreview(null);
    try {
      const fd = new FormData();
      fd.append('file', file);
      if (password) fd.append('password', password);
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${(import.meta.env.VITE_API_URL || '') + '/api'}/selection-tool/admin/ingest/preview`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed.');
      setPreview(data);
      setIncluded(Object.fromEntries(data.variants.map((_, i) => [i, true])));
    } catch (err) { setError(err.message); }
    finally { setPreviewing(false); }
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const variants = preview.variants.filter((_, i) => included[i]);
      const result = await api.request('POST', '/selection-tool/admin/ingest/save', {
        category, brand: brand || undefined, fileName: preview.fileName, variants,
      });
      setSaved(result.saved);
      onSaved();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-xl w-full max-w-3xl p-6 my-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Upload spec sheet (Excel or PDF)</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>

        {saved !== null ? (
          <div className="text-center py-8">
            <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
            <p className="font-medium text-gray-900">{saved} model{saved === 1 ? '' : 's'} saved to the catalog.</p>
            <button onClick={onClose} className="btn-primary text-sm mt-4">Done</button>
          </div>
        ) : !preview ? (
          <form onSubmit={runPreview} className="space-y-4">
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Category (choose — not auto-detected)</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm">
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Brand</label>
                <input value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="e.g. Kaishan" className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">File (.xlsx, .xls, or .pdf)</label>
              <input required type="file" accept=".xlsx,.xls,.pdf" onChange={(e) => setFile(e.target.files[0])} className="w-full text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">PDF password (only if the file is protected)</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border border-gray-300 rounded-lg px-2 py-2 text-sm" />
            </div>
            <button disabled={previewing} className="btn-primary w-full justify-center text-sm disabled:opacity-60">
              {previewing && <Loader2 className="w-4 h-4 animate-spin" />} {previewing ? 'Reading file…' : 'Preview extracted data'}
            </button>
          </form>
        ) : (
          <div>
            <p className="text-sm text-gray-500 mb-3">Detected layout: <span className="font-medium text-gray-700">{preview.shapeUsed}</span></p>
            {preview.warning ? (
              <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 rounded-lg px-3 py-2 mb-4">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{preview.warning}</span>
              </div>
            ) : (
              <p className="text-sm text-gray-700 mb-3">Found <strong>{preview.count}</strong> model(s). Uncheck any that look wrong before saving — nothing has been saved yet.</p>
            )}
            {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</div>}

            {preview.variants.length > 0 && (
              <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-lg mb-4">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-xs uppercase text-gray-400 sticky top-0">
                    <tr>
                      <th className="text-left px-3 py-2 w-8"></th>
                      <th className="text-left px-3 py-2">Model</th>
                      {category === 'compressor' && <th className="text-left px-3 py-2">Pressure</th>}
                      <th className="text-left px-3 py-2">Capacity</th>
                      <th className="text-left px-3 py-2">Specs</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {preview.variants.map((v, i) => (
                      <tr key={i} className={included[i] ? '' : 'opacity-40'}>
                        <td className="px-3 py-2"><input type="checkbox" checked={!!included[i]} onChange={(e) => setIncluded((m) => ({ ...m, [i]: e.target.checked }))} /></td>
                        <td className="px-3 py-2 font-medium">{v.modelCode}</td>
                        {category === 'compressor' && <td className="px-3 py-2">{v.filter?.workingPressureBar ?? '—'} bar</td>}
                        <td className="px-3 py-2">{v.filter?.capacityCfm ?? v.filter?.capacityM3Min ?? '—'}</td>
                        <td className="px-3 py-2 text-gray-400">{v.specs?.length ?? 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex gap-2">
              <button onClick={() => setPreview(null)} className="btn-secondary text-sm flex-1 justify-center">Back</button>
              <button
                onClick={save}
                disabled={saving || preview.variants.filter((_, i) => included[i]).length === 0}
                className="btn-primary text-sm flex-1 justify-center disabled:opacity-60"
              >
                {saving ? 'Saving…' : `Save ${preview.variants.filter((_, i) => included[i]).length} model(s)`}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const EXPORT_SCOPES = [
  { value: 'filtered', label: 'Currently filtered/searched list', needsCheck: (ctx) => ctx.hasActiveFilters },
  { value: 'selected', label: 'Only checked rows', needsCheck: (ctx) => ctx.selectedCount > 0 },
  { value: 'all', label: 'Every model in this category', needsCheck: () => true },
];

function ExportModal({ category, categoryLabel, allCount, filteredCount, selectedCount, hasActiveFilters, getAll, getFiltered, getSelected, onClose }) {
  const defaultScope = selectedCount > 0 ? 'selected' : hasActiveFilters ? 'filtered' : 'all';
  const [scope, setScope] = useState(defaultScope);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');

  const scopeCount = { all: allCount, filtered: filteredCount, selected: selectedCount };

  const runExport = async () => {
    const rows = scope === 'all' ? getAll() : scope === 'filtered' ? getFiltered() : getSelected();
    if (rows.length === 0) return;
    setExporting(true);
    setError('');
    try {
      const ids = rows.map((v) => v.id);
      // One batched request for every row's full spec list, instead of one
      // request per model — the admin explicitly wanted the expanded-view
      // detail (Motor kW, Dimensions, etc.), not just the summary columns.
      const specsByVariant = await api.request('GET', `/selection-tool/admin/variants/specs?ids=${ids.join(',')}`);

      const baseCols = ['Model Code', 'Brand', 'Family', 'Drive Type'];
      if (category === 'compressor') baseCols.push('Working Pressure (bar)');
      baseCols.push('Capacity (cfm)', 'List Price (INR)');

      const specKeySet = new Set();
      rows.forEach((v) => (specsByVariant[v.id] || []).forEach((s) => specKeySet.add(s.key)));
      const specKeys = [...specKeySet].sort();

      const header = [...baseCols, ...specKeys];
      const sheetRows = rows.map((v) => {
        const row = [v.model_code, v.brand || '', v.family || '', v.drive_type || ''];
        if (category === 'compressor') row.push(v.working_pressure_bar ?? '');
        row.push(v.capacity_cfm ?? '', v.list_price ?? '');
        const specMap = Object.fromEntries((specsByVariant[v.id] || []).map((s) => [s.key, s.unit ? `${s.value} ${s.unit}` : s.value]));
        specKeys.forEach((k) => row.push(specMap[k] ?? ''));
        return row;
      });

      const ws = XLSX.utils.aoa_to_sheet([header, ...sheetRows]);
      ws['!cols'] = header.map((h) => ({ wch: Math.min(Math.max(h.length, 12), 40) }));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, categoryLabel.slice(0, 31));
      const dateStr = new Date().toISOString().slice(0, 10);
      XLSX.writeFile(wb, `Navkar-${categoryLabel.replace(/\s+/g, '-')}-Catalog-${dateStr}.xlsx`);
      onClose();
    } catch (err) {
      setError(err.message || 'Export failed.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-gray-900">Export {categoryLabel} catalog to Excel</h2>
          <button onClick={onClose}><X className="w-5 h-5 text-gray-400" /></button>
        </div>
        {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-3">{error}</div>}
        <div className="space-y-2 mb-5">
          {EXPORT_SCOPES.map((s) => {
            const disabled = !s.needsCheck({ hasActiveFilters, selectedCount });
            return (
              <label key={s.value} className={`flex items-center justify-between gap-3 border rounded-lg px-3 py-2.5 cursor-pointer ${disabled ? 'opacity-40 cursor-not-allowed' : scope === s.value ? 'border-accent bg-accent/5' : 'border-gray-200 hover:bg-gray-50'}`}>
                <span className="flex items-center gap-2 text-sm">
                  <input type="radio" name="export-scope" disabled={disabled} checked={scope === s.value} onChange={() => setScope(s.value)} className="text-accent" />
                  {s.label}
                </span>
                <span className="text-xs text-gray-400">{scopeCount[s.value]} model{scopeCount[s.value] === 1 ? '' : 's'}</span>
              </label>
            );
          })}
        </div>
        <p className="text-xs text-gray-400 mb-4">Includes every spec field (Motor kW, dimensions, etc.) shown in each model's expanded view, alongside the summary columns.</p>
        <button
          onClick={runExport}
          disabled={exporting || scopeCount[scope] === 0}
          className="btn-primary w-full justify-center text-sm disabled:opacity-60"
        >
          {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
          {exporting ? 'Exporting…' : `Export ${scopeCount[scope]} model(s)`}
        </button>
      </div>
    </div>
  );
}
