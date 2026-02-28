# AuditLens - SEO Readiness Checker by Contentika

A free, client-side SEO auditing tool that scans any URL for 31+ technical, on-page, accessibility, and performance signals.

## File Structure

```
seo-checker/
|
|-- index.html              # Main HTML entry point
|
|-- css/
|   |-- styles.css          # All styles (tokens, layout, components, responsive)
|
|-- js/
|   |-- analyzers.js        # 31 individual SEO check functions (9 categories)
|   |-- scorer.js           # Score computation, grading, grouping utilities
|   |-- scanner.js          # Proxy-based URL fetcher + scan orchestrator
|   |-- renderer.js         # DOM rendering, animations, report builders
|   |-- history.js          # localStorage-based scan history manager
|   |-- app.js              # Main controller (event binding, routing, state)
|
|-- README.md               # This file
```

## VS Code Setup

1. Open VS Code
2. File > Open Folder > select `seo-checker/`
3. Install the "Live Server" extension (ritwickdey.liveserver)
4. Right-click `index.html` > "Open with Live Server"
5. The tool opens at `http://127.0.0.1:5500`

### Recommended VS Code Extensions
- **Live Server** - local dev server with hot reload
- **Prettier** - code formatting
- **ESLint** - JavaScript linting
- **CSS Peek** - jump to CSS definitions from HTML

## What Changed (Fixes & Improvements)

### Bug Fixes
- **Link analysis bug**: Protocol-relative URLs (`//example.com`) were incorrectly counted as internal links. Now properly categorised as external.
- **Em dashes/Unicode**: Replaced all em dashes, en dashes, curly quotes, and arrows with plain-text equivalents per brand guidelines.
- **Copyright year**: Updated from 2025 to 2026.
- **Mobile menu**: The hamburger menu button existed but had no functionality. Now opens a fully styled slide-in navigation overlay.
- **Missing aria-labels**: Added `aria-label` attributes to all interactive elements (inputs, buttons) for screen reader accessibility.
- **Missing meta tags**: Added `meta description`, `robots`, `canonical`, `og:*`, and `twitter:*` tags to the tool's own HTML.

### New Features
- **3 new accessibility checks** (31 total, up from 28):
  - ARIA Landmarks - checks for `<main>`, `<nav>`, `<header>`, `<footer>`
  - Form Labels - checks inputs for associated `<label>` or `aria-label`
  - Color Contrast (heuristic) - flags need for Lighthouse/axe audit
- **Scan history**: Recent scans saved to localStorage, shown on landing page with score indicators. Click to re-scan, remove individual items, or clear all.
- **JSON export**: Export audit results as structured JSON for integration with other tools or dashboards.
- **Share button**: Generates a shareable URL with `?scan=domain` parameter that auto-triggers a scan when visited.
- **Scroll-to-top button**: Appears on scroll in the results view for quick navigation back to the top.
- **Mobile navigation overlay**: Slide-in panel with all nav links and CTA for mobile users.
- **Success toast**: Green toast notification for successful actions (copy, share).

### Code Architecture
- **Separated concerns**: Single monolithic HTML split into 1 CSS + 6 JS modules.
- **Module loading order**: `analyzers > scorer > scanner > renderer > history > app` (dependency chain).
- **No build tools required**: Pure vanilla HTML/CSS/JS, no bundler needed.

## Deployment on GitHub Pages

### Option A: Push to GitHub and enable Pages

```bash
# Initialize git in the seo-checker folder
cd seo-checker
git init
git add .
git commit -m "Initial commit: AuditLens SEO Checker v2"

# Create a repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/seo-checker.git
git branch -M main
git push -u origin main
```

Then on GitHub:
1. Go to your repo Settings > Pages
2. Source: "Deploy from a branch"
3. Branch: `main` / folder: `/ (root)`
4. Save - your tool will be live at `https://YOUR_USERNAME.github.io/seo-checker/`

### Option B: Deploy to Contentika subdomain

Upload the entire `seo-checker/` folder to your web server at:
```
https://contentika.com/tools/seo-checker/
```

Make sure all file paths are relative (they already are in this build).

## Categories & Checks (31 total)

| Category            | Checks | What's Tested                                                |
|---------------------|--------|--------------------------------------------------------------|
| Meta Tags           | 8      | Title, description, viewport, canonical, robots, charset, lang, keywords |
| Open Graph          | 2      | OG tags completeness, OG image validation                    |
| Twitter Cards       | 1      | Card type, title, description, image                         |
| Content Structure   | 5      | H1, heading hierarchy, content length, links, readability    |
| Technical SEO       | 6      | HTTPS, schema, favicon, hreflang, theme-color, nofollow      |
| Image Optimization  | 2      | Alt text coverage, lazy loading / srcset                     |
| Performance         | 4      | Render-blocking scripts, CSS count, page size, preconnect    |
| Accessibility       | 3      | ARIA landmarks, form labels, color contrast heuristic        |

## License

Free tool by Contentika. All rights reserved.
