// Selection Tool — schema module (isolated with an `st_` table prefix so it
// never collides with the existing website CMS tables in server/db.js).
//
// Design reference: docs/selection-tool-architecture (artifact) Section 01.
import db from '../db.js';

export function ensureSelectionToolSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS st_products (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,      -- 'compressor' | 'dryer' | 'filter'
      brand TEXT,                  -- Kaishan | Trident | Parker | PMV
      family TEXT NOT NULL,        -- KRSA | KRSA2 | KRSB | KRSD | KRSP | KRD | Coldspell | Dryspell | ...
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS st_variants (
      id TEXT PRIMARY KEY,
      product_id TEXT NOT NULL,
      model_code TEXT NOT NULL,
      drive_type TEXT,             -- 'fixed' | 'vsd' | null
      active INTEGER DEFAULT 1,
      spec_version INTEGER DEFAULT 1,
      working_pressure_bar REAL,
      working_pressure_min_bar REAL,
      capacity_cfm REAL,
      capacity_m3min REAL,
      list_price REAL,             -- base price, used by "Lowest List Price" sort criterion
      specific_power REAL,         -- kW per cfm/m3min, used by "Lowest Specific Power" sort criterion
      -- Dryer operating envelope (Kaishan KRD sheets publish these as hard
      -- limits, e.g. "(Max 70/158)" on inlet temp) — a client's condition
      -- outside these isn't a capacity question, it's a "this model can't
      -- run here at all" question. Null for categories/brands that don't
      -- publish an envelope (matching skips the check when null).
      min_inlet_temp_c REAL,
      max_inlet_temp_c REAL,
      min_ambient_temp_c REAL,
      max_ambient_temp_c REAL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES st_products(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_st_variants_filter ON st_variants (product_id, working_pressure_bar, capacity_cfm);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_st_variants_model ON st_variants (model_code);

    CREATE TABLE IF NOT EXISTS st_specs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id TEXT NOT NULL,
      group_label TEXT,
      key TEXT NOT NULL,
      value TEXT,
      unit TEXT,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (variant_id) REFERENCES st_variants(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_st_specs_variant ON st_specs (variant_id);

    CREATE TABLE IF NOT EXISTS st_source_docs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      variant_id TEXT NOT NULL,
      file_name TEXT NOT NULL,
      sheet_name TEXT,
      FOREIGN KEY (variant_id) REFERENCES st_variants(id) ON DELETE CASCADE
    );

    -- A pricing set is now a percentage markup/markdown applied to the
    -- catalog's own list_price at display time, not a per-model price
    -- table — replaces the old st_price_entries model entirely (that
    -- table is kept, unused, rather than dropped, so an old deployment's
    -- data isn't destroyed outright). "Same % for every category" is
    -- represented as all three columns holding the same value; the admin
    -- UI decides whether to expose one shared field or three independent
    -- ones, this table always stores three so a set can freely switch
    -- between "shared" and "per-category" without changing shape.
    CREATE TABLE IF NOT EXISTS st_pricing_sets (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      is_active INTEGER DEFAULT 1,
      compressor_markup_pct REAL NOT NULL DEFAULT 0,
      dryer_markup_pct REAL NOT NULL DEFAULT 0,
      filter_markup_pct REAL NOT NULL DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Superseded by the markup-percentage columns on st_pricing_sets above
    -- (kept, unused, for backward compatibility with any existing rows —
    -- never read by current code).
    CREATE TABLE IF NOT EXISTS st_price_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pricing_set_id TEXT NOT NULL,
      variant_id TEXT NOT NULL,
      tier TEXT NOT NULL,          -- 'X1' | 'X2' | 'X3' ...
      amount REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      FOREIGN KEY (pricing_set_id) REFERENCES st_pricing_sets(id) ON DELETE CASCADE,
      FOREIGN KEY (variant_id) REFERENCES st_variants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS st_questionnaire (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      version INTEGER DEFAULT 1,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS st_questions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      questionnaire_id TEXT NOT NULL,
      label TEXT NOT NULL,
      param_key TEXT NOT NULL,     -- workingPressureBar | capacityCfm | inletTempC | ambientTempC | targetPdpC
      unit TEXT,
      role TEXT NOT NULL,          -- 'filter' | 'correction' | 'sort'
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (questionnaire_id) REFERENCES st_questionnaire(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS st_ingest_jobs (
      id TEXT PRIMARY KEY,
      source_path TEXT,
      status TEXT DEFAULT 'done',
      variants_touched INTEGER DEFAULT 0,
      ran_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- Admin-editable knobs for the matching engine, e.g. how many bar the
    -- pressure search widens by when nothing matches the client's exact
    -- input. Synced down to the offline store like everything else so
    -- offline matching applies the same tolerance the server would.
    CREATE TABLE IF NOT EXISTS st_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- A "reference series" is admin-managed supplementary material for one
    -- product family (e.g. KRD, PMV, Cleansweep+) — a spec table (rendered
    -- from table_data_json) and/or an attached vendor PDF, shown on the
    -- salesman results screen only when at least one matched result belongs
    -- to that family, and only when the salesman opts in via a per-series
    -- toggle (never shown automatically — confirmed with the client). Not
    -- tied 1:1 to st_products.family: several series (Coldspell / Coldspell+)
    -- share the same correction-formula family but need their own distinct
    -- reference entries, and pdf_page lets many series point at one shared
    -- multi-page catalog PDF (the compressor catalogue) instead of each
    -- needing its own file.
    CREATE TABLE IF NOT EXISTS st_reference_series (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,             -- display name, e.g. "KRD series", "Cleansweep+ (grades)"
      category TEXT NOT NULL,         -- 'compressor' | 'dryer' | 'filter'
      brand TEXT,                     -- matches st_products.brand for the "which results show this" rule
      family TEXT,                    -- matches st_products.family; null = matches every family under this brand/category
      table_data_json TEXT,           -- { columns: [...], rows: [[...], ...] } — null if this entry is PDF-only
      pdf_asset_path TEXT,            -- relative path under uploads/, e.g. 'selection-reference/<uuid>.pdf'
      pdf_original_name TEXT,         -- original filename, shown in the admin list and the "View PDF" button
      pdf_page INTEGER,               -- 1-based page to jump to when the PDF is opened; null = open at page 1
      sort_order INTEGER DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_st_reference_series_match ON st_reference_series (category, brand, family);
  `);

  db.prepare(`INSERT INTO st_settings (key, value) VALUES ('pressure_tolerance_bar', '3') ON CONFLICT(key) DO NOTHING`).run();
  // How far a model's capacity may sit from the client's requested figure,
  // as a percentage in both directions — e.g. 5 means a 210 cfm request only
  // matches models rated 199.5–220.5 cfm. Without this a model rated far
  // above the request (a much bigger, costlier machine) matched just as
  // readily as a close fit, which read as broken/nonsensical results.
  db.prepare(`INSERT INTO st_settings (key, value) VALUES ('capacity_tolerance_pct', '5') ON CONFLICT(key) DO NOTHING`).run();
  // Filter's own capacity tolerance, separate from the shared
  // capacity_tolerance_pct above — filters run a correction-factor formula
  // before the tolerance band is applied (see filterCorrection.js), and the
  // client wanted a wider default band there (10%) without changing
  // compressor/dryer's.
  db.prepare(`INSERT INTO st_settings (key, value) VALUES ('filter_capacity_tolerance_pct', '10') ON CONFLICT(key) DO NOTHING`).run();

  // Extend the existing `users` table with the two columns the pricing
  // access rule (Section 06) hinges on, without touching its other columns.
  const cols = db.prepare("PRAGMA table_info(users)").all().map(c => c.name);
  if (!cols.includes('pricing_set_id')) {
    db.exec("ALTER TABLE users ADD COLUMN pricing_set_id TEXT");
  }
  if (!cols.includes('status')) {
    db.exec("ALTER TABLE users ADD COLUMN status TEXT DEFAULT 'active'");
  }

  // st_variants pre-dates the operating-envelope columns above — CREATE
  // TABLE IF NOT EXISTS won't add them to an already-existing table.
  const variantCols = db.prepare("PRAGMA table_info(st_variants)").all().map((c) => c.name);
  for (const col of ['min_inlet_temp_c', 'max_inlet_temp_c', 'min_ambient_temp_c', 'max_ambient_temp_c']) {
    if (!variantCols.includes(col)) db.exec(`ALTER TABLE st_variants ADD COLUMN ${col} REAL`);
  }

  // st_pricing_sets pre-dates the markup-percentage columns (an older
  // deployment's table only has id/name/is_active/created_at).
  const pricingSetCols = db.prepare("PRAGMA table_info(st_pricing_sets)").all().map((c) => c.name);
  for (const col of ['compressor_markup_pct', 'dryer_markup_pct', 'filter_markup_pct']) {
    if (!pricingSetCols.includes(col)) db.exec(`ALTER TABLE st_pricing_sets ADD COLUMN ${col} REAL NOT NULL DEFAULT 0`);
  }
}

export default ensureSelectionToolSchema;
