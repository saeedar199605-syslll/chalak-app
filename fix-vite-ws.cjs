const fs = require('fs');
let code = fs.readFileSync('index.html', 'utf-8');

if (!code.includes('failed to connect to websocket')) {
  code = code.replace(
    /<head>/,
    "<head>\n    <script>\n      const originalError = console.error;\n      console.error = function(...args) {\n        if (args[0] && typeof args[0] === 'string' && args[0].includes('failed to connect to websocket')) return;\n        originalError.apply(console, args);\n      };\n    </script>"
  );
  fs.writeFileSync('index.html', code);
  console.log('index.html patched.');
} else {
  console.log('index.html already patched.');
}
