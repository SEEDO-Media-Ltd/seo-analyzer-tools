# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a browser extension called "SEO Analyzer by Slim SEO" that analyzes web pages for SEO-related information. The extension is built using Manifest V3 for modern browser compatibility.

## Architecture

### Core Files
- `manifest.json` - Browser extension manifest defining permissions, background scripts, and metadata
- `seo-analyzer.js` - Main content script that creates the analyzer UI and extracts SEO data
- `background.js` - Background script that handles extension icon clicks and script injection
- `icons/` - Directory containing extension icons in various sizes

### Key Components

**Content Script (`seo-analyzer.js`)**:
- Uses Shadow DOM for UI isolation to avoid conflicts with host page styles
- Creates a fixed-position panel on the right side of the page
- **Three-tab interface**: Meta Tags | Schemas | Issues | Export
- Extracts and displays meta tags (standard, Open Graph, Twitter/X)
- Parses and displays JSON-LD structured data schemas
- **Missing Elements Checker** - Analyzes 8 SEO criteria with actionable recommendations
- Includes built-in CSS using Tailwind-like utility classes
- Provides validation links to Google Rich Results Test and Schema.org validator
- **Export functionality** - Text link with dropdown (JSON, Pretty JSON, CSV, Text Report)
- Generates timestamped filenames: `seo-data-domain.com-2024-01-15-22:15:32.json`
- Uses blob download mechanism for client-side file generation

**Background Script (`background.js`)**:
- Minimal script that injects the content script when extension icon is clicked
- Uses `browser.scripting.executeScript()` for Manifest V3 compatibility

## Development

### Extension Loading
- Load as unpacked extension in browser developer mode
- Main entry point is clicking the extension icon which triggers `background.js`

### Testing
- Test by loading extension and clicking icon on any webpage
- Verify meta tags and schemas are correctly extracted and displayed
- **Test Issues tab** - Check that SEO issues are detected and categorized (errors vs warnings)
- Check Shadow DOM isolation is working (no style conflicts with host page)
- Test export functionality by clicking Export link and trying different formats
- **Verify issues in exports** - Ensure exported data includes SEO issues analysis
- Verify downloaded files contain correct data and have proper timestamps

## Extension Permissions
- `scripting` - Required for injecting content script
- `activeTab` - Required for accessing current tab content

## Technical Details
- Uses ES6+ JavaScript features (arrow functions, template literals, destructuring)
- Shadow DOM prevents CSS conflicts with host pages
- Responsive design with fixed 500px width panel
- Supports both array and single object JSON-LD schemas
- Handles nested schema graphs and arrays properly

### Missing Elements Checker
- **11 SEO Checks**: Title tag (presence/length), meta description (presence/length), H1 tags (single/multiple), canonical link, og:image, structured data, alt text, viewport tag
- **Issue Types**: Critical errors (❌) and warnings (⚠️) with specific recommendations
- **UI Design**: Consistent table-based layout with collapsible sections matching other tabs
- **Export Integration**: Issues data included in all export formats with structured categorization

### On-Page SEO Score (Planned Feature)
- **Scoring System**: 0-100 point scale based on on-page SEO elements only
- **Transparency**: Clear labeling as "On-Page SEO Score" with disclaimer about limitations
- **Scoring Criteria**:
  - **Critical Foundations (60 pts)**: Title tag (15), meta description (15), H1 tag (15), viewport tag (15)
  - **Content Quality (25 pts)**: Title length (5), meta description length (5), single H1 (5), image alt text (10)
  - **Advanced Optimization (15 pts)**: Canonical link (5), Open Graph image (5), structured data (5)
- **Score Ranges**: 90-100 (Excellent), 75-89 (Good), 60-74 (Average), 40-59 (Poor), 0-39 (Very Poor)
- **Disclaimer**: "Measures basic on-page SEO elements only. Does not include backlinks, site speed, or technical SEO."

### Export Implementation
- **Export formats**: JSON (minified), Pretty JSON (formatted), CSV (flattened), Text Report (readable)
- **File naming**: `seo-data-{domain}-{YYYY-MM-DD}-{HH:MM:SS}.{ext}`
- **Data structure**: Includes metaTags, schemas, issues, URL, and timestamp
- **Data flattening**: Nested objects converted to dot notation for CSV compatibility
- **UI Integration**: Text link with pipe separator for consistent navigation styling
- **Shadow DOM events**: Uses `shadowRoot.addEventListener()` for proper event handling
- **Download mechanism**: Creates temporary blob URLs and triggers downloads via hidden anchor elements

## Development Structure
- `dist/` - Clean distribution folder (excluded from git)
- `seo-analyzer-extension-v1.0.1.zip` - Packaged extension ready for browser stores