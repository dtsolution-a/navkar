import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Download, ChevronDown, ChevronUp, Loader2, CheckSquare, Square, AlertTriangle, LayoutGrid, FileText, Table2 } from 'lucide-react';
import { getActiveSession, getPricingSet, priceForVariant, matchComprehensive, db, referenceSeriesForResults } from '../../selectionTool/db';
import { generateReport } from '../../selectionTool/pdf';
import useSelectionStore from '../../selectionTool/store';

const CATEGORY_LABELS = { compressor: 'Air Compressor', dryer: 'Air Dryer', filter: 'Air Filter' };
// PDF link annotations need a fully-qualified URL — a relative one (the
// common case when VITE_API_URL is unset because the API is same-origin)
// silently fails to open once the report is printed/exported, since a
// printed PDF has no "page origin" to resolve a relative link against.
const API_ORIGIN = (import.meta.env.VITE_API_URL || window.location.origin);

export default function SelectionResults() {
  const { category } = useParams();
  const navigate = useNavigate();
  const { user, pricingEnabled, hasPricingSet } = useSelectionStore();
  const [session, setSession] = useState(null);
  const [pricingSet, setPricingSet] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [selected, setSelected] = useState({}); // variantId -> bool, which models go into the PDF
  const [exporting, setExporting] = useState(false);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [includeReferenceExtras, setIncludeReferenceExtras] = useState(false);
  const [comprehensiveOn, setComprehensiveOn] = useState(false);
  const [comprehensive, setComprehensive] = useState(null); // { criteria, bands } from matchComprehensive
  const [comprehensiveLoading, setComprehensiveLoading] = useState(false);
  const [compExpanded, setCompExpanded] = useState(null); // variantId of the comprehensive-view model currently showing its spec detail
  const [compSelected, setCompSelected] = useState({}); // variantId -> bool, comprehensive-view models opted into the PDF (unchecked by default — they're outside the actual matching results)
  const [matchedReferenceSeries, setMatchedReferenceSeries] = useState([]);
  const [openReferenceIds, setOpenReferenceIds] = useState({}); // series id -> bool, table stays collapsed until opened

  const showPricing = hasPricingSet && pricingEnabled;

  useEffect(() => {
    getActiveSession().then(async (s) => {
      if (!s || s.category !== category) { navigate(`/selection-tool/${category}`); return; }
      setSession(s);
      setSelected(Object.fromEntries(s.results.map((v) => [v.id, true]))); // all included by default
      const allSeries = await db.referenceSeries.where('category').equals(category).toArray();
      setMatchedReferenceSeries(referenceSeriesForResults(allSeries, s.results));
    });
  }, [category]);

  useEffect(() => {
    getPricingSet().then(setPricingSet);
  }, []);

  const toggleComprehensive = async () => {
    const next = !comprehensiveOn;
    setComprehensiveOn(next);
    if (next && !comprehensive && session) {
      setComprehensiveLoading(true);
      try {
        const data = await matchComprehensive(category, session.answers);
        setComprehensive(data);
      } finally {
        setComprehensiveLoading(false);
      }
    }
  };

  if (!session) return <div className="max-w-3xl mx-auto px-4 py-16 text-center text-gray-500">Loading…</div>;

  const approxCount = session.results.filter((v) => v.approxMatch).length;
  const hasApprox = approxCount > 0;
  const allApprox = hasApprox && approxCount === session.results.length;
  const resultIds = new Set(session.results.map((v) => v.id));
  // Comprehensive-view bands repeat the same model across bars (and can
  // repeat a model already in the main results) — dedupe to one card per
  // variant id, keeping only the ones NOT already in the main results list
  // so a model never appears twice across the two sections.
  const compModels = comprehensive
    ? Object.values(
        Object.fromEntries(
          comprehensive.bands
            .flatMap((band) => [band.lowest, band.highest])
            .filter((v) => v && !resultIds.has(v.id))
            .map((v) => [v.id, v])
        )
      )
    : [];
  const selectedCount = Object.values(selected).filter(Boolean).length;
  const compSelectedCount = compModels.filter((v) => compSelected[v.id]).length;
  const totalSelectedCount = selectedCount + compSelectedCount;
  const allSelected = selectedCount === session.results.length && session.results.length > 0;
  const toggleAll = () => setSelected(Object.fromEntries(session.results.map((v) => [v.id, !allSelected])));
  const toggleOne = (id) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const toggleCompOne = (id) => setCompSelected((s) => ({ ...s, [id]: !s[id] }));

  const exportPdf = async (withReferenceExtras) => {
    setShowExportOptions(false);
    setExporting(true);
    try {
      const chosen = [
        ...session.results.filter((v) => selected[v.id]),
        ...compModels.filter((v) => compSelected[v.id]),
      ];
      const applicableSeries = withReferenceExtras
        ? referenceSeriesForResults(matchedReferenceSeries, chosen)
        : [];
      const doc = await generateReport({
        category,
        answers: session.answers,
        results: chosen,
        showPricing,
        pricingSet,
        salesmanName: user?.username,
        referenceSeries: applicableSeries,
        apiOrigin: API_ORIGIN,
      });
      doc.save(`${CATEGORY_LABELS[category].replace(/\s/g, '-')}-selection-report.pdf`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <Link to={`/selection-tool/${category}`} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Edit requirement
      </Link>

      <div className="flex items-start justify-between gap-4 flex-wrap mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{session.results.length} matching model(s)</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            {CATEGORY_LABELS[category]} · sorted by {session.sort === 'efficiency' ? 'lowest specific power' : 'lowest list price'}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={toggleComprehensive}
            className={`text-sm px-3 py-2 rounded-lg border inline-flex items-center gap-1.5 ${comprehensiveOn ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
          >
            <LayoutGrid className="w-4 h-4" /> Comprehensive view
          </button>
          <button
            onClick={() => (matchedReferenceSeries.length > 0 ? setShowExportOptions(true) : exportPdf(false))}
            disabled={exporting || totalSelectedCount === 0}
            className="btn-primary text-sm disabled:opacity-50"
          >
            {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {exporting ? 'Building PDF…' : `Export PDF (${totalSelectedCount})`}
          </button>
        </div>
      </div>

      {comprehensiveOn && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Comprehensive view</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
            For every bar from {Math.round(session.answers.workingPressureBar ?? session.answers.minWorkingPressureBar)} up to
            {' '}+{comprehensive?.criteria.toleranceBar ?? '…'} bar, the smallest and largest model available at that exact bar —
            the capacity tolerance band doesn't apply here.
          </p>
          {comprehensiveLoading || !comprehensive ? (
            <div className="text-center py-8 text-gray-400 bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl">Loading…</div>
          ) : (
            <>
              <div className="bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden overflow-x-auto mb-4">
                <table className="w-full text-sm min-w-[500px]">
                  <thead>
                    <tr className="bg-accent text-white">
                      <th className="text-left px-4 py-3 font-medium">Bar</th>
                      <th className="text-left px-4 py-3 font-medium">Lowest capacity</th>
                      <th className="text-left px-4 py-3 font-medium">Highest capacity</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {comprehensive.bands.map((band) => (
                      <tr key={band.bar}>
                        <td className="px-4 py-3 font-semibold text-gray-900 dark:text-white">{band.bar} bar</td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {band.lowest ? (
                            <button onClick={() => setCompExpanded(band.lowest.id)} className="hover:text-accent hover:underline">
                              {band.lowest.modelCode} <span className="text-gray-400">— {band.lowest.capacityCfm} cfm</span>
                            </button>
                          ) : <span className="text-gray-400">No model at this bar</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                          {band.highest ? (
                            <button onClick={() => setCompExpanded(band.highest.id)} className="hover:text-accent hover:underline">
                              {band.highest.modelCode} <span className="text-gray-400">— {band.highest.capacityCfm} cfm</span>
                            </button>
                          ) : <span className="text-gray-400">No model at this bar</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {compModels.length > 0 && (
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                    Tap a model above (or below) to see its full spec sheet, or tick it to include it in the exported PDF alongside the main results.
                  </p>
                  <div className="space-y-2">
                    {compModels.map((v) => {
                      const isOpen = compExpanded === v.id;
                      const isChecked = !!compSelected[v.id];
                      const price = priceForVariant(v, pricingSet);
                      return (
                        <div key={v.id} className={`bg-white dark:bg-surface-dark-card border rounded-xl overflow-hidden transition-colors ${isChecked ? 'border-accent/40' : 'border-gray-100 dark:border-gray-800/60'}`}>
                          <div className="w-full flex items-center gap-3 px-5 py-3">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleCompOne(v.id)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/50 flex-shrink-0"
                              aria-label={`Include ${v.modelCode} in PDF`}
                            />
                            <button onClick={() => setCompExpanded(isOpen ? null : v.id)} className="flex-1 flex items-center justify-between text-left">
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-white">{v.modelCode}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  {v.workingPressureBar} bar · {v.capacityCfm} cfm{v.driveType ? ` · ${v.driveType}` : ''}
                                  {showPricing && price != null && ` · ₹${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                                </p>
                              </div>
                              {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                            </button>
                          </div>
                          {isOpen && (
                            <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                              {showPricing && price != null && (
                                <div className="flex gap-3 mb-4 flex-wrap">
                                  <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                                    ₹{Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                                  </span>
                                </div>
                              )}
                              <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                                {(v.specs || []).filter((s) => !/list price/i.test(s.key)).map((s, i) => (
                                  <div key={i} className="flex justify-between gap-2 border-b border-dashed border-gray-100 dark:border-gray-800 py-1">
                                    <dt className="text-gray-500 dark:text-gray-400">{s.key}</dt>
                                    <dd className="text-gray-900 dark:text-white font-medium text-right">{s.value}{s.unit ? ` ${s.unit}` : ''}</dd>
                                  </div>
                                ))}
                              </dl>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {session.results.length === 0 ? (
        <div className="text-center py-16 text-gray-500 dark:text-gray-400 bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-2xl">
          No models in the offline catalog satisfy this requirement. Try a wider pressure/capacity range.
        </div>
      ) : hasApprox ? (
        <div className="flex items-start gap-2.5 text-sm text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 rounded-xl px-4 py-3 mb-4">
          <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>
            {allApprox
              ? <>No exact pressure match was found — results marked <strong>Nearest available</strong> below fall within the admin-configured pressure tolerance instead of the exact value requested.</>
              : <>{approxCount} of {session.results.length} result(s) are marked <strong>Nearest available</strong> — those fall within the admin-configured pressure tolerance rather than matching the exact pressure requested.</>}
          </span>
        </div>
      ) : null}

      {session.results.length > 0 && (
        <button onClick={toggleAll} className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-accent mb-3">
          {allSelected ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
          {allSelected ? 'Deselect all' : 'Select all'} — only ticked models go into the exported PDF
        </button>
      )}

      <div className="space-y-3">
        {session.results.map((v) => {
          const isOpen = expanded === v.id;
          const isChecked = !!selected[v.id];
          const price = priceForVariant(v, pricingSet);
          return (
            <div key={v.id} className={`bg-white dark:bg-surface-dark-card border rounded-xl overflow-hidden transition-colors ${isChecked ? 'border-gray-200 dark:border-gray-800' : 'border-gray-100 dark:border-gray-800/60 opacity-60'}`}>
              <div className="w-full flex items-center gap-3 px-5 py-4">
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleOne(v.id)}
                  onClick={(e) => e.stopPropagation()}
                  className="w-4 h-4 rounded border-gray-300 text-accent focus:ring-accent/50 flex-shrink-0"
                  aria-label={`Include ${v.modelCode} in PDF`}
                />
                <button onClick={() => setExpanded(isOpen ? null : v.id)} className="flex-1 flex items-center justify-between text-left">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                      {v.modelCode}
                      {v.approxMatch && (
                        <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                          Nearest available
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {v.workingPressureBar} bar · {v.capacityCfm} cfm{v.driveType ? ` · ${v.driveType}` : ''}
                      {showPricing && price != null && ` · ₹${Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`}
                    </p>
                  </div>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                </button>
              </div>
              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-100 dark:border-gray-800 pt-4">
                  {showPricing && price != null && (
                    <div className="flex gap-3 mb-4 flex-wrap">
                      <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-accent/10 text-accent">
                        ₹{Number(price).toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                      </span>
                    </div>
                  )}
                  <dl className="grid sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
                    {(v.specs || []).filter((s) => !/list price/i.test(s.key)).map((s, i) => (
                      <div key={i} className="flex justify-between gap-2 border-b border-dashed border-gray-100 dark:border-gray-800 py-1">
                        <dt className="text-gray-500 dark:text-gray-400">{s.key}</dt>
                        <dd className="text-gray-900 dark:text-white font-medium text-right">{s.value}{s.unit ? ` ${s.unit}` : ''}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {matchedReferenceSeries.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Reference series</h2>
          {matchedReferenceSeries.map((s) => {
            const isOpen = !!openReferenceIds[s.id];
            const pdfHref = s.pdfUrl ? `${API_ORIGIN}${s.pdfUrl}${s.pdfPage ? `#page=${s.pdfPage}` : ''}` : null;
            return (
              <div key={s.id} className="bg-white dark:bg-surface-dark-card border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden">
                <div className="flex items-center justify-between gap-3 px-5 py-4 flex-wrap">
                  <p className="font-medium text-gray-900 dark:text-white">{s.name}</p>
                  <div className="flex items-center gap-2">
                    {s.tableData && (
                      <button
                        onClick={() => setOpenReferenceIds((m) => ({ ...m, [s.id]: !m[s.id] }))}
                        className={`text-sm px-3 py-1.5 rounded-lg border inline-flex items-center gap-1.5 ${isOpen ? 'border-accent bg-accent/10 text-accent font-medium' : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'}`}
                      >
                        <Table2 className="w-4 h-4" /> {isOpen ? 'Hide' : 'Show'} reference table
                      </button>
                    )}
                    {pdfHref && (
                      <a href={pdfHref} target="_blank" rel="noreferrer" className="text-sm px-3 py-1.5 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300 inline-flex items-center gap-1.5 hover:border-accent hover:text-accent">
                        <FileText className="w-4 h-4" /> View PDF
                      </a>
                    )}
                  </div>
                </div>
                {isOpen && s.tableData && (
                  <div className="overflow-x-auto border-t border-gray-100 dark:border-gray-800">
                    <table className="w-full text-sm min-w-[560px]">
                      <thead>
                        <tr className="bg-accent text-white">
                          {s.tableData.columns.map((c, i) => (
                            <th key={i} className={`px-3 py-2.5 font-medium ${i === 0 ? 'text-left' : 'text-center'}`}>{c}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {s.tableData.rows.map((row, ri) => (
                          <tr key={ri}>
                            {row.map((cell, ci) => (
                              <td key={ci} className={`px-3 py-2 ${ci === 0 ? 'text-left text-gray-700 dark:text-gray-300' : 'text-center text-gray-900 dark:text-white'}`}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {showExportOptions && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-surface-dark-card rounded-xl w-full max-w-sm p-6">
            <h2 className="font-semibold text-gray-900 dark:text-white mb-1">Export PDF</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This selection matches {matchedReferenceSeries.length} reference series. Include their tables and PDF
              links in the export?
            </p>
            <label className="flex items-start gap-2.5 mb-5 cursor-pointer">
              <input
                type="checkbox"
                checked={includeReferenceExtras}
                onChange={(e) => setIncludeReferenceExtras(e.target.checked)}
                className="w-4 h-4 mt-0.5 rounded border-gray-300 text-accent focus:ring-accent/50"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Include reference tables and PDF links
                <span className="block text-xs text-gray-400 mt-0.5">Leave unchecked to export just the results.</span>
              </span>
            </label>
            <div className="flex gap-2">
              <button onClick={() => setShowExportOptions(false)} className="btn-secondary text-sm flex-1 justify-center">Cancel</button>
              <button onClick={() => exportPdf(includeReferenceExtras)} className="btn-primary text-sm flex-1 justify-center">Export</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
