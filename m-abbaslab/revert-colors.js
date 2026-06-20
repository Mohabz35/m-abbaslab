const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(dirPath);
  });
}

function revertFiles(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return;
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // Revert border-blue corruption
  newContent = newContent.replace(/border-b border-gray-200 dark:border-gray-700lue/g, 'border-blue');
  // Revert border-transparent corruption
  newContent = newContent.replace(/border-t border-gray-200 dark:border-gray-700ransparent/g, 'border-transparent');
  // Revert border-teal corruption
  newContent = newContent.replace(/border-t border-gray-200 dark:border-gray-700eal/g, 'border-teal');
  // Revert divide-yellow corruption
  newContent = newContent.replace(/divide-y divide-gray-200 dark:divide-gray-700ellow/g, 'divide-yellow');
  
  // Revert border template literal corruptions e.g. ${hc.border border-gray-200 dark:border-gray-700}
  newContent = newContent.replace(/\$\{([^}]*\.border) border-gray-200 dark:border-gray-700\}/g, '${$1}');

  // Also fix border-b border-gray-200 dark:border-gray-700 in case it broke border-bottom properties inside objects if any
  // Well, we just fixed the obvious ones.

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed', filePath);
  }
}

['app/admin', 'components/admin'].forEach(dir => {
  const fullPath = path.join(__dirname, dir);
  if (fs.existsSync(fullPath)) {
    walkDir(fullPath, revertFiles);
  }
});
