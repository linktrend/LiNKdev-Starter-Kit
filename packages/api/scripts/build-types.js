import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Generating TypeScript declarations...');

try {
  // Use TypeScript compiler to generate declarations
  execSync('npx tsc --project tsconfig.json --declaration --emitDeclarationOnly --outDir dist', {
    cwd: path.join(__dirname, '..'),
    stdio: 'inherit'
  });
  
  console.log('Type definitions generated successfully');
} catch (error) {
  console.error('Error generating type definitions:', error.message);
  process.exit(1);
}
