const fs = require('fs');
const path = process.argv[2];
let content = fs.readFileSync(path, 'utf8');

// Remove full lines containing triple-quoted descriptions (single- or multi-line)
const cleaned = content.replace(/^[ \t]*"""[\s\S]*?"""[\r\n]*/gm, '');

fs.writeFileSync(path, cleaned, 'utf8');
