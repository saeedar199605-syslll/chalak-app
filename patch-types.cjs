const fs = require('fs');
let code = fs.readFileSync('src/types.ts', 'utf-8');

if (!code.includes('export interface SupportTicket')) {
    code += `\n\nexport interface SupportTicket {
  id: string;
  senderId: string;
  senderName: string;
  subject: string;
  message: string;
  status: 'open' | 'in_progress' | 'closed';
  createdAt: string;
  updatedAt: string;
  replies: { id: string; senderId: string; senderName: string; message: string; createdAt: string; isAdmin: boolean }[];
}\n`;
}

if (!code.includes('permissions?: string[]')) {
    code = code.replace(/hrPartnerId\?: string; \/\/ HR Business Partner for feedback meeting \(Stage 5\)/, "hrPartnerId?: string; // HR Business Partner for feedback meeting (Stage 5)\n  permissions?: string[]; // Granular RBAC permissions");
}

fs.writeFileSync('src/types.ts', code);
