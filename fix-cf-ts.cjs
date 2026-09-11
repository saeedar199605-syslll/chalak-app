const fs = require('fs');

const files = [
  'functions/api/gemini/bias-check.ts',
  'functions/api/gemini/feedback.ts',
  'functions/api/gemini/nine-box-analysis.ts'
];

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/export const onRequestPost: PagesFunction<{ GEMINI_API_KEY: string }> = async \(context\) => {/, 'export const onRequestPost: any = async (context: any) => {');
  content = content.replace(/response\.text\(\)/g, 'response.text');
  fs.writeFileSync(file, content);
});

console.log('Fixed CF APIs');
