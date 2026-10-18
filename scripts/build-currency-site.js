const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const source = path.join(root, 'public');
const output = path.join(root, 'dist', 'currency');
const siteUrl = 'https://valyuta.islamicofficial.com';

function write(relativePath, contents) {
  const destination = path.join(output, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.writeFileSync(destination, contents);
}

function copy(relativePath) {
  const destination = path.join(output, relativePath);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(path.join(source, relativePath), destination);
}

let currencyPage = fs.readFileSync(path.join(source, 'currency.html'), 'utf8')
  .replaceAll('https://islamicofficial.com/currency.html', `${siteUrl}/`)
  .replace('href="currency.html"', 'href="index.html"')
  .replace('href="currency-privacy.html"', 'href="privacy.html"')
  .replace('class="currency-home-link" href="index.html"', 'class="currency-home-link" href="https://islamicofficial.com/"');

let privacyPage = fs.readFileSync(path.join(source, 'currency-privacy.html'), 'utf8')
  .replace('https://islamicofficial.com/currency-privacy.html', `${siteUrl}/privacy.html`)
  .replaceAll('href="currency.html"', 'href="index.html"');

write('index.html', currencyPage);
write('privacy.html', privacyPage);

[
  'assets/css/currency.css',
  'assets/js/currency.js',
  'assets/js/currency-account.js',
  'assets/vendor/bootstrap/css/bootstrap.min.css',
  'assets/vendor/bootstrap-icons/bootstrap-icons.css',
  'assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff',
  'assets/vendor/bootstrap-icons/fonts/bootstrap-icons.woff2',
  'assets/img/favicon.png',
  'ads.txt'
].forEach(copy);

write('robots.txt', `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n  <url><loc>${siteUrl}/</loc></url>\n  <url><loc>${siteUrl}/privacy.html</loc></url>\n</urlset>\n`);
