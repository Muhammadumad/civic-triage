const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const frontendNext = path.join(rootDir, 'frontend', '.next');
const rootNext = path.join(rootDir, '.next');
const frontendPublic = path.join(rootDir, 'frontend', 'public');
const rootPublic = path.join(rootDir, 'public');

if (fs.existsSync(frontendNext)) {
  fs.cpSync(frontendNext, rootNext, { recursive: true });
  console.log('✓ Successfully synced frontend/.next -> .next');
} else {
  console.warn('⚠ Warning: frontend/.next does not exist to sync.');
}

if (fs.existsSync(frontendPublic)) {
  fs.cpSync(frontendPublic, rootPublic, { recursive: true });
  console.log('✓ Successfully synced frontend/public -> public');
}
