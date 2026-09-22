import { useEffect, useState } from 'react';
import { Sliders, Save, CheckCircle2, RotateCcw } from 'lucide-react';
import api from './AdminAPI';

const VALIDATION_FIELD_META = [
  { category: 'compressor', field: 'pressureBar', label: 'Air Compressor — Working Pressure (bar)' },
  { category: 'compressor', field: 'capacityCfm', label: 'Air Compressor — Capacity (cfm)' },
  { category: 'dryer', field: 'capacityCfm', label: 'Air Dryer — Max Inlet Flow (cfm)' },
  { category: 'filter', field: 'capacityCfm', label: 'Air Filter — Max Inlet Flow (cfm)' },
];

export default function AdminSelectionSettings() {
  const [toleranceBar, setToleranceBar] = useState('3');
  const [capacityPct, setCapacityPct] = useState('5');
  const [filterCapacityPct, setFilterCapacityPct] = useState('10');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [limits, setLimits] = useState(null); // { compressor: { pressureBar: {...}, capacityCfm: {...} }, dryer: {...}, filter: {...} }
  const [limitForms, setLimitForms] = useState({}); // key `${category}.${field}` -> { min, max }
  const [savingLimit, setSavingLimit] = useState(null); // key currently saving

  const load = async () => {
    setLoading(true);
    try {
      const [s, l] = await Promise.all([
        api.request('GET', '/selection-tool/settings'),
        api.request('GET', '/selection-tool/validation-limits'),
      ]);
      setToleranceBar(String(s.pressureToleranceBar ?? 3));
      setCapacityPct(String(s.capacityTolerancePct ?? 5));
      setFilterCapacityPct(String(s.filterCapacityTolerancePct ?? 10));
      setLimits(l);
      const forms = {};
      VALIDATION_FIELD_META.forEach(({ category, field }) => {
        const v = l[category]?.[field];
        forms[`${category}.${field}`] = { min: v?.min ?? '', max: v?.max ?? '' };
      });
      setLimitForms(forms);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setError('');
    setSaved(false);
    const bar = Number(toleranceBar);
    const pct = Number(capacityPct);
    const filterPct = Number(filterCapacityPct);
    if (!Number.isFinite(bar) || bar < 0) { setError('Enter a valid, non-negative number of bar.'); return; }
    if (!Number.isFinite(pct) || pct < 0 || pct > 100) { setError('Enter a valid capacity tolerance between 0 and 100%.'); return; }
    if (!Number.isFinite(filterPct) || filterPct < 0 || filterPct > 100) { setError('Enter a valid filter capacity tolerance between 0 and 100%.'); return; }
    setSaving(true);
    try {
      await api.request('PATCH', '/selection-tool/admin/settings', { pressureToleranceBar: bar, capacityTolerancePct: pct, filterCapacityTolerancePct: filterPct });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  const saveLimit = async (category, field) => {
    const key = `${category}.${field}`;
    const form = limitForms[key];
    const min = form.min === '' ? null : Number(form.min);
    const max = form.max === '' ? null : Number(form.max);
    if (min != null && !Number.isFinite(min)) { setError('Min must be a number.'); return; }
    if (max != null && !Number.isFinite(max)) { setError('Max must be a number.'); return; }
    if (min != null && max != null && min > max) { setError('Min cannot be greater than max.'); return; }
    setError('');
    setSavingLimit(key);
    try {
      const updated = await api.request('PATCH', '/selection-tool/admin/validation-limits', { category, field, min, max });
      setLimits((l) => ({ ...l, [category]: { ...l[category], [field]: updated } }));
      setLimitForms((f) => ({ ...f, [key]: { min: updated.min ?? '', max: updated.max ?? '' } }));
    } catch (err) { setError(err.message); }
    finally { setSavingLimit(null); }
  };

  const resetToData = async (category, field) => {
    const key = `${category}.${field}`;
    setError('');
    setSavingLimit(key);
    try {
      const updated = await api.request('PATCH', '/selection-tool/admin/validation-limits', { category, field, min: null, max: null });
      setLimits((l) => ({ ...l, [category]: { ...l[category], [field]: updated } }));
      setLimitForms((f) => ({ ...f, [key]: { min: updated.min ?? '', max: updated.max ?? '' } }));
    } catch (err) { setError(err.message); }
    finally { setSavingLimit(null); }
  };

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-2 mb-1">
        <Sliders className="w-5 h-5 text-accent" />
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Selection: Settings</h1>
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Matching-engine settings shared by every salesman's offline device — synced down on their next login/sync.
      </p>

      <div className="bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl p-6 space-y-6 mb-6">
        {loading ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <form onSubmit={save} className="space-y-6">
            <div>
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Pressure search tolerance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                A model only matches if its own rated pressure is within this many bar of what the client asked for.
                For example, with a tolerance of 3 bar, a request for 7 bar matches models rated 4–10 bar and nothing
                outside that range — a model rated 13 bar will never show up for a 7 bar request.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tolerance (bar)</label>
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={toleranceBar}
                  onChange={(e) => setToleranceBar(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Capacity search tolerance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                A model only matches if its rated capacity is within this percentage of what the client asked for, on
                either side. For example, with a tolerance of 5%, a request for 210 cfm matches models rated
                199.5–220.5 cfm — a model rated 1500 cfm will never show up for a 210 cfm request.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tolerance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={capacityPct}
                  onChange={(e) => setCapacityPct(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="border-t border-gray-100 dark:border-gray-800 pt-6">
              <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Filter capacity search tolerance</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                Same idea as capacity tolerance above, but for Air Filter only — its own setting since filters run a
                pressure-correction formula first (Parker CFMIP / Kaishan KFT), and the tolerance band is applied
                around that corrected figure, not the client's raw input. For example, a client asking for 500 cfm at
                5 bar corrects to 590 cfm (500 × 1.18 CFMIP) — with a 10% tolerance, that matches filters rated
                531–649 cfm.
              </p>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Tolerance (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  value={filterCapacityPct}
                  onChange={(e) => setFilterCapacityPct(e.target.value)}
                  className="w-32 px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="btn-primary text-sm disabled:opacity-50 flex items-center gap-1.5">
                <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save'}
              </button>
              {saved && (
                <span className="inline-flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                  <CheckCircle2 className="w-4 h-4" /> Saved
                </span>
              )}
            </div>
          </form>
        )}
      </div>

      <div className="bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Questionnaire input limits</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          The min/max a salesman is allowed to type into each field, so no one can accidentally enter an impossible
          value. Pre-filled from the catalog's own current min/max — edit either box to pin a stricter (or looser)
          limit instead, or hit reset to go back to tracking the catalog automatically.
        </p>

        {loading || !limits ? (
          <p className="text-sm text-gray-400">Loading…</p>
        ) : (
          <div className="space-y-5">
            {VALIDATION_FIELD_META.map(({ category, field, label }) => {
              const key = `${category}.${field}`;
              const form = limitForms[key] || { min: '', max: '' };
              const current = limits[category]?.[field];
              return (
                <div key={key} className="border-b border-gray-100 dark:border-gray-800 last:border-0 pb-5 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{label}</p>
                    {current?.isOverridden ? (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                        Admin override
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                        Following catalog
                      </span>
                    )}
                  </div>
                  <div className="flex items-end gap-3 flex-wrap">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Min</label>
                      <input
                        type="number"
                        step="any"
                        value={form.min}
                        onChange={(e) => setLimitForms((f) => ({ ...f, [key]: { ...f[key], min: e.target.value } }))}
                        className="w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Max</label>
                      <input
                        type="number"
                        step="any"
                        value={form.max}
                        onChange={(e) => setLimitForms((f) => ({ ...f, [key]: { ...f[key], max: e.target.value } }))}
                        className="w-28 px-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg bg-white dark:bg-surface-dark text-gray-900 dark:text-white text-sm"
                      />
                    </div>
                    <button
                      onClick={() => saveLimit(category, field)}
                      disabled={savingLimit === key}
                      className="btn-primary text-xs px-3 py-1.5 disabled:opacity-50"
                    >
                      {savingLimit === key ? 'Saving…' : 'Save'}
                    </button>
                    <button
                      onClick={() => resetToData(category, field)}
                      disabled={savingLimit === key || !current?.isOverridden}
                      className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-accent disabled:opacity-40 disabled:hover:text-gray-500 px-2 py-1.5"
                      title="Reset to catalog min/max"
                    >
                      <RotateCcw className="w-3.5 h-3.5" /> Reset
                    </button>
                    {current && (
                      <span className="text-xs text-gray-400">
                        Catalog range: {current.dataMin ?? '—'}–{current.dataMax ?? '—'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        {error && <p className="text-sm text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  );
}
