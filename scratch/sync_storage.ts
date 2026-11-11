import fs from 'fs';
import path from 'path';
import { defaultHomepageConfig } from '../src/lib/cms/defaults';

async function main() {
  const CMS_STORAGE_PATH = path.join(process.cwd(), 'src', 'lib', 'cms', 'cms-storage.json');
  
  // Custom configuration matching user screenshot:
  // HERO: enabled true
  // SEASONAL_SALE_GRID: enabled true
  // CATEGORY_GRID: enabled false
  // PRODUCT_GRID: enabled true
  // EDITORIAL_BANNER: enabled false
  // PROMO_BANNER: enabled false
  
  const sections = defaultHomepageConfig.sections.map(sec => {
    if (sec.type === 'CATEGORY_GRID' || sec.type === 'EDITORIAL_BANNER' || sec.type === 'PROMO_BANNER') {
      return { ...sec, enabled: false };
    }
    return { ...sec, enabled: true };
  });
  
  const pageConfig = {
    ...defaultHomepageConfig,
    sections,
  };

  const data = { '/': pageConfig };
  fs.writeFileSync(CMS_STORAGE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log('Saved synced CMS config to cms-storage.json successfully.');
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
