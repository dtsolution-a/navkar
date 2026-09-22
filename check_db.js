import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('./server/shah_admin.db');
const cats = db.prepare("SELECT id, name, brandId FROM categories WHERE brandId LIKE '%parker%'").all();
console.log(cats);
