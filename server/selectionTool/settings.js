// Selection Tool — admin-editable matching-engine settings.
import db from '../db.js';
import ensureSelectionToolSchema from './schema.js';

ensureSelectionToolSchema();

const getStmt = db.prepare('SELECT value FROM st_settings WHERE key = ?');
const setStmt = db.prepare(`
  INSERT INTO st_settings (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
  ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
`);
const allStmt = db.prepare('SELECT key, value FROM st_settings');

export function getSetting(key, fallback = null) {
  const row = getStmt.get(key);
  return row ? row.value : fallback;
}

export function getSettingNumber(key, fallback) {
  const raw = getSetting(key);
  const n = raw != null ? Number(raw) : NaN;
  return Number.isFinite(n) ? n : fallback;
}

export function setSetting(key, value) {
  setStmt.run(key, String(value));
}

export function getAllSettings() {
  const rows = allStmt.all();
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}
