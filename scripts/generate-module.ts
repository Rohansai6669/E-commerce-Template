import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';

const moduleName = process.argv[2];

if (!moduleName) {
  console.error('❌ Please specify a module name. Example: npm run generate-module coupons');
  process.exit(1);
}

const targetDir = join(process.cwd(), 'src', 'modules', moduleName);

if (existsSync(targetDir)) {
  console.error(`❌ Module "${moduleName}" already exists!`);
  process.exit(1);
}

console.log(`📦 Generating business module: ${moduleName}...`);

mkdirSync(targetDir, { recursive: true });
mkdirSync(join(targetDir, 'components'), { recursive: true });
mkdirSync(join(targetDir, 'actions'), { recursive: true });
mkdirSync(join(targetDir, 'hooks'), { recursive: true });

writeFileSync(join(targetDir, 'types.ts'), `export interface ${capitalize(moduleName)} {\n  id: string;\n  createdAt: string;\n}\n`);

writeFileSync(
  join(targetDir, 'README.md'),
  `# ${capitalize(moduleName)} Module\n\nThis module contains components, Server Actions, state hooks, and domain logic for managing ${moduleName}.\n`
);

console.log(`✅ Module "${moduleName}" generated successfully at src/modules/${moduleName}!`);

function capitalize(text: string) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}
