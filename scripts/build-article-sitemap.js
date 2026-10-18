const fs = require('node:fs');
const path = require('node:path');

const siteUrl = 'https://islamicofficial.com';
const projectId = 'islamicofficial-9279f';
const sitemapPath = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
const staticPaths = [
  '/',
  '/blog.html',
  '/media.html',
  '/links.html',
  '/currency.html',
  '/privacy.html'
];

function escapeXml(value) {
  return String(value).replace(/[<>&'"]/g, (character) => ({
    '<': '&lt;',
    '>': '&gt;',
    '&': '&amp;',
    "'": '&apos;',
    '"': '&quot;'
  })[character]);
}

async function loadArticleUrls() {
  const urls = [];
  let pageToken = '';
  let pageCount = 0;

  do {
    const endpoint = new URL(
      `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/articles`
    );
    endpoint.searchParams.set('pageSize', '1000');
    if (pageToken) endpoint.searchParams.set('pageToken', pageToken);

    const response = await fetch(endpoint);
    if (!response.ok) {
      throw new Error(`Firestore article listing failed (${response.status} ${response.statusText})`);
    }

    const result = await response.json();
    if (result.documents !== undefined && !Array.isArray(result.documents)) {
      throw new Error('Firestore returned an invalid article list.');
    }

    for (const document of result.documents || []) {
      const articleId = document.name?.split('/').pop();
      if (!articleId) throw new Error('Firestore returned an article without an ID.');

      const articleUrl = new URL('/article-details.html', siteUrl);
      articleUrl.searchParams.set('id', articleId);
      const timestamp = document.fields?.updatedAt?.timestampValue
        || document.fields?.createdAt?.timestampValue;
      const lastModified = timestamp
        ? `\n    <lastmod>${escapeXml(new Date(timestamp).toISOString())}</lastmod>`
        : '';
      urls.push(`  <url>\n    <loc>${escapeXml(articleUrl.href)}</loc>${lastModified}\n  </url>`);
    }

    pageToken = result.nextPageToken || '';
    pageCount += 1;
    if (pageCount > 100) throw new Error('Firestore article sitemap exceeded the pagination safety limit.');
  } while (pageToken);

  return [...new Set(urls)];
}

async function buildSitemap() {
  const staticEntries = staticPaths.map((pagePath) => (
    `  <url>\n    <loc>${escapeXml(new URL(pagePath, siteUrl).href)}</loc>\n  </url>`
  ));
  const articleEntries = await loadArticleUrls();
  const contents = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...articleEntries,
    '</urlset>',
    ''
  ].join('\n');

  fs.writeFileSync(sitemapPath, contents);
  console.log(`Generated sitemap with ${staticEntries.length} static pages and ${articleEntries.length} articles.`);
}

buildSitemap().catch((error) => {
  console.error('Could not generate sitemap:', error);
  process.exitCode = 1;
});
