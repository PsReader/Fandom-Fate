# Hosting and Google SEO Setup

## Upload

This is a no-build static site. Publish the contents of this folder so that `index.html` is at the public site root. Do not place the folder inside another nested folder unless your host is configured to serve that nested path.

Required runtime files:

- `index.html`
- `quiz-data.js`
- `app.js`
- `assets/brand-mark.svg`

The site has no package install, build command, database, API, login, or environment variable requirement.

## Already included

- Mobile-responsive HTML, CSS, and JavaScript.
- Keyboard focus states and reduced-motion handling.
- A visible unofficial fan-content disclaimer.
- Crawler-readable title, description, headings, and a no-JavaScript summary of the fandom topics.
- `robots.txt` allowing public crawling.
- Open Graph and Twitter Card title/description metadata.
- A custom SVG favicon.
- A `404.html` fallback for hosts that support custom not-found pages.

## Domain-specific SEO configuration
The configured public origin for this package is `https://fandomfate.site.je`. `index.html` includes the matching canonical URL and `og:url`; `sitemap.xml` lists the homepage; and `robots.txt` points crawlers to that sitemap. These absolute URLs assume the site will be published at this exact HTTPS origin.

## Google Search Console after hosting
After the site is reachable over HTTPS, add `https://fandomfate.site.je` as a property in [Google Search Console](https://search.google.com/search-console), complete the requested ownership verification (domain properties commonly require a DNS TXT record at your DNS provider), submit `https://fandomfate.site.je/sitemap.xml`, and request indexing for the homepage.

## Quick verification after publishing

```bash
curl -I https://fandomfate.site.je/
curl -s https://fandomfate.site.je/ | grep -E '<title>|meta name="description"|og:title'
curl -I https://fandomfate.site.je/robots.txt
curl -I https://fandomfate.site.je/sitemap.xml
```

The homepage should return `200`, `robots.txt` should return `200`, and the sitemap should return `200` after you create it. Test the quiz manually on desktop and mobile after upload.
