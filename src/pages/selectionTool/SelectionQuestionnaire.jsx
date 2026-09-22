import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { db, matchLocally, saveActiveSession, getValidationLimits, getActiveSession } from '../../selectionTool/db';

const CATEGORY_LABELS = { compressor: 'Air Compressor', dryer: 'Air Dryer', filter: 'Air Filter' };

// Questionnaire param_key differs per category (compressor asks
// workingPressureBar/capacityCfm, dryer/filter ask minWorkingPressureBar/
// maxInletFlowCfm) but they're the same two physical questions the admin
// panel sets limits for under 'pressureBar'/'capacityCfm' — see
// server/routes/selectionTool.js's VALIDATION_FIELDS.
const PARAM_KEY_TO_LIMIT_FIELD = {
  workingPressureBar: 'pressureBar',
  minWorkingPressureBar: null, // dryer/filter pressure is a formula input, not a rated spec — no limit offered
  capacityCfm: 'capacityCfm',
  maxInletFlowCfm: 'capacityCfm',
};

export default function SelectionQuestionnaire() {
  const { category } = useParams();
  const navigate = useNavigate();
  const [questions, setQuestions] = useState(null);
  const [answers, setAnswers] = useState({});
  const [sort, setSort] = useState('price');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [limits, setLimits] = useState(null);

  useEffect(() => {
    db.questions.where('category').equals(category).sortBy('sortOrder').then(setQuestions);
    getValidationLimits().then(setLimits);
    // "Edit requirement" on the results page navigates back here — refill
    // the form from the last submitted answers for this category instead of
    // making the salesman retype everything, same values they already saw
    // results for.
    getActiveSession().then((s) => {
      if (s && s.category === category) {
        setAnswers(Object.fromEntries(Object.entries(s.answers).map(([k, v]) => [k, String(v)])));
        setSort(s.sort || 'price');
      }
    });
  }, [category]);

  // { min, max } for a param_key, or null when this field has no admin-set
  // limit (dryer/filter pressure — see PARAM_KEY_TO_LIMIT_FIELD above).
  const limitFor = (paramKey) => {
    const field = PARAM_KEY_TO_LIMIT_FIELD[paramKey];
    if (!field || !limits?.[category]) return null;
    return limits[category][field] || null;
  };

  if (!questions) {
    return <div className="max-w-2xl mx-auto px-4 py-16 text-center text-gray-500">Loading questionnaire…</div>;
  }

  const inputQuestions = questions.filter((q) => q.role === 'filter' || q.role === 'correction');
  const sortQuestions = questions.filter((q) => q.role === 'sort');

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    const missing = questions.filter((q) => q.role === 'filter' && !answers[q.param_key]);
    if (missing.length) { setError(`Please fill in: ${missing.map((q) => q.label).join(', ')}`); return; }

    // Catch an out-of-range value here too, not just via the input's own
    // min/max — a value typed then edited can slip past the browser's
    // built-in check, and this is the same guard matchLocally() itself has
    // no visibility into (it just gets numbers).
    for (const q of inputQuestions) {
      const limit = limitFor(q.param_key);
      if (!limit || answers[q.param_key] === undefined || answers[q.param_key] === '') continue;
      const val = Number(answers[q.param_key]);
      if (limit.min != null && val < limit.min) { setError(`${q.label} must be at least ${limit.min}.`); return; }
      if (limit.max != null && val > limit.max) { setError(`${q.label} must be at most ${limit.max}.`); return; }
    }

    setSubmitting(true);
    const parsed = Object.fromEntries(Object.entries(answers).map(([k, v]) => [k, Number(v)]));
    const results = await matchLocally(category, parsed);

    const sortedResults = [...results].sort((a, b) =>
      sort === 'efficiency'
        ? (a.specificPower ?? Infinity) - (b.specificPower ?? Infinity)
        : (a.listPrice ?? Infinity) - (b.listPrice ?? Infinity)
    );

    await saveActiveSession({ category, answers: parsed, sort, results: sortedResults });
    setSubmitting(false);
    navigate(`/selection-tool/${category}/results`);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <Link to="/selection-tool" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-accent mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to categories
      </Link>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{CATEGORY_LABELS[category]} diagnosis</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">Enter the client's requirement — this runs entirely on this device.</p>

      <form onSubmit={submit} className="space-y-5">
        {inputQuestions.map((q) => {
          const limit = limitFor(q.param_key);
          return (
          <div key={q.param_key}>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              {q.label} {q.role === 'correction' && <span className="text-gray-400 font-normal">(optional)</span>}
            </label>
            <input
              type="number"
              step="any"
              min={limit?.min ?? undefined}
              max={limit?.max ?? undefined}
              required={q.role === 'filter'}
              value={answers[q.param_key] || ''}
              onChange={(e) => setAnswers((a) => ({ ...a, [q.param_key]: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-surface-dark-card focus:outline-none focus:ring-2 focus:ring-accent/50"
            />
            {limit && (limit.min != null || limit.max != null) && (
              <p className="text-xs text-gray-400 mt-1">
                Allowed range: {limit.min ?? '—'}–{limit.max ?? '—'}
              </p>
            )}
          </div>
          );
        })}

        {sortQuestions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Rank results by</label>
            <div className="flex gap-3">
              {sortQuestions.map((q) => {
                const value = q.param_key === 'sortSpecificPower' ? 'efficiency' : 'price';
                return (
                  <button
                    type="button"
                    key={q.param_key}
                    onClick={() => setSort(value)}
                    className={`flex-1 text-sm px-4 py-2.5 rounded-lg border transition-colors ${
                      sort === value
                        ? 'border-accent bg-accent/10 text-accent font-medium'
                        : 'border-gray-300 dark:border-gray-700 text-gray-600 dark:text-gray-300'
                    }`}
                  >
                    {q.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {error && <div className="text-sm text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400 rounded-lg px-3 py-2">{error}</div>}

        <button type="submit" disabled={submitting} className="btn-primary w-full justify-center disabled:opacity-60">
          {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
          Find matching models
        </button>
      </form>
    </div>
  );
}
