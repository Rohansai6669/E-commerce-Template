async function main() {
  const res = await fetch('http://localhost:3000');
  const html = await res.text();

  const idx = html.indexOf('SHOP BY CATEGORY');
  if (idx !== -1) {
    console.log('Snippet around SHOP BY CATEGORY:');
    console.log(html.slice(Math.max(0, idx - 100), Math.min(html.length, idx + 200)));
  } else {
    console.log('SHOP BY CATEGORY NOT FOUND in HTML!');
  }
}

main().catch(console.error);
