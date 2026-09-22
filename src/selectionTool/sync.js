// Selection Tool — sync orchestration (Section 05: full pull on login,
// falls back silently to whatever's already in Dexie when offline).
import selectionToolAPI from './api';
import { saveCatalog, saveQuestionnaire, savePricingSet, getCatalogVersion, savePressureTolerance, saveCapacityTolerancePct, saveFilterCapacityTolerancePct, saveValidationLimits, saveReferenceSeries } from './db';

export const CATEGORIES = ['compressor', 'dryer', 'filter'];

export async function syncAll() {
  const results = { ok: false, categories: {} };
  try {
    for (const category of CATEGORIES) {
      const [questionnaire, catalog] = await Promise.all([
        selectionToolAPI.getQuestionnaire(category).catch(() => null),
        selectionToolAPI.syncCatalog(category, 0).catch(() => null),
      ]);
      if (questionnaire) await saveQuestionnaire(category, questionnaire.questions);
      if (catalog) await saveCatalog({ category, variants: catalog.variants, version: catalog.version });
      const referenceSeries = await selectionToolAPI.getReferenceSeries(category).catch(() => null);
      if (referenceSeries) await saveReferenceSeries(category, referenceSeries);
      results.categories[category] = {
        questions: questionnaire?.questions?.length ?? 0,
        variants: catalog?.count ?? 0,
      };
    }
    const pricing = await selectionToolAPI.myPricing().catch(() => ({ pricingSet: null }));
    await savePricingSet(pricing.pricingSet);
    // Admin-configurable pressure/capacity tolerance — must match the
    // server's fallback matching exactly, so it rides along with every sync
    // rather than being hardcoded client-side.
    const settings = await selectionToolAPI.getSettings().catch(() => null);
    if (settings && settings.pressureToleranceBar != null) {
      await savePressureTolerance(settings.pressureToleranceBar);
    }
    if (settings && settings.capacityTolerancePct != null) {
      await saveCapacityTolerancePct(settings.capacityTolerancePct);
    }
    if (settings && settings.filterCapacityTolerancePct != null) {
      await saveFilterCapacityTolerancePct(settings.filterCapacityTolerancePct);
    }
    // Admin-editable per-field min/max for the questionnaire — same
    // data-driven-with-override shape as the tolerances above.
    const limits = await selectionToolAPI.getValidationLimits().catch(() => null);
    if (limits) await saveValidationLimits(limits);
    results.ok = true;
    results.hasPricingSet = !!pricing.pricingSet;
  } catch (err) {
    results.error = err.message;
  }
  return results;
}

export { getCatalogVersion };
