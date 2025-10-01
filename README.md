# SEO Analyzer Tools

**Professional SEO analysis right in your browser**

[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Firefox Add-on](https://img.shields.io/badge/Firefox-Add--on-orange.svg)](https://seedo.media/seo-analyzer-tools)

## Overview

SEO Analyzer Tools is a browser extension that provides professional-grade SEO insights instantly. Analyze any webpage to see meta tags, structured data schemas, and on-page SEO issues—without leaving the page you're viewing.

Perfect for SEO professionals, web developers, and digital marketers who need fast, accurate audits.

## Features

### Free (Forever)
- ✅ Real-time meta tag analysis (standard, Open Graph, Twitter/X)
- ✅ JSON-LD structured data parsing and display
- ✅ 11-point SEO health check with actionable recommendations
- ✅ On-Page SEO Score (0-100) with detailed breakdown
- ✅ Direct links to Google Rich Results Test and Schema.org validator
- ✅ Clean interface with Shadow DOM (no style conflicts)
- ✅ Unlimited page analysis with no rate limits
- ✅ Complete privacy - all analysis happens locally

### Premium ($1.99/month or $25 lifetime)
- 💎 Export to JSON (minified & pretty formats)
- 💎 Export to CSV for spreadsheet analysis
- 💎 Export to Text Report for client documentation
- 💎 Account dashboard with subscription management
- 💎 All exports include meta tags, schemas, issues, and timestamps

## Installation

### Firefox
Download from [Firefox Add-ons](https://seedo.media/seo-analyzer-tools) *(Coming soon)*

### Development Installation
1. Download the latest release from [Releases](https://github.com/SEEDO-Media-Ltd/seo-analyzer-tools/releases)
2. Extract the ZIP file
3. Open Firefox and navigate to `about:debugging`
4. Click "This Firefox" → "Load Temporary Add-on"
5. Select any file from the extracted folder

## Privacy

**Zero data collection.** All SEO analysis happens locally in your browser. We never see what pages you analyze or what you export.

## Browser Support

- ✅ Firefox (Manifest V3)
- ⏳ Chrome (Coming soon)
- ⏳ Edge (Coming soon)

## Development

### Project Structure
- `manifest.json` - Extension manifest (Manifest V3)
- `seo-analyzer.js` - Main content script with Shadow DOM UI
- `background.js` - Background script for ExtPay integration
- `ExtPay.js` - Payment processing library
- `icons/` - Extension icons

### Development Workflow
1. Edit source files in root folder
2. Copy changes to `/dist` folder for testing
3. Create .zip from `/dist` folder for distribution
4. Load unpacked extension from `/dist` in browser

See [CLAUDE.md](CLAUDE.md) for detailed development documentation.

## Tech Stack

- **Manifest V3** - Modern browser extension API
- **Shadow DOM** - Style isolation
- **ExtPay** - Payment processing for premium features
- **Vanilla JavaScript** - No framework dependencies

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

GPL-3.0 License - see [LICENSE](LICENSE) file for details.

Based on the excellent [SEO Analyzer by Slim SEO](https://github.com/elightup/seo-analyzer).

## Credits

- Original SEO Analyzer by [Slim SEO](https://github.com/elightup/seo-analyzer)
- Enhanced and maintained by [SEEDO Media Ltd](https://seedo.media)

## Links

- 🌐 [Website](https://seedo.media/seo-analyzer-tools)
- 📖 [Documentation](CLAUDE.md)
- 🐛 [Report Issues](https://github.com/SEEDO-Media-Ltd/seo-analyzer-tools/issues)
- 📝 [Changelog](CHANGELOG.md)

## Support

- Free users: [GitHub Issues](https://github.com/SEEDO-Media-Ltd/seo-analyzer-tools/issues)
- Premium users: Priority support via email

---

Made with ❤️ by [SEEDO Media](https://seedo.media)
