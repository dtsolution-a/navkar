import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Wind, Snowflake, Filter as FilterIcon, RefreshCw, Loader2 } from 'lucide-react';
import useSelectionStore from '../../selectionTool/store';
import { syncAll } from '../../selectionTool/sync';
import { db } from '../../selectionTool/db';

const CATEGORIES = [
  { slug: 'compressor', label: 'Air Compressor', icon: Wind },
  { slug: 'dryer', label: 'Air Dryer', icon: Snowflake },
  { slug: 'filter', label: 'Air Filter', icon: FilterIcon },
];

export default function SelectionHome() {
  const navigate = useNavigate();
  const { user, pricingEnabled, hasPricingSet, setPricingEnabled, setHasPricingSet } = useSelectionStore();
  const [syncing, setSyncing] = useState(false);
  const [syncInfo, setSyncInfo] = useState(null);
  const [variantCounts, setVariantCounts] = useState({});

  const refreshCounts = async () => {
    const counts = {};
    for (const c of CATEGORIES) counts[c.slug] = await db.variants.where('category').equals(c.slug).count();
    setVariantCounts(counts);
  };

  const runSync = async () => {
    setSyncing(true);
    const res = await syncAll();
    setSyncInfo(res);
    setHasPricingSet(!!res.hasPricingSet);
    await refreshCounts();
    setSyncing(false);
  };

  useEffect(() => {
    refreshCounts().then((counts) => {
      // Auto-sync on first load only if the offline store is empty.
      db.variants.count().then((n) => { if (n === 0) runSync(); });
    });
  }, []);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Start a diagnosis</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Pick a category to run the client's requirement questionnaire.</p>
        </div>
        <button
          onClick={runSync}
          disabled={syncing}
          className="btn-secondary text-sm disabled:opacity-60"
        >
          {syncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
          {syncing ? 'Syncing catalog…' : 'Refresh catalog'}
        </button>
      </div>

      {hasPricingSet && (
        <div className="mb-8 flex items-center justify-between bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl px-5 py-4">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Show pricing to client</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">When off, all prices are hidden from the UI and the exported PDF.</p>
          </div>
          <button
            role="switch"
            aria-checked={pricingEnabled}
            onClick={() => setPricingEnabled(!pricingEnabled)}
            className={`relative w-12 h-7 rounded-full transition-colors ${pricingEnabled ? 'bg-accent' : 'bg-gray-300 dark:bg-gray-700'}`}
          >
            <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white shadow transition-transform ${pricingEnabled ? 'translate-x-5' : ''}`} />
          </button>
        </div>
      )}

      <div className="grid sm:grid-cols-3 gap-4">
        {CATEGORIES.map(({ slug, label, icon: Icon }) => {
          const count = variantCounts[slug] ?? 0;
          const usable = count > 0;
          return (
            <button
              key={slug}
              disabled={!usable}
              onClick={() => navigate(`/selection-tool/${slug}`)}
              className={`text-left rounded-2xl border p-6 transition-all ${
                usable
                  ? 'border-gray-200 dark:border-gray-800 bg-white dark:bg-surface-dark-card hover:border-accent hover:shadow-md'
                  : 'border-gray-100 dark:border-gray-800/50 bg-gray-50 dark:bg-surface-dark-card/40 opacity-60 cursor-not-allowed'
              }`}
            >
              <Icon className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-semibold text-gray-900 dark:text-white">{label}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {usable ? `${count} models in offline catalog` : 'Catalog not ingested yet'}
              </p>
            </button>
          );
        })}
      </div>

      {syncInfo && !syncInfo.ok && (
        <p className="mt-6 text-sm text-amber-600 dark:text-amber-400">
          Sync couldn't reach the server ({syncInfo.error}) — using whatever is already cached on this device.
        </p>
      )}
    </div>
  );
}
