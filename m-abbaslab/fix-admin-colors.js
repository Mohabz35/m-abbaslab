const fs = require('fs');
const path = require('path');

function processDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(processDir(fullPath));
    } else if (fullPath.endsWith('.tsx')) {
      results.push(fullPath);
    }
  });
  return results;
}

const adminAppFiles = processDir(path.join('C:/Users/USER/m-abbaslab/m-abbaslab/app/admin'));
const adminComponentsFiles = processDir(path.join('C:/Users/USER/m-abbaslab/m-abbaslab/components/admin'));

const files = [...adminAppFiles, ...adminComponentsFiles];

files.forEach(fullPath => {
  let content = fs.readFileSync(fullPath, 'utf8');
  let original = content;

  // Add dark mode support to backgrounds and borders
  content = content.replace(/bg-white(?!\s+dark:)/g, 'bg-white dark:bg-gray-800');
  content = content.replace(/bg-gray-50(?!\s+dark:)/g, 'bg-gray-50 dark:bg-gray-800/50');
  content = content.replace(/bg-gray-100(?!\s+dark:)/g, 'bg-gray-100 dark:bg-gray-800');
  content = content.replace(/hover:bg-gray-50(?!\s+dark:)/g, 'hover:bg-gray-50 dark:hover:bg-gray-700/50');
  content = content.replace(/hover:bg-gray-100(?!\s+dark:)/g, 'hover:bg-gray-100 dark:hover:bg-gray-700');
  content = content.replace(/hover:bg-gray-200(?!\s+dark:)/g, 'hover:bg-gray-200 dark:hover:bg-gray-700');
  
  // Update borders
  content = content.replace(/border-gray-100(?!\s+dark:)/g, 'border-gray-100 dark:border-gray-700');
  content = content.replace(/border-gray-200(?!\s+dark:)/g, 'border-gray-200 dark:border-gray-700');
  content = content.replace(/\bborder\b(?!-[\w]+)(?!\s+border-gray-200)(?!\s+dark:)/g, 'border border-gray-200 dark:border-gray-700');
  
  // Update text colors for better contrast (look at the letters)
  content = content.replace(/text-gray-300(?!\s+dark:)/g, 'text-gray-400 dark:text-gray-600');
  content = content.replace(/text-gray-400(?!\s+dark:)/g, 'text-gray-500 dark:text-gray-400');
  content = content.replace(/text-gray-500(?!\s+dark:)/g, 'text-gray-600 dark:text-gray-400');
  content = content.replace(/text-gray-600(?!\s+dark:)/g, 'text-gray-600 dark:text-gray-300');
  content = content.replace(/text-gray-700(?!\s+dark:)/g, 'text-gray-700 dark:text-gray-200');
  content = content.replace(/text-gray-800(?!\s+dark:)/g, 'text-gray-800 dark:text-gray-100');
  content = content.replace(/text-gray-900(?!\s+dark:)/g, 'text-gray-900 dark:text-gray-50');

  // Fix table texts where no explicit color is given but text is dark
  // The layout defaults text to `text-gray-900 dark:text-white` but inside cards we might need to enforce dark mode table lines
  content = content.replace(/border-b(?!-[\w]+)(?!\s+border-gray-200)(?!\s+dark:)/g, 'border-b border-gray-200 dark:border-gray-700');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${path.basename(fullPath)}`);
  }
});
