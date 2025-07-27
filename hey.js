const fs = require('fs');
const path = require('path');

const filesToFix = [
  'convex/functions/documents.ts',
  'convex/functions/orders.ts',
  'convex/functions/services.ts',
  'convex/functions/services/create.ts',
  'convex/functions/services/getAll.ts',
  'convex/functions/services/getById.ts',
  'convex/functions/services/remove.ts',
  'convex/functions/services/update.ts'
];

filesToFix.forEach((relativePath) => {
  const filePath = path.join(__dirname, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`File not found: ${relativePath}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  // Fix incorrect import path
  content = content.replace(/@\/convex\/_generated\/serverd\/server/g, '@/convex/_generated/server');
  content = content.replace(/\.\/_generated\/server/g, '@/convex/_generated/server');

  // Fix invalid float() validator
  content = content.replace(/\bv\.float\(\)/g, 'v.float64()');
  content = content.replace(/\bv\.optional\(v\.float\(\)\)/g, 'v.optional(v.float64())');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${relativePath}`);
});
