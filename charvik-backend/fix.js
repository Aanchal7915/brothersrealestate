const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('route.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('d:/brothers/brothers-backend/app/api');

files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  if (!c.includes('export const dynamic')) {
    c = c.replace('export const runtime = "nodejs";', 'export const runtime = "nodejs";\nexport const dynamic = "force-dynamic";');
    fs.writeFileSync(f, c);
    console.log('Updated ' + f);
  }
});
