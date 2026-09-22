const db = require('better-sqlite3')('./shah_admin.db');

const brandOrder = ['parker', 'opw', 'kaishan', 'tubacex', 'trident', 'anest-iwata', 'airnet', 'gajjar-compressor'];
const stmtBrand = db.prepare('UPDATE brands SET sort_order = ? WHERE id = ?');
db.transaction(() => {
  brandOrder.forEach((id, index) => {
    stmtBrand.run(index, id);
  });
})();

const parkerOrder = ['instrumentation', 'clean-energy', 'pneumatics', 'hydraulic-connectors', 'gas-generator', 'distribution-control'];
const stmtCat = db.prepare('UPDATE categories SET sort_order = ? WHERE id = ? AND brand_id = ?');
db.transaction(() => {
  parkerOrder.forEach((id, index) => {
    stmtCat.run(index, id, 'parker');
  });
})();

console.log('Live Database sort orders updated successfully!');
