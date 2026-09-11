const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(
/const handleContextMenu = \(e: React\.MouseEvent\) => \{/,
`const handleContextMenu = (e: React.MouseEvent) => {
    // DO NOT intercept right-clicks on inputs or textareas so native copy/paste works!
    const target = e.target as HTMLElement;
    if (target.tagName.toLowerCase() === 'input' || target.tagName.toLowerCase() === 'textarea' || target.isContentEditable) {
      return; // allow native menu
    }`
);

fs.writeFileSync('src/App.tsx', code);
