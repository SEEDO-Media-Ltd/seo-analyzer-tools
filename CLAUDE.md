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
- Extracts and displays meta tags (standard, Open Graph, Twitter/X)
- Parses and displays JSON-LD structured data schemas
- Includes built-in CSS using Tailwind-like utility classes
- Provides validation links to Google Rich Results Test and Schema.org validator

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
- Check Shadow DOM isolation is working (no style conflicts with host page)

## Extension Permissions
- `scripting` - Required for injecting content script
- `activeTab` - Required for accessing current tab content

## Technical Details
- Uses ES6+ JavaScript features (arrow functions, template literals, destructuring)
- Shadow DOM prevents CSS conflicts with host pages
- Responsive design with fixed 500px width panel
- Supports both array and single object JSON-LD schemas
- Handles nested schema graphs and arrays properly