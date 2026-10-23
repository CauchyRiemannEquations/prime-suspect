const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
let html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const css = fs.readFileSync(path.join(root, 'styles.css'), 'utf8');
html = html.replace('  <link rel="stylesheet" href="styles.css">', '  <style>\n' + css + '\n</style>');
html = html.replace(/^  <script defer src="[^"]+"><\/script>\r?\n/gm, '');

const js = ['assets/manifest.js', 'core.js', 'cases.js', 'game.js']
  .map(file => fs.readFileSync(path.join(root, file), 'utf8'))
  .join('\n');
html = html.replace('</body>', '<script>\n' + js.replace(/<\/script/gi, '<\\/script') + '\n</script>\n</body>');

fs.writeFileSync(path.join(root, 'PrimeSuspect.html'), html);
process.stdout.write('Built PrimeSuspect.html\n');
