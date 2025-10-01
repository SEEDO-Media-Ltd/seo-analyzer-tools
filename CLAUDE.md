# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Workflow

**IMPORTANT**: All development follows this workflow:
1. **Edit source files in ROOT folder** (manifest.json, seo-analyzer.js, background.js, etc.)
2. **Copy/compile changes to `/dist` folder** for testing
3. **Create .zip from `/dist` folder** for browser extension testing
4. **Load unpacked extension** from `/dist` folder in browser developer mode

The `/dist` folder contains the compiled/ready-to-test version of the extension. Always ensure changes are copied from root to `/dist` before testing.

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

### Monetization Exploration (ExtPay Integration)
- **ExtPay Library**: JavaScript library for browser extension monetization via ExtensionPay.com
- **Integration Requirements**: `storage` permission, background script initialization, user status checking
- **Potential Premium Features**:
  - **Advanced SEO Scoring**: More detailed analysis and recommendations
  - **Historical Tracking**: Save and compare SEO data over time for same URLs
  - **Bulk Export**: Export data from multiple pages/sessions
  - **Competitor Analysis**: Compare current page with competitor URLs
  - **Custom Reports**: Branded PDF reports with detailed insights
- **Pricing Strategy**: Free tier (basic features) + Premium tier ($2.99/month)
- **Implementation**: Check `extpay.getUser().paid` status to enable/disable premium features

## Development Structure
- `dist/` - Clean distribution folder (excluded from git)
- `seo-analyzer-tools-clean-v1.0.0.zip` - **WORKING BASELINE** - Extension with On-Page SEO Score, no ExtPay

## Development Notes & Debugging

### ExtPay Integration Progress
**Status**: ✅ **COMPLETED** - Real ExtPay.js integrated with background/content messaging

**Completed**:
- ✅ Added `storage` permission to manifest.json
- ✅ **Real ExtPay.js library** loaded from GitHub (52KB) replacing stub
- ✅ Background.js ExtPay initialization using `fetch() + eval()` (Firefox MV3 compatible)
- ✅ Browser messaging system for background ↔ content script communication
- ✅ Premium gating UI with upgrade prompt in main panel
- ✅ Dual pricing: $1.99/month (`seoa-tools-monthly`) + $25 lifetime (`seoa-tools-lifetime`)
- ✅ Feature description with external link to https://seedo.media/seo-analyzer-tools
- ✅ Inline styling for Shadow DOM compatibility
- ✅ Extension description updated with GPL-3.0 license and repository link

**Technical Implementation**:
- **Background Script**: Loads real ExtPay via `fetch(browser.runtime.getURL('ExtPay.js'))` + eval()
- **Message Handlers**: `checkPremiumAccess` and `openPaymentPage` actions
- **Content Script**: Uses `browser.runtime.sendMessage()` for ExtPay communication
- **Premium Logic**: `user.paid || user.trialStartedAt` determines access level
- **Error Handling**: Graceful fallback when ExtPay unavailable

**Ready for Testing**:
- Real ExtPay integration active with extension ID 'seo-analyzer-tools'
- Compatible with Firefox Manifest V3 architecture
- Test accounts from ExtensionPay.com dashboard should be detected
- Premium features (export dropdown) unlocked for paid/trial users

## Current Issues & Debugging (Latest Session)

### Account Tab DOM Insertion Error
**Status**: ✅ **RESOLVED** - Fixed in v20-v21

**Problem**: Account tab appearing after close button (X) instead of after Export tab.

**Root Cause**: Incorrect DOM element selection in `renderExportPane()` function (line 861):
```javascript
// INCORRECT (was selecting header instead of tabsContainer)
const tabsContainer = shadowRoot.querySelector('div').querySelector('div');
```

**Solution** (v20-v21):
- Fixed querySelector chain to correctly navigate: shadowRoot → #panel → header → tabsContainer
- Changed `addAccountTab()` to use simple `appendChild()` instead of complex `insertBefore()` logic
- Updated `removeAccountTab()` to use shadowRoot.querySelectorAll instead of document.querySelectorAll

**Final Implementation**:
```javascript
// seo-analyzer.js:861-863
const panel = shadowRoot.querySelector('#panel');
const header = panel.querySelector('div'); // First div in panel is header
const tabsContainer = header.querySelector('div'); // First div in header is tabsContainer
```

**Completed Fixes**:
- ✅ Account tab now appears in correct order: Meta Tags | Schemas | Issues | Export | Account
- ✅ Tab only appears for premium users (paid or trial)
- ✅ All Shadow DOM references corrected
- ✅ Tested and working in v21

### Export Tab Improvements
**Status**: ✅ **COMPLETED** - Export styling and structure fixed

**Completed**:
- ✅ Updated `createExportOptions()` function to match v15 with proper button structure
- ✅ Added missing CSS classes `.mb-0` and `.hover:opacity-80`
- ✅ Export tab now displays individual buttons instead of single dropdown
- ✅ Maintains premium gating functionality with ExtPay integration

**Current State**: Export functionality working correctly with improved UI matching v15 reference

## Latest Release

**Version**: v21 (seo-analyzer-tools-v21.zip)
**Status**: ✅ Production Ready
**Release Date**: October 1, 2025

**What's Working**:
- ✅ Full SEO analysis (meta tags, schemas, issues, scoring)
- ✅ ExtPay premium integration
- ✅ Export functionality (JSON, CSV, Text) behind paywall
- ✅ Account tab appearing correctly for premium users
- ✅ Clean tab ordering: Meta Tags | Schemas | Issues | Export | Account
- ✅ Shadow DOM isolation working properly
- ✅ All pricing tiers functional ($1.99/month, $25 lifetime)

**Known Limitations**:
- Firefox only (Chrome/Edge support planned)
- Export works one page at a time (bulk export planned)