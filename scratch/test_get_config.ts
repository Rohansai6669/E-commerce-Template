import fs from 'fs';
import path from 'path';

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf-8').split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
      const idx = trimmed.indexOf('=');
      const key = trimmed.slice(0, idx).trim();
      let val = trimmed.slice(idx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

async function main() {
  const { getCmsPageConfigServer } = await import('../src/app/actions/cms-actions');
  const config = await getCmsPageConfigServer('/');
  console.log('Server config sections enabled state:');
  for (const sec of config.sections) {
    console.log(`- ${sec.id} (${sec.type}): enabled=${sec.enabled}`);
  }
}

main().catch(console.error);
