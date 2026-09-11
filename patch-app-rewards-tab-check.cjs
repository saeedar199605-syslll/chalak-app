const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Ensure that even if someone gets to the URL, they have the correct roles.
// App.tsx already checks this in the render logic!
console.log('Done');
