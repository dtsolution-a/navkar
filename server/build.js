import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, '..');

console.log('Building CJS server bundle for cPanel LiteSpeed...');

try {
  // Run esbuild to compile ESM into a single CommonJS file
  execSync(
    'npx esbuild server/index.js --bundle --platform=node --format=cjs --outfile=server/app.cjs --external:express --external:cors --external:multer --external:bcryptjs --external:jsonwebtoken --external:xlsx --external:uuid --external:framer-motion --external:lucide-react --external:pdfjs-dist --banner:js="globalThis.import_meta = { url: require(\'url\').pathToFileURL(__filename).href };" --define:import.meta=globalThis.import_meta',
    { cwd: rootDir, stdio: 'inherit' }
  );
  
  const appCjsPath = path.join(rootDir, 'server/app.cjs');
  let content = fs.readFileSync(appCjsPath, 'utf8');
  
  // Append exports to the end of the compiled file
  content += '\n\n// LiteSpeed compatibility: export app directly\nmodule.exports = app;\nif (typeof exports !== "undefined") {\n  exports.default = app;\n}\n';
  
  fs.writeFileSync(appCjsPath, content, 'utf8');
  console.log('[SUCCESS] CJS server bundle created at server/app.cjs');
} catch (err) {
  console.error('[ERROR] Build failed:', err.message);
  process.exit(1);
}
