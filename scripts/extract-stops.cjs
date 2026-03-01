const fs = require('fs');
const path = require('path');

const publicData = path.join(__dirname, '..', 'public', 'data');
fs.mkdirSync(publicData, { recursive: true });

// Extract ctb-nwfb data
let content = fs.readFileSync(path.join(__dirname, '..', 'src', 'ctb-nwfb.ts'), 'utf8');
let lines = content.split('\n');
// Skip import line and blank line, and the export line prefix
let startIdx = lines.findIndex(l => l.startsWith('export const'));
let arrayContent = lines.slice(startIdx).join('\n');
// Remove the "export const CTB_NWFB_STOPS: Partial<CtbNwfbStop>[] = " prefix
arrayContent = arrayContent.replace(/^export const .* = /, '');
// Remove trailing semicolon
arrayContent = arrayContent.trim().replace(/;\s*$/, '');
// Convert to valid JSON: quote unquoted keys
arrayContent = arrayContent.replace(/^(\s+)(\w+):/gm, '$1"$2":');
// Remove trailing commas
arrayContent = arrayContent.replace(/,(\s*[}\]])/g, '$1');
fs.writeFileSync(path.join(publicData, 'ctb-nwfb-stops.json'), arrayContent);
console.log('ctb-nwfb-stops.json written');

// Extract nlb data
content = fs.readFileSync(path.join(__dirname, '..', 'src', 'nlb.ts'), 'utf8');
lines = content.split('\n');
startIdx = lines.findIndex(l => l.startsWith('export const'));
arrayContent = lines.slice(startIdx).join('\n');
arrayContent = arrayContent.replace(/^export const .* = /, '');
arrayContent = arrayContent.trim().replace(/;\s*$/, '');
arrayContent = arrayContent.replace(/^(\s+)(\w+):/gm, '$1"$2":');
arrayContent = arrayContent.replace(/,(\s*[}\]])/g, '$1');
fs.writeFileSync(path.join(publicData, 'nlb-stops.json'), arrayContent);
console.log('nlb-stops.json written');

