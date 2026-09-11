const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

if (!code.includes("import SupportTickets")) {
    code = code.replace(/import Reports from '\.\/components\/Reports';/, "import Reports from './components/Reports';\nimport SupportTickets from './components/SupportTickets';");
}

code = code.replace(/type TabType = /g, "type TabType = 'support' | ");

// Add presence ping in useEffect
code = code.replace(
/useEffect\(\(\) => \{\n    \/\/ Listen to cross-tab auth state changes/,
`useEffect(() => {
    // Presence ping every 10 seconds
    const pingPresence = () => {
      const userStr = localStorage.getItem('pe_currentUser');
      if (userStr) {
        try {
          const user = JSON.parse(userStr);
          const presences = db.getMiscData('pe_presence', {});
          presences[user.id] = Date.now();
          db.saveMiscData('pe_presence', presences);
        } catch(e) {}
      }
    };
    pingPresence();
    const presenceInterval = setInterval(pingPresence, 10000);

    // Listen to cross-tab auth state changes`
);

// Clear interval
code = code.replace(
/return \(\) => window.removeEventListener\('storage', handleStorageChange\);/,
`return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(presenceInterval);
    };`
);

// Render support tab
code = code.replace(
/\{currentTab === 'reports' && \(/,
`{currentTab === 'support' && <SupportTickets currentUser={currentUser} theme={theme} />}
          {currentTab === 'reports' && (`
);

fs.writeFileSync('src/App.tsx', code);
