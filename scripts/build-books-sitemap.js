const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://books.islamicofficial.com';
const projectId = 'islamicofficial-9279f';
const projectRoot = path.resolve(__dirname, '..');
const booksPath = path.join(projectRoot, 'public', 'books');
const sitemapPath = path.join(booksPath, 'sitemap.xml');

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  })[character]);
}

async function loadBookUrls() {
  const urls = [];
  let pageToken = '';
  let pageCount = 0;

  do {
    const endpoint = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/books`
    );
    endpoint.searchParams.set('pageSize', '1000');
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Firestore book listing failed (${response.status} ${response.statusText})`);
    }

    const result = await response.json();
    if (result.documents !== undefined && !Array.isArray(result.documents)) {
      throw new Error('Firestore returned an invalid book list.');
    }

    for (const document of result.documents || []) {
      const bookId = document.name?.split('/').pop();
      if (!bookId) throw new Error('Firestore returned a book without an ID.');

      const bookUrl = new URL('/', siteUrl);
      bookUrl.searchParams.set('id', bookId);
      const timestamp = document.fields?.updatedAt?.timestampValue
        || document.fields?.createdAt?.timestampValue;
      const lastModified = timestamp
        ? `\n    <lastmod>${escapeXml(new Date(timestamp).toISOString())}</lastmod>`
        : '';
      urls.push(`  <url>\n    <loc>${escapeXml(bookUrl.href)}</loc>${lastModified}\n  </url>`);
    }

    pageToken = result.nextPageToken || '';
    pageCount += 1;
    if (pageCount > 100) throw new Error('Firestore book sitemap exceeded the pagination safety limit.');
  } while (pageToken);

  return [...new Set(urls)];
}

async function buildSitemap() {
  const bookEntries = await loadBookUrls();
  const contents = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    `  <url>\n    <loc>${escapeXml(`${siteUrl}/`)}</loc>\n  </url>`,
    ...bookEntries,
    '</urlset>',
    ''
  ].join('\n');

  fs.writeFileSync(sitemapPath, contents);
  const outputPath = path.join(projectRoot, 'dist', 'books');
  fs.mkdirSync(outputPath, { recursive: true });
  fs.cpSync(booksPath, outputPath, { recursive: true });
  const iconsSource = path.join(projectRoot, 'public', 'assets', 'vendor', 'bootstrap-icons');
  const iconsOutput = path.join(outputPath, 'assets', 'vendor', 'bootstrap-icons');
  fs.mkdirSync(path.dirname(iconsOutput), { recursive: true });
  fs.cpSync(iconsSource, iconsOutput, { recursive: true });
  const sharedScriptSource = path.join(projectRoot, 'public', 'assets', 'js', 'firestore-pdf-store.js');
  const sharedScriptOutput = path.join(outputPath, 'assets', 'js', 'firestore-pdf-store.js');
  fs.mkdirSync(path.dirname(sharedScriptOutput), { recursive: true });
  fs.copyFileSync(sharedScriptSource, sharedScriptOutput);
  console.log(`Generated books sitemap with 1 library page and ${bookEntries.length} book pages.`);
}

buildSitemap().catch((error) => {
  console.error('Could not generate books sitemap:', error);
  process.exitCode = 1;
});
