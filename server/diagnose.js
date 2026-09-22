import fs from 'fs';
import path from 'path';

console.log('--- cPanel Node.js Application Diagnostics ---');

// 1. Check environment variables
console.log('\n1. Environment Variables:');
console.log(`PORT: ${process.env.PORT}`);
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);

// 2. Check public_html .htaccess
const rootHtaccess = '/home/shahgroup/public_html/.htaccess';
console.log(`\n2. Checking root .htaccess at: ${rootHtaccess}`);
if (fs.existsSync(rootHtaccess)) {
  try {
    console.log(fs.readFileSync(rootHtaccess, 'utf8'));
  } catch (err) {
    console.error(`Error reading root .htaccess: ${err.message}`);
  }
} else {
  console.log('Root .htaccess does not exist!');
}

// 3. Check public_html/api directory
const apiDir = '/home/shahgroup/public_html/api';
console.log(`\n3. Checking api directory at: ${apiDir}`);
if (fs.existsSync(apiDir)) {
  try {
    const files = fs.readdirSync(apiDir);
    console.log(`Files inside api directory: ${JSON.stringify(files)}`);
    
    const apiHtaccess = path.join(apiDir, '.htaccess');
    if (fs.existsSync(apiHtaccess)) {
      console.log(`\nContents of api/.htaccess:`);
      console.log(fs.readFileSync(apiHtaccess, 'utf8'));
    } else {
      console.log('api/.htaccess does not exist!');
    }
  } catch (err) {
    console.error(`Error reading api directory: ${err.message}`);
  }
} else {
  console.log('api directory does not exist!');
}

// 4. Check shah-api directory and log files
const appRoot = '/home/shahgroup/shah-api';
console.log(`\n4. Checking app root at: ${appRoot}`);
if (fs.existsSync(appRoot)) {
  try {
    const files = fs.readdirSync(appRoot);
    console.log(`Files inside app root: ${JSON.stringify(files)}`);
    


    // Look for common log files (.log, stderr, etc.)
    for (const file of files) {
      if (file.endsWith('.log') || file.includes('stderr') || file.includes('error')) {
        const logPath = path.join(appRoot, file);
        console.log(`\nFound log file: ${file}`);
        try {
          const logContent = fs.readFileSync(logPath, 'utf8');
          console.log(`--- Log Content (Last 50 lines) ---`);
          const lines = logContent.split('\n');
          console.log(lines.slice(-50).join('\n'));
          console.log(`--- End of Log Content ---`);
        } catch (e) {
          console.error(`Error reading log file ${file}: ${e.message}`);
        }
      }
    }
  } catch (err) {
    console.error(`Error reading app root: ${err.message}`);
  }
}

console.log('\n--- Diagnostics Complete ---');
process.exit(0);

