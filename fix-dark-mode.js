const fs = require('fs');
const file = 'client/pages/admin/AdminAssessment.jsx';
let content = fs.readFileSync(file, 'utf8');

// Replacements to use CSS variables
content = content.replace(/bg-\[#f5efe6\]/g, 'bg-background');
content = content.replace(/bg-white/g, 'bg-card text-card-foreground');
content = content.replace(/border-slate-200/g, 'border-border');
content = content.replace(/text-slate-950/g, 'text-foreground');
content = content.replace(/text-slate-900/g, 'text-foreground');
content = content.replace(/text-slate-700/g, 'text-foreground');
content = content.replace(/text-slate-600/g, 'text-muted-foreground');
content = content.replace(/text-slate-500/g, 'text-muted-foreground');
content = content.replace(/bg-slate-50/g, 'bg-muted');

// Fix buttons
content = content.replace(/className="rounded-lg bg-red-100 px-3 py-2 text-xs font-black text-red-700"/g, 'className="rounded-lg bg-red-100 dark:bg-red-900/30 px-3 py-1.5 text-xs font-black text-red-700 dark:text-red-400"');
content = content.replace(/className="rounded-lg bg-card text-card-foreground px-3 py-2 text-xs font-black text-foreground"/g, 'className="rounded-lg bg-card text-card-foreground px-3 py-1.5 text-xs font-black text-foreground border border-border"');

// Image max height
content = content.replace(/max-h-64/g, 'max-h-48');

fs.writeFileSync(file, content);
console.log('Fixed AdminAssessment.jsx');
