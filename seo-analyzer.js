( function () {
	// --- Configuration ---
	const ANALYZER_ID = 'sa';

	// --- Helper Functions ---
	function getMaxZIndex() {
		return Math.max(
			10000, // Start with a higher base z-index
			...Array.from( document.querySelectorAll( 'body *' ), el =>
				parseFloat( window.getComputedStyle( el ).zIndex ),
			).filter( zIndex => !isNaN( zIndex ) ),
		);
	}

	function getStyles() {
		return `.fixed{position:fixed}.absolute{position:absolute}.relative{position:relative}.right-0{right:0}.top-0{top:0}.mb-0{margin-bottom:0}.mb-2{margin-bottom:.5rem}.mb-4{margin-bottom:1rem}.mt-4{margin-top:1rem}.block{display:block}.flex{display:flex}.table{display:table}.hidden{display:none}.h-full{height:100%}.w-48{width:12rem}.w-full{width:100%}.flex-grow{flex-grow:1}.border-collapse{border-collapse:collapse}.cursor-pointer{cursor:pointer}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-between{justify-content:space-between}.justify-center{justify-content:center}.gap-1{gap:.25rem}.gap-4{gap:1rem}.overflow-y-auto{overflow-y:auto}.break-all{word-break:break-all}.rounded{border-radius:.25rem}.border{border-width:1px}.border-0{border-width:0}.border-b{border-bottom-width:1px}.border-l{border-left-width:1px}.border-solid{border-style:solid}.border-gray-300{--tw-border-opacity:1;border-color:rgb(209 213 219/var(--tw-border-opacity,1))}.bg-gray-50{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity,1))}.bg-gray-100{--tw-bg-opacity:1;background-color:rgb(243 244 246/var(--tw-bg-opacity,1))}.bg-accent{--tw-bg-opacity:1;background-color:rgb(239 122 55/var(--tw-bg-opacity,1))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.p-2{padding:.5rem}.p-4{padding:1rem}.px-1{padding-left:.25rem;padding-right:.25rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-4{padding-top:1rem;padding-bottom:1rem}.py-px{padding-top:1px;padding-bottom:1px}.pl-4{padding-left:1rem}.pl-8{padding-left:2rem}.pl-9{padding-left:2.25rem}.pl-12{padding-left:3rem}.pl-16{padding-left:4rem}.pl-20{padding-left:5rem}.pl-24{padding-left:6rem}.text-left{text-align:left}.text-center{text-align:center}.text-white{--tw-text-opacity:1;color:rgb(255 255 255/var(--tw-text-opacity,1))}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.text-lg{font-size:18px}.text-sm{font-size:14px}.font-bold{font-weight:700}.italic{font-style:italic}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.text-accent{--tw-text-opacity:1;color:rgb(239 122 55/var(--tw-text-opacity,1))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity,1))}.text-inherit{color:inherit}.shadow{--tw-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color)}.shadow,.shadow-xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.indent-4{text-indent:1rem}.indent-8{text-indent:2rem}.indent-12{text-indent:3rem}.indent-16{text-indent:4rem}.indent-20{text-indent:5rem}.indent-24{text-indent:6rem}.indent-28{text-indent:7rem}.indent-32{text-indent:8rem}.indent-36{text-indent:9rem}.indent-40{text-indent:10rem}.left-0{left:0}.left-4{left:1rem}.left-8{left:2rem}.left-12{left:3rem}.left-16{left:4rem}.left-20{left:5rem}.left-24{left:6rem}:host{--color-gray-300:#d1d5db}*{box-sizing:border-box;margin:0;padding:0}img{max-width:100%;height:auto}ul{list-stype:none}#panel{width:600px;max-width:95vw}details[open] summary{border-bottom:1px solid var(--color-gray-300)}tr:last-child{border-bottom:none}.hover\:text-accent:hover{--tw-text-opacity:1;color:rgb(239 122 55/var(--tw-text-opacity,1))}.hover\:bg-gray-50:hover{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity,1))}.hover\:opacity-80:hover{opacity:0.8}`;
	}

	const isPlainObject = obj => obj !== null && typeof obj === 'object' && Object.getPrototypeOf( obj ) === Object.prototype;

	// --- Premium/ExtPay Functions ---
	let premiumStatus = { hasPremium: false, user: null, checked: false };

	async function checkPremiumAccess() {
		if (premiumStatus.checked) {
			return premiumStatus;
		}

		try {
			const response = await browser.runtime.sendMessage({ action: 'checkPremiumAccess' });
			premiumStatus = { ...response, checked: true };
			return premiumStatus;
		} catch (error) {
			console.error('Failed to check premium access:', error);
			premiumStatus = { hasPremium: false, user: null, checked: true, error: error.message };
			return premiumStatus;
		}
	}

	function openPaymentPage() {
		browser.runtime.sendMessage({ action: 'openPaymentPage' });
	}

	function createPremiumUpgradePrompt() {
		const upgradeDiv = document.createElement('div');
		upgradeDiv.className = 'p-4 border border-solid border-gray-300 bg-gray-50 rounded';

		// Title
		const title = document.createElement('div');
		title.className = 'mb-4 font-bold text-lg';
		title.textContent = '🚀 Unlock Export Features';
		upgradeDiv.appendChild(title);

		// Description
		const description = document.createElement('div');
		description.className = 'mb-4 text-sm text-gray-700 text-left';
		description.innerHTML = '<p class="mb-2">Export your SEO data in multiple formats (JSON, CSV, Text Reports)</p><p class="mb-2"><strong>What\'s included:</strong></p><ul style="list-style: disc; padding-left: 2rem;"><li>Meta Tags (title, description, Open Graph, Twitter/X)</li><li>Schema.org structured data (JSON-LD)</li><li>Headings hierarchy (H1-H6 structure)</li><li>SEO Issues & Score analysis</li><li>Page URL & timestamp</li></ul>';
		upgradeDiv.appendChild(description);

		// Pricing
		const pricing = document.createElement('div');
		pricing.className = 'mb-4 text-sm text-gray-700';
		pricing.innerHTML = '<strong>$1.99/month</strong> or <strong>$25 lifetime</strong>';
		upgradeDiv.appendChild(pricing);

		// Button container
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'flex items-center gap-4';

		// Upgrade button
		const upgradeBtn = document.createElement('button');
		upgradeBtn.className = 'px-4 py-2 bg-accent text-white font-bold rounded cursor-pointer border-0';
		upgradeBtn.textContent = 'Upgrade Now';
		upgradeBtn.addEventListener('click', () => {
			openPaymentPage();
		});

		// Learn more link
		const learnMoreLink = document.createElement('a');
		learnMoreLink.href = 'https://seedo.media/seo-analyzer-tools';
		learnMoreLink.target = '_blank';
		learnMoreLink.className = 'text-sm text-gray-700';
		learnMoreLink.textContent = 'Learn More';

		buttonContainer.appendChild(upgradeBtn);
		buttonContainer.appendChild(learnMoreLink);
		upgradeDiv.appendChild(buttonContainer);

		return upgradeDiv;
	}


	// --- Data Fetching Functions ---
	function getMetaTags() {
		const standardTags = {};
		const ogTags = {};
		const twitterTags = {};
		const metaElements = document.head.querySelectorAll( 'meta' );

		const tagNames = new Set( [
			'description', 'keywords', 'robots', 'author', 'publisher', 'date', // Added date
			'googlebot', 'bingbot', // Specific bot instructions
			// Add others if needed, but keep it SEO focused
		] );

		// 1. Get Title
		const titleElement = document.head.querySelector( 'title' );
		if ( titleElement ) {
			standardTags.title = titleElement.textContent || '(empty)';
		}

		// 2. Process Meta Tags
		metaElements.forEach( tag => {
			const name = tag.getAttribute( 'name' );
			const property = tag.getAttribute( 'property' );
			const content = tag.getAttribute( 'content' );

			// Ignore tags without content
			if ( !content ) {
				return;
			}

			if ( property && property.startsWith( 'og:' ) ) {
				// Preview the image for og:image
				if ( property === 'og:image' ) {
					ogTags[ property ] = `<a href="${ content }" target="_blank" rel="noopener noreferrer">${ content }<br><br><img src="${ content }"></a>`;
				} else {
					ogTags[ property ] = content;
				}
			} else if ( name && name.startsWith( 'twitter:' ) ) {
				// Preview the image for twitter:image
				if ( name === 'twitter:image' ) {
					twitterTags[ name ] = `<a href="${ content }" target="_blank" rel="noopener noreferrer">${ content }<br><br><img src="${ content }"></a>`;
				} else {
					twitterTags[ name ] = content;
				}
			} else if ( name && tagNames.has( name ) ) {
				standardTags[ name ] = content;
			}
		} );

		// 3. Get Relevant Link Tags
		const linkTags = [];
		[ 'canonical', 'prev', 'next' ].forEach( rel => {
			const link = document.head.querySelector( `link[rel="${ rel }"]` );
			if ( link && link.href ) {
				standardTags[ rel ] = link.href;
			}
		} );

		return { standard: standardTags, openGraph: ogTags, twitter: twitterTags };
	}

	function getSchemas() {
		const schemas = [];
		const scripts = document.querySelectorAll( 'script[type="application/ld+json"]' );

		const addSchema = schema => {
			if ( typeof schema !== 'object' || schema === null ) {
				return;
			}
			if ( !schema[ '@type' ] ) {
				return;
			}

			schemas.push( schema );
		};

		scripts.forEach( script => {
			try {
				const jsonContent = JSON.parse( script.textContent );
				// If the content is an array of schemas, add each one individually
				if ( Array.isArray( jsonContent ) ) {
					jsonContent.forEach( addSchema );
				} else if ( typeof jsonContent === 'object' && jsonContent !== null ) {
					// Handle graph-wrapped schema
					if ( jsonContent[ '@graph' ] && Array.isArray( jsonContent[ '@graph' ] ) ) {
						jsonContent[ '@graph' ].forEach( addSchema );
					} else {
						// Handle single object schema
						addSchema( jsonContent );
					}
				}
			} catch ( e ) {}
		} );

		return schemas;
	}

	function getHeadings() {
		const headings = [];
		const headingElements = document.querySelectorAll( 'h1, h2, h3, h4, h5, h6' );

		headingElements.forEach( heading => {
			const level = parseInt( heading.tagName.charAt( 1 ) );
			const text = heading.textContent.trim();

			headings.push( { level, text, element: heading } );
		} );

		return headings;
	}

	function checkSEOIssues() {
		const issues = [];
		
		// Check title tag
		const title = document.querySelector('title');
		if (!title || !title.textContent.trim()) {
			issues.push({ type: 'error', category: 'Title', message: 'Missing title tag', fix: 'Add a <title> tag to your page' });
		} else {
			const titleLength = title.textContent.trim().length;
			if (titleLength < 30) {
				issues.push({ type: 'warning', category: 'Title', message: `Title too short (${titleLength} chars)`, fix: 'Title should be 30-60 characters long' });
			} else if (titleLength > 60) {
				issues.push({ type: 'warning', category: 'Title', message: `Title too long (${titleLength} chars)`, fix: 'Title should be 30-60 characters long' });
			}
		}
		
		// Check meta description
		const metaDesc = document.querySelector('meta[name="description"]');
		if (!metaDesc || !metaDesc.getAttribute('content')) {
			issues.push({ type: 'error', category: 'Meta Description', message: 'Missing meta description', fix: 'Add a meta description tag' });
		} else {
			const descLength = metaDesc.getAttribute('content').length;
			if (descLength < 120) {
				issues.push({ type: 'warning', category: 'Meta Description', message: `Description too short (${descLength} chars)`, fix: 'Meta description should be 120-160 characters' });
			} else if (descLength > 160) {
				issues.push({ type: 'warning', category: 'Meta Description', message: `Description too long (${descLength} chars)`, fix: 'Meta description should be 120-160 characters' });
			}
		}
		
		// Check H1 tags
		const h1Tags = document.querySelectorAll('h1');
		if (h1Tags.length === 0) {
			issues.push({ type: 'error', category: 'Headings', message: 'Missing H1 tag', fix: 'Add exactly one H1 tag to your page' });
		} else if (h1Tags.length > 1) {
			issues.push({ type: 'warning', category: 'Headings', message: `Multiple H1 tags found (${h1Tags.length})`, fix: 'Use only one H1 tag per page' });
		}
		
		// Check canonical link
		const canonical = document.querySelector('link[rel="canonical"]');
		if (!canonical) {
			issues.push({ type: 'warning', category: 'Canonical', message: 'Missing canonical link', fix: 'Add a canonical link to prevent duplicate content issues' });
		}
		
		// Check Open Graph image
		const ogImage = document.querySelector('meta[property="og:image"]');
		if (!ogImage || !ogImage.getAttribute('content')) {
			issues.push({ type: 'warning', category: 'Social Media', message: 'Missing Open Graph image', fix: 'Add og:image meta tag for better social media sharing' });
		}
		
		// Check if any schema markup exists
		const schemas = getSchemas();
		if (schemas.length === 0) {
			issues.push({ type: 'warning', category: 'Structured Data', message: 'No structured data found', fix: 'Add JSON-LD schema markup for better search visibility' });
		}
		
		// Check images without alt text
		const imagesWithoutAlt = document.querySelectorAll('img:not([alt]), img[alt=""]');
		if (imagesWithoutAlt.length > 0) {
			issues.push({ type: 'warning', category: 'Accessibility', message: `${imagesWithoutAlt.length} images without alt text`, fix: 'Add descriptive alt text to all images for accessibility' });
		}
		
		// Check for viewport meta tag (mobile-friendly)
		const viewport = document.querySelector('meta[name="viewport"]');
		if (!viewport) {
			issues.push({ type: 'warning', category: 'Mobile', message: 'Missing viewport meta tag', fix: 'Add viewport meta tag for mobile responsiveness' });
		}
		
		return issues;
	}

	function calculateOnPageSEOScore(issues) {
		let score = 100; // Start with perfect score and deduct points
		
		// Group issues by category for easier processing
		const issuesByCategory = {};
		issues.forEach(issue => {
			if (!issuesByCategory[issue.category]) {
				issuesByCategory[issue.category] = [];
			}
			issuesByCategory[issue.category].push(issue);
		});
		
		// Critical Foundations (60 points total)
		// Title tag (15 points)
		if (issuesByCategory['Title']) {
			const titleIssues = issuesByCategory['Title'];
			const hasMissingTitle = titleIssues.some(issue => issue.message.includes('Missing title'));
			const hasLengthIssue = titleIssues.some(issue => issue.message.includes('too short') || issue.message.includes('too long'));
			
			if (hasMissingTitle) {
				score -= 15; // Full deduction for missing title
			} else if (hasLengthIssue) {
				score -= 5; // Partial deduction for length issues
			}
		}
		
		// Meta description (15 points)
		if (issuesByCategory['Meta Description']) {
			const metaIssues = issuesByCategory['Meta Description'];
			const hasMissingMeta = metaIssues.some(issue => issue.message.includes('Missing meta description'));
			const hasLengthIssue = metaIssues.some(issue => issue.message.includes('too short') || issue.message.includes('too long'));
			
			if (hasMissingMeta) {
				score -= 15; // Full deduction for missing meta description
			} else if (hasLengthIssue) {
				score -= 5; // Partial deduction for length issues
			}
		}
		
		// H1 tag (15 points)
		if (issuesByCategory['Headings']) {
			const headingIssues = issuesByCategory['Headings'];
			const hasMissingH1 = headingIssues.some(issue => issue.message.includes('Missing H1'));
			const hasMultipleH1 = headingIssues.some(issue => issue.message.includes('Multiple H1'));
			
			if (hasMissingH1) {
				score -= 15; // Full deduction for missing H1
			} else if (hasMultipleH1) {
				score -= 5; // Partial deduction for multiple H1s
			}
		}
		
		// Viewport tag (15 points)
		if (issuesByCategory['Mobile']) {
			const mobileIssues = issuesByCategory['Mobile'];
			const hasMissingViewport = mobileIssues.some(issue => issue.message.includes('Missing viewport'));
			
			if (hasMissingViewport) {
				score -= 15; // Full deduction for missing viewport
			}
		}
		
		// Advanced Optimization (15 points total)
		// Canonical link (5 points)
		if (issuesByCategory['Canonical']) {
			score -= 5;
		}
		
		// Open Graph image (5 points)
		if (issuesByCategory['Social Media']) {
			score -= 5;
		}
		
		// Structured data (5 points)
		if (issuesByCategory['Structured Data']) {
			score -= 5;
		}
		
		// Content Quality (10 points remaining from 25 total - title/meta/h1 length already covered above)
		// Images alt text (10 points)
		if (issuesByCategory['Accessibility']) {
			const accessibilityIssues = issuesByCategory['Accessibility'];
			const hasAltTextIssues = accessibilityIssues.some(issue => issue.message.includes('without alt text'));
			
			if (hasAltTextIssues) {
				score -= 10; // Full deduction for missing alt text
			}
		}
		
		// Ensure score doesn't go below 0
		return Math.max(0, score);
	}


	// --- Rendering Functions ---
	function renderKeyValue( table, key, value, depth = 0, forceLink = false ) {
		let pairs = [];

		function parseKeyValue( key, value, depth = 0 ) {
			// If value is an array but has only one value, render it as a single value.
			if ( Array.isArray( value ) && value.length === 1 ) {
				value = value[ 0 ];
				parseKeyValue( key, value, depth );
				return;
			}

			// Check if this is an image field
			const isImageField = key && ( key === 'image' || key === 'logo' || key === 'thumbnail' || key === 'thumbnailUrl' || key === 'contentUrl' );

			// Special handling for ImageObject - if image field has object with url property, extract it
			if ( isImageField && isPlainObject( value ) && value.url ) {
				pairs.push( { key, value: value.url, depth, isImage: true } );
				return;
			}

			// Nested array.
			if ( Array.isArray( value ) ) {
				pairs.push( { key, value: '', depth } );
				value.forEach( subValue => parseKeyValue( '', subValue, depth + 1 ) );
			}
			// Nested object.
			else if ( isPlainObject( value ) ) {
				pairs.push( { key, value: '', depth } );
				Object.entries( value ).forEach( ( [ subKey, subValue ] ) => parseKeyValue( subKey, subValue, depth + 1 ) );
			} else {
				pairs.push( { key, value, depth } );
			}
		}

		parseKeyValue( key, value, depth );

		pairs.forEach( pair => {
			const { key, value, depth, isImage } = pair;

			// Ignore empty pairs.
			if ( !key && !value ) {
				return;
			}

			const tr = document.createElement( 'tr' );
			tr.className = 'border-0 border-b border-solid border-gray-300';

			const th = document.createElement( 'th' );
			// Indentation is handled by nesting tables or divs if needed, th styling is now simpler
			th.className = `text-left p-2 indent-${ depth * 4 } w-48`;
			th.textContent = key;

			const td = document.createElement( 'td' );
			td.className = 'p-2 break-all';

			// Check if this is an image field (common schema.org image properties)
			const isImageField = isImage || ( key && ( key === 'image' || key === 'logo' || key === 'thumbnail' || key === 'thumbnailUrl' || key === 'contentUrl' ) );

			if ( typeof value === 'string' && ( value.startsWith( 'http://' ) || value.startsWith( 'https://' ) ) && forceLink ) {
				// If it's an image field and a URL, show preview
				if ( isImageField ) {
					const a = document.createElement( 'a' );
				a.href = value;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				a.textContent = value;
				td.appendChild( a );
				td.appendChild( document.createElement( 'br' ) );
				td.appendChild( document.createElement( 'br' ) );
				const img = document.createElement( 'img' );
				img.src = value;
				td.appendChild( img );
				} else {
					const a = document.createElement( 'a' );
					a.href = value;
					a.target = '_blank';
					a.rel = 'noopener noreferrer';
					a.textContent = value;
					td.appendChild( a );
				}
			} else {
				td.textContent = String( value );
			}

			tr.appendChild( th );
			tr.appendChild( td );
			table.appendChild( tr );
		} );
	}

	function renderMetaTags( container, tagData ) {
		container.innerHTML = '';

		// Render standard tags (Title, Description first)
		if ( tagData.standard ) {
			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			Object.entries( tagData.standard ).forEach( ( [ key, value ] ) => {
				renderKeyValue( table, key, value, 0, true );
			} );
			container.appendChild( table );
		} else {
			const p = document.createElement( 'p' );
			p.textContent = "No meta tags found.";
			container.appendChild( p );
		}

		// Render Open Graph tags in a collapsible section
		if ( tagData.openGraph ) {
			const details = document.createElement( 'details' );
			details.className = 'mt-4 border border-solid border-gray-300 rounded';

			const summary = document.createElement( 'summary' );
			summary.className = 'font-bold cursor-pointer py-2 px-3 bg-gray-50 rounded';
			summary.textContent = `Open Graph Tags (${ Object.keys( tagData.openGraph ).length })`;
			details.appendChild( summary );

			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			Object.entries( tagData.openGraph ).forEach( ( [ key, value ] ) => {
				renderKeyValue( table, key, value, 0, true );
			} );

			details.appendChild( table );
			container.appendChild( details );
		}

		// Render Twitter tags in a collapsible section
		if ( tagData.twitter ) {
			const details = document.createElement( 'details' );
			details.className = 'mt-4 border border-solid border-gray-300 rounded';

			const summary = document.createElement( 'summary' );
			summary.className = 'font-bold cursor-pointer py-2 px-3 bg-gray-50 rounded';
			summary.textContent = `Twitter / X Tags (${ Object.keys( tagData.twitter ).length })`; // Updated label
			details.appendChild( summary );

			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			Object.entries( tagData.twitter ).forEach( ( [ key, value ] ) => {
				renderKeyValue( table, key, value, 0, true );
			} );

			details.appendChild( table );
			container.appendChild( details );
		}
	}

	function renderSchemas( container, schemas ) {
		if ( !schemas || schemas.length === 0 ) {
			container.innerHTML = `<p class="italic text-muted">No schemas found.</p>`;
		}

		const pageUrl = window.location.href;
		const encodedUrl = encodeURIComponent( pageUrl );

		container.innerHTML = '';

		// Add validator links at the top
		const validatorLinksDiv = document.createElement( 'div' );
		validatorLinksDiv.className = 'mb-4 flex items-center gap-4';
		// Build validator links with DOM methods (safer than innerHTML)
		const validateLabel = document.createElement('strong');
		validateLabel.textContent = 'Validate:';
		validatorLinksDiv.appendChild(validateLabel);

		// Google Rich Results link
		const googleLink = document.createElement('a');
		googleLink.className = 'flex items-center gap-1';
		googleLink.href = `https://search.google.com/test/rich-results?url=${encodedUrl}`;
		googleLink.target = '_blank';
		googleLink.rel = 'noopener noreferrer';
		googleLink.textContent = 'Google Rich Results';
		validatorLinksDiv.appendChild(googleLink);

		// Schema.org link
		const schemaLink = document.createElement('a');
		schemaLink.className = 'flex items-center gap-1';
		schemaLink.href = `https://validator.schema.org/#url=${encodedUrl}`;
		schemaLink.target = '_blank';
		schemaLink.rel = 'noopener noreferrer';
		schemaLink.textContent = 'Schema.org';
		validatorLinksDiv.appendChild(schemaLink);
		container.appendChild( validatorLinksDiv );

		schemas.forEach( schema => {
			// Collapsible element for each schema.
			const details = document.createElement( 'details' );
			details.className = 'mt-4 border border-solid border-gray-300 rounded';

			const summary = document.createElement( 'summary' );
			summary.className = 'font-bold cursor-pointer py-2 px-3 bg-gray-50 rounded';

			let schemaType = '(Unknown Type)';
			if ( schema && schema[ '@type' ] ) {
				schemaType = Array.isArray( schema[ '@type' ] ) ? schema[ '@type' ].join( ', ' ) : schema[ '@type' ];
			}
			summary.textContent = schemaType;
			details.appendChild( summary );

			// Render the actual schema object node
			delete schema[ '@type' ];
			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			Object.entries( schema ).forEach( ( [ key, value ] ) => {
				renderKeyValue( table, key, value, 0, true );
			} );

			details.appendChild( table );
			container.appendChild( details );
		} );
	}

	function renderHeadings( container, headings ) {
		if ( !headings || headings.length === 0 ) {
			container.innerHTML = `<p class="italic text-muted">No headings found.</p>`;
			return;
		}

		container.innerHTML = '';

		const table = document.createElement( 'table' );
		table.className = 'border-collapse w-full';

		headings.forEach( heading => {
			const tr = document.createElement( 'tr' );
			tr.className = 'border-0 border-b border-solid border-gray-300';

			const td = document.createElement( 'td' );
			td.className = `text-left relative py-2 pl-${ ( heading.level - 1 ) * 4 } cursor-pointer`;

			const div = document.createElement( 'div' );
			div.className = 'pl-9';

			const badge = document.createElement( 'span' );
			badge.className = `font-bold px-1 py-px bg-gray-100 rounded absolute left-${ ( heading.level - 1 ) * 4 }`;
			badge.textContent = `H${ heading.level }`;

			div.appendChild( badge );
			div.appendChild( document.createTextNode( heading.text ) );
			td.appendChild( div );
			td.title = 'Scroll to this heading';

			td.addEventListener( 'click', () => {
			// Scroll to element
			heading.element.scrollIntoView( { behavior: 'smooth', block: 'center' } );

			// Add highlight effect
			const originalOutline = heading.element.style.outline;
			const originalBackgroundColor = heading.element.style.backgroundColor;
			heading.element.style.outline = '3px solid #EF7A37';
			heading.element.style.backgroundColor = 'rgba(239, 122, 55, 0.1)';

			// Remove highlight after 2 seconds
			setTimeout( () => {
				heading.element.style.outline = originalOutline;
				heading.element.style.backgroundColor = originalBackgroundColor;
			}, 2000 );
		} );

			tr.appendChild( td );
			table.appendChild( tr );
		} );

		container.appendChild( table );
	}

	function renderIssues( container, issues ) {
		container.innerHTML = '';
		
		if ( !issues || issues.length === 0 ) {
			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			const tr = document.createElement( 'tr' );
			tr.className = 'border-0 border-b border-solid border-gray-300';
			
			const th = document.createElement( 'th' );
			th.className = 'text-left p-2 w-48';
			th.textContent = 'Status';
			
			const td = document.createElement( 'td' );
			td.className = 'p-2';
			td.innerHTML = '✅ No major SEO issues found!';
			
			tr.appendChild( th );
			tr.appendChild( td );
			table.appendChild( tr );
			container.appendChild( table );
			return;
		}
		
		// Group issues by type
		const errors = issues.filter( issue => issue.type === 'error' );
		const warnings = issues.filter( issue => issue.type === 'warning' );
		
		// Summary table
		const summaryTable = document.createElement( 'table' );
		summaryTable.className = 'border-collapse w-full mb-4';
		
		const summaryTr = document.createElement( 'tr' );
		summaryTr.className = 'border-0 border-b border-solid border-gray-300';
		
		const summaryTh = document.createElement( 'th' );
		summaryTh.className = 'text-left p-2 w-48';
		summaryTh.textContent = 'Summary';
		
		const summaryTd = document.createElement( 'td' );
		summaryTd.className = 'p-2';
		summaryTd.textContent = `❌ ${errors.length} Critical Issues, ⚠️ ${warnings.length} Warnings`;
		
		summaryTr.appendChild( summaryTh );
		summaryTr.appendChild( summaryTd );
		summaryTable.appendChild( summaryTr );
		
		// Calculate and display On-Page SEO Score
		const score = calculateOnPageSEOScore(issues);
		const scoreRow = document.createElement( 'tr' );
		scoreRow.className = 'border-0 border-b border-solid border-gray-300';
		
		const scoreTh = document.createElement( 'th' );
		scoreTh.className = 'text-left p-2 w-48';
		scoreTh.textContent = 'On-Page SEO Score';
		
		const scoreTd = document.createElement( 'td' );
		scoreTd.className = 'p-2';
		
		let scoreColor = '#10b981'; // green
		let scoreLabel = 'Excellent';
		if (score < 90) { scoreColor = '#f59e0b'; scoreLabel = 'Good'; }
		if (score < 75) { scoreColor = '#f97316'; scoreLabel = 'Average'; }
		if (score < 60) { scoreColor = '#ef4444'; scoreLabel = 'Poor'; }
		if (score < 40) { scoreColor = '#dc2626'; scoreLabel = 'Very Poor'; }
		
		// Create score display with DOM methods instead of innerHTML
		const scoreStrong = document.createElement('strong');
		scoreStrong.style.color = scoreColor;
		scoreStrong.style.fontSize = '18px';
		scoreStrong.textContent = `${score}/100`;

		const scoreSpan = document.createElement('span');
		scoreSpan.style.color = scoreColor;
		scoreSpan.textContent = ` (${scoreLabel})`;

		const lineBreak = document.createElement('br');

		const disclaimer = document.createElement('small');
		disclaimer.style.color = '#6b7280';
		disclaimer.style.fontStyle = 'italic';
		disclaimer.textContent = 'Measures basic on-page SEO elements only. Does not include backlinks, site speed, or technical SEO.';

		scoreTd.appendChild(scoreStrong);
		scoreTd.appendChild(scoreSpan);
		scoreTd.appendChild(lineBreak);
		scoreTd.appendChild(disclaimer);
		
		scoreRow.appendChild( scoreTh );
		scoreRow.appendChild( scoreTd );
		summaryTable.appendChild( scoreRow );
		container.appendChild( summaryTable );
		
		// Render critical issues in collapsible section
		if ( errors.length > 0 ) {
			const details = document.createElement( 'details' );
			details.className = 'mt-4 border border-solid border-gray-300 rounded';
			details.open = true; // Open by default for critical issues
			
			const summary = document.createElement( 'summary' );
			summary.className = 'font-bold cursor-pointer py-2 px-3 bg-gray-50 rounded';
			summary.textContent = `❌ Critical Issues (${ errors.length })`;
			details.appendChild( summary );
			
			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			
			errors.forEach( issue => {
				// Category row
				const categoryTr = document.createElement( 'tr' );
				categoryTr.className = 'border-0 border-b border-solid border-gray-300';
				
				const categoryTh = document.createElement( 'th' );
				categoryTh.className = 'text-left p-2 w-48 font-bold';
				categoryTh.textContent = issue.category;
				
				const categoryTd = document.createElement( 'td' );
				categoryTd.className = 'p-2';
				categoryTd.textContent = issue.message;
				
				categoryTr.appendChild( categoryTh );
				categoryTr.appendChild( categoryTd );
				table.appendChild( categoryTr );
				
				// Fix row
				const fixTr = document.createElement( 'tr' );
				fixTr.className = 'border-0 border-b border-solid border-gray-300';
				
				const fixTh = document.createElement( 'th' );
				fixTh.className = 'text-left p-2 w-48 text-gray-600 font-normal italic indent-4';
				fixTh.textContent = 'Fix';
				
				const fixTd = document.createElement( 'td' );
				fixTd.className = 'p-2 text-gray-600 italic';
				fixTd.textContent = issue.fix;
				
				fixTr.appendChild( fixTh );
				fixTr.appendChild( fixTd );
				table.appendChild( fixTr );
			} );
			
			details.appendChild( table );
			container.appendChild( details );
		}
		
		// Render warnings in collapsible section
		if ( warnings.length > 0 ) {
			const details = document.createElement( 'details' );
			details.className = 'mt-4 border border-solid border-gray-300 rounded';
			
			const summary = document.createElement( 'summary' );
			summary.className = 'font-bold cursor-pointer py-2 px-3 bg-gray-50 rounded';
			summary.textContent = `⚠️ Warnings (${ warnings.length })`;
			details.appendChild( summary );
			
			const table = document.createElement( 'table' );
			table.className = 'border-collapse w-full';
			
			warnings.forEach( issue => {
				// Category row
				const categoryTr = document.createElement( 'tr' );
				categoryTr.className = 'border-0 border-b border-solid border-gray-300';
				
				const categoryTh = document.createElement( 'th' );
				categoryTh.className = 'text-left p-2 w-48 font-bold';
				categoryTh.textContent = issue.category;
				
				const categoryTd = document.createElement( 'td' );
				categoryTd.className = 'p-2';
				categoryTd.textContent = issue.message;
				
				categoryTr.appendChild( categoryTh );
				categoryTr.appendChild( categoryTd );
				table.appendChild( categoryTr );
				
				// Fix row
				const fixTr = document.createElement( 'tr' );
				fixTr.className = 'border-0 border-b border-solid border-gray-300';
				
				const fixTh = document.createElement( 'th' );
				fixTh.className = 'text-left p-2 w-48 text-gray-600 font-normal italic indent-4';
				fixTh.textContent = 'Fix';
				
				const fixTd = document.createElement( 'td' );
				fixTd.className = 'p-2 text-gray-600 italic';
				fixTd.textContent = issue.fix;
				
				fixTr.appendChild( fixTh );
				fixTr.appendChild( fixTd );
				table.appendChild( fixTr );
			} );
			
			details.appendChild( table );
			container.appendChild( details );
		}
	}

	// --- UI Creation and Event Handling (using Shadow DOM) ---
	function createAnalyzerUI( zIndex ) {
		// Create the host element
		const host = document.createElement( 'div' );
		host.id = `${ ANALYZER_ID }-host`; // Unique ID for the host in the main DOM
		host.setAttribute('data-sa-analyzer', 'host'); // Add data attribute for shadowRoot access
		host.style.position = 'fixed'; // Position host relative to viewport
		host.style.top = '0';
		host.style.right = '0';
		host.style.width = '0'; // Occupy no space initially
		host.style.height = '0';
		host.style.zIndex = zIndex.toString(); // Control stacking context via host
		host.style.display = 'block'; // Host is always 'block' or 'none'

		// Attach the shadow root
		const shadowRoot = host.attachShadow( { mode: 'open' } );

		// Inject styles into Shadow DOM
		const styleElement = document.createElement( 'style' );
		styleElement.textContent = getStyles();
		shadowRoot.appendChild( styleElement );

		// --- Create Panel (inside Shadow DOM) ---
		const panel = document.createElement( 'div' );
		panel.className = 'fixed text-sm leading-relaxed text-gray-700 font-sans top-0 right-0 h-full border-0 border-l border-gray-300 bg-white shadow-xl flex flex-col';
		panel.id = 'panel'; // Use simple ID within Shadow DOM

		const header = document.createElement( 'div' );
		header.className = 'flex items-center justify-between px-4 border-0 border-b border-solid border-gray-300';

		const tabsContainer = document.createElement( 'div' );
		tabsContainer.className = 'flex gap-4';

		const metaTab = document.createElement( 'button' );
		metaTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-accent hover:text-accent';
		metaTab.dataset.tab = 'meta-tags';
		metaTab.textContent = 'Meta Tags';

		const schemaTab = document.createElement( 'button' );
		schemaTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		schemaTab.dataset.tab = 'schemas';
		schemaTab.textContent = 'Schemas';

		const headingsTab = document.createElement( 'button' );
		headingsTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		headingsTab.dataset.tab = 'headings';
		headingsTab.textContent = 'Headings';

		const issuesTab = document.createElement( 'button' );
		issuesTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		issuesTab.dataset.tab = 'issues';
		issuesTab.textContent = 'Issues';

		// Add pipe separator and export link
		const pipeSeparator = document.createElement( 'span' );
		pipeSeparator.className = 'py-4 text-gray-700';
		pipeSeparator.textContent = ' | ';

		// Export functionality - make it a proper tab like others
		const exportTab = document.createElement( 'button' );
		exportTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		exportTab.dataset.tab = 'export';
		exportTab.textContent = 'Export';
		exportTab.title = 'Export SEO data';
		console.log('Export tab created:', exportTab);

		tabsContainer.appendChild( metaTab );
		tabsContainer.appendChild( schemaTab );
		tabsContainer.appendChild( headingsTab );
		tabsContainer.appendChild( issuesTab );
		tabsContainer.appendChild( pipeSeparator );
		tabsContainer.appendChild( exportTab );

		// Account tab (will be added dynamically for premium users)
		let accountTab = null;
		let accountPane = null;

		const closeButton = document.createElement( 'button' );
		closeButton.className = 'bg-transparent border-0 cursor-pointer p-2 text-inherit text-lg leading-none';
		closeButton.innerHTML = '&times;';
		closeButton.title = 'Close Analyzer';
		closeButton.addEventListener( 'click', () => panel.classList.add( 'hidden' ) );

		// Tab panes
		const metaTagsPane = document.createElement( 'div' );
		metaTagsPane.dataset.tab = 'meta-tags';
		metaTagsPane.className = 'pane flex-grow overflow-y-auto p-4';
		metaTagsPane.innerHTML = `<em class="text-muted">Loading Meta Tags...</em>`;

		const schemasPane = document.createElement( 'div' );
		schemasPane.dataset.tab = 'schemas';
		schemasPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		schemasPane.innerHTML = `<em class="text-muted">Loading Schema Data...</em>`;

		const headingsPane = document.createElement( 'div' );
		headingsPane.dataset.tab = 'headings';
		headingsPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		headingsPane.innerHTML = `<em class="text-muted">Loading Headings...</em>`;

		const issuesPane = document.createElement( 'div' );
		issuesPane.dataset.tab = 'issues';
		issuesPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		issuesPane.innerHTML = `<em class="text-muted">Analyzing SEO Issues...</em>`;

		const exportPane = document.createElement( 'div' );
		exportPane.dataset.tab = 'export';
		exportPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		exportPane.innerHTML = `<em class="text-muted">Loading Export Options...</em>`;

		// Assemble Panel
		header.appendChild( tabsContainer );
		header.appendChild( closeButton );
		panel.appendChild( header );
		panel.appendChild( metaTagsPane );
		panel.appendChild( schemasPane );
		panel.appendChild( headingsPane );
		panel.appendChild( issuesPane );
		panel.appendChild( exportPane );
		shadowRoot.appendChild( panel );

		// Render initial content.
		renderMetaTags( metaTagsPane, getMetaTags() );
		renderSchemas( schemasPane, getSchemas() );
		renderHeadings( headingsPane, getHeadings() );
		renderIssues( issuesPane, checkSEOIssues() );

		// Append the host to the document body
		document.body.appendChild( host );

		// Tab switching logic
		[ metaTab, schemaTab, headingsTab, issuesTab, exportTab ].forEach( tab => tab.addEventListener( 'click', async () => {
			shadowRoot.querySelectorAll( '.tab' ).forEach( t => {
				t.classList.remove( 'text-accent' );
				t.classList.add( 'text-gray-700' );
			} );
			tab.classList.remove( 'text-gray-700' );
			tab.classList.add( 'text-accent' );

			shadowRoot.querySelectorAll( '.pane' ).forEach( p => p.classList.add( 'hidden' ) );

			// Special handling for Export tab
			if (tab.dataset.tab === 'export') {
				await renderExportPane(exportPane);
			}

			shadowRoot.querySelector( `.pane[data-tab=${ tab.dataset.tab }]` ).classList.remove( 'hidden' );
		} ) );
	}

	// --- Export Pane Rendering ---
	async function renderExportPane(container) {
		console.log('renderExportPane called');
		try {
			const premium = await checkPremiumAccess();
			console.log('Premium status for export pane:', premium);

			if (!premium.hasPremium) {
				// Show upgrade prompt for free users
				container.innerHTML = '';
				const upgradeContent = createPremiumUpgradePrompt();
				container.appendChild(upgradeContent);
			} else {
				// Show export options for premium users
				container.innerHTML = '';
				const exportOptionsDiv = createExportOptions();
				container.appendChild(exportOptionsDiv);

				// Add Account tab for premium users if not already added
				if (premium.user && !dynamicAccountTab) {
					const shadowRoot = document.querySelector('[data-sa-analyzer]').shadowRoot;
					const panel = shadowRoot.querySelector('#panel');
					const header = panel.querySelector('div'); // First div in panel is header
					const tabsContainer = header.querySelector('div'); // First div in header is tabsContainer
					// Note: setupTabSwitching is not available in this scope, so passing null
					addAccountTab(premium.user, tabsContainer, panel, null);
				}
			}
		} catch (error) {
			console.error('Error in renderExportPane:', error);
			container.innerHTML = '<p>Error loading export options.</p>';
		}
	}

	function createExportOptions() {
		const optionsDiv = document.createElement('div');

		// Title
		const title = document.createElement('h3');
		title.className = 'text-lg font-bold mb-4';
		title.textContent = 'Export SEO Data';
		optionsDiv.appendChild(title);

		// Description and info container
		const descriptionContainer = document.createElement('div');
		descriptionContainer.className = 'p-4 border border-solid border-gray-300 bg-gray-50 rounded mb-4';

		const description = document.createElement('p');
		description.className = 'text-gray-700 mb-4';
		description.textContent = 'Transform your SEO analysis into actionable insights with our comprehensive export options. Each format is optimized for different use cases:';
		descriptionContainer.appendChild(description);

		const infoNote = document.createElement('p');
		infoNote.className = 'text-sm text-gray-700 mb-0';
		infoNote.innerHTML = '<strong>All exports include:</strong> Meta tags, structured data schemas, SEO issues analysis, and timestamp information.';
		descriptionContainer.appendChild(infoNote);

		optionsDiv.appendChild(descriptionContainer);

		const exportOptions = [
			{
				label: 'JSON (Minified)',
				format: 'json',
				description: 'Perfect for developers and API integration. Compact format ideal for automated processing and data pipelines.'
			},
			{
				label: 'Pretty JSON',
				format: 'pretty-json',
				description: 'Human-readable format with proper indentation. Great for manual review, debugging, and sharing with technical teams.'
			},
			{
				label: 'CSV Spreadsheet',
				format: 'csv',
				description: 'Import directly into Excel, Google Sheets, or data analysis tools. Flattened structure makes it easy to create charts and pivot tables.'
			},
			{
				label: 'Text Report',
				format: 'text',
				description: 'Professional, readable format perfect for client reports, documentation, and non-technical stakeholders.'
			}
		];

		exportOptions.forEach(option => {
			const optionDiv = document.createElement('div');
			optionDiv.className = 'p-4 border border-solid border-gray-300 rounded mb-4';

			const labelDiv = document.createElement('div');
			labelDiv.className = 'font-bold mb-2';
			labelDiv.textContent = option.label;

			const descDiv = document.createElement('div');
			descDiv.className = 'text-sm text-gray-700 mb-4';
			descDiv.textContent = option.description;

			// Add export button
			const exportButton = document.createElement('button');
			exportButton.className = 'px-4 py-2 bg-accent text-white font-bold rounded cursor-pointer border-0 transition-all hover:opacity-80';
			exportButton.textContent = `Export ${option.label}`;
			exportButton.addEventListener('click', () => {
				exportData(option.format);
			});

			optionDiv.appendChild(labelDiv);
			optionDiv.appendChild(descDiv);
			optionDiv.appendChild(exportButton);

			optionsDiv.appendChild(optionDiv);
		});

		return optionsDiv;
	}

	function createAccountContent(user) {
		const accountDiv = document.createElement('div');

		// Title
		const title = document.createElement('h3');
		title.className = 'text-lg font-bold mb-4';
		title.textContent = 'Account Information';
		accountDiv.appendChild(title);

		// Thank you message
		const thankYou = document.createElement('div');
		thankYou.className = 'p-4 border border-solid border-gray-300 bg-gray-50 rounded mb-4';
		thankYou.innerHTML = `
			<div class="font-bold mb-2">✨ Thank you for supporting SEO Analyzer Tools!</div>
			<div class="text-sm text-gray-700">Your subscription helps us continue improving and adding new features.</div>
		`;
		accountDiv.appendChild(thankYou);

		// Account details table
		const table = document.createElement('table');
		table.className = 'border-collapse w-full mb-4';

		const details = [
			{ label: 'Email', value: user.email || 'Not provided' },
			{ label: 'Account Status', value: user.paid ? '✅ Premium' : '⚠️ Free' },
			{ label: 'Member Since', value: user.installedAt ? new Date(user.installedAt).toLocaleDateString() : 'Unknown' }
		];

		if (user.paidAt) {
			details.push({ label: 'Premium Since', value: new Date(user.paidAt).toLocaleDateString() });
		}

		details.forEach(detail => {
			const tr = document.createElement('tr');
			tr.className = 'border-0 border-b border-solid border-gray-300';

			const th = document.createElement('th');
			th.className = 'text-left p-2 w-48';
			th.textContent = detail.label;

			const td = document.createElement('td');
			td.className = 'p-2';
			td.textContent = detail.value;

			tr.appendChild(th);
			tr.appendChild(td);
			table.appendChild(tr);
		});

		accountDiv.appendChild(table);

		// Action buttons
		const buttonContainer = document.createElement('div');
		buttonContainer.className = 'flex gap-4 mb-4';

		// Manage Account button
		const manageBtn = document.createElement('button');
		manageBtn.className = 'px-4 py-2 bg-accent text-white font-bold rounded cursor-pointer border-0';
		manageBtn.textContent = 'Manage Account';
		manageBtn.addEventListener('click', () => {
			browser.runtime.sendMessage({ action: 'openPaymentPage' });
		});

		// Logout button
		const logoutBtn = document.createElement('button');
		logoutBtn.className = 'px-4 py-2 border border-solid border-gray-300 text-gray-700 font-bold rounded cursor-pointer bg-white';
		logoutBtn.textContent = 'Logout';
		logoutBtn.addEventListener('click', () => {
			// Clear ExtPay cache
			premiumStatus = { hasPremium: false, user: null, checked: false };
			// Hide account tab and refresh UI
			removeAccountTab();
		});

		buttonContainer.appendChild(manageBtn);
		buttonContainer.appendChild(logoutBtn);
		accountDiv.appendChild(buttonContainer);

		return accountDiv;
	}

	// Global variables to track dynamic elements
	let dynamicAccountTab = null;
	let dynamicAccountPane = null;
	let currentTabsContainer = null;
	let currentPanel = null;

	function addAccountTab(user, tabsContainer, panel, setupTabSwitching) {
		if (dynamicAccountTab) return; // Already added

		// Create account tab
		const accountPipeSeparator = document.createElement('span');
		accountPipeSeparator.className = 'py-4 text-gray-700';
		accountPipeSeparator.textContent = ' | ';
		accountPipeSeparator.setAttribute('data-account-element', 'true');

		dynamicAccountTab = document.createElement('button');
		dynamicAccountTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		dynamicAccountTab.dataset.tab = 'account';
		dynamicAccountTab.textContent = 'Account';
		dynamicAccountTab.title = 'Account information';
		dynamicAccountTab.setAttribute('data-account-element', 'true');

		// Create account pane
		dynamicAccountPane = document.createElement('div');
		dynamicAccountPane.dataset.tab = 'account';
		dynamicAccountPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		dynamicAccountPane.setAttribute('data-account-element', 'true');

		// Add Account tab to tabs container (after Export tab)
		tabsContainer.appendChild(accountPipeSeparator);
		tabsContainer.appendChild(dynamicAccountTab);
		panel.appendChild(dynamicAccountPane);

		// Store references
		currentTabsContainer = tabsContainer;
		currentPanel = panel;

		// Re-setup tab switching to include the new Account tab
		if (setupTabSwitching) {
			setupTabSwitching();
		} else {
			// Fallback: use the existing listener approach
			addAccountTabListener();
		}
	}

	function removeAccountTab() {
		// Remove all account-related elements from Shadow DOM
		const shadowRoot = document.querySelector('[data-sa-analyzer]').shadowRoot;
		if (shadowRoot) {
			const accountElements = shadowRoot.querySelectorAll('[data-account-element="true"]');
			accountElements.forEach(el => el.remove());
		}

		dynamicAccountTab = null;
		dynamicAccountPane = null;
	}

	function addAccountTabListener() {
		if (!dynamicAccountTab) return;

		dynamicAccountTab.addEventListener('click', async () => {
			const shadowRoot = document.querySelector('[data-sa-analyzer]').shadowRoot;

			// Update tab styles
			shadowRoot.querySelectorAll('.tab').forEach(t => {
				t.classList.remove('text-accent');
				t.classList.add('text-gray-700');
			});
			dynamicAccountTab.classList.remove('text-gray-700');
			dynamicAccountTab.classList.add('text-accent');

			// Hide all panes
			shadowRoot.querySelectorAll('.pane').forEach(p => p.classList.add('hidden'));

			// Render account content
			const premium = await checkPremiumAccess();
			if (premium.hasPremium && premium.user) {
				dynamicAccountPane.innerHTML = '';
				const accountContent = createAccountContent(premium.user);
				dynamicAccountPane.appendChild(accountContent);
			}

			// Show account pane
			dynamicAccountPane.classList.remove('hidden');
		});
	}

	// --- Export Functions ---
	function generateFilename( format ) {
		const now = new Date();
		const dateStr = now.getFullYear() + '-' + 
			String( now.getMonth() + 1 ).padStart( 2, '0' ) + '-' + 
			String( now.getDate() ).padStart( 2, '0' );
		const timeStr = String( now.getHours() ).padStart( 2, '0' ) + ':' + 
			String( now.getMinutes() ).padStart( 2, '0' ) + ':' + 
			String( now.getSeconds() ).padStart( 2, '0' );
		const domain = window.location.hostname || 'unknown';
		const extension = format === 'csv' ? 'csv' : format === 'text' ? 'txt' : 'json';
		
		return `seo-data-${ domain }-${ dateStr }-${ timeStr }.${ extension }`;
	}

	function downloadFile( content, filename, mimeType ) {
		const blob = new Blob( [ content ], { type: mimeType } );
		const url = URL.createObjectURL( blob );
		const a = document.createElement( 'a' );
		a.href = url;
		a.download = filename;
		a.style.display = 'none';
		document.body.appendChild( a );
		a.click();
		document.body.removeChild( a );
		URL.revokeObjectURL( url );
	}

	function flattenObject( obj, prefix = '', result = {} ) {
		for ( const key in obj ) {
			if ( obj.hasOwnProperty( key ) ) {
				const newKey = prefix ? `${ prefix }.${ key }` : key;
				if ( typeof obj[ key ] === 'object' && obj[ key ] !== null && !Array.isArray( obj[ key ] ) ) {
					flattenObject( obj[ key ], newKey, result );
				} else {
					result[ newKey ] = Array.isArray( obj[ key ] ) ? obj[ key ].join( '; ' ) : obj[ key ];
				}
			}
		}
		return result;
	}

	function exportToCSV( data ) {
		const rows = [];
		const headers = new Set();
		
		// Flatten all objects and collect headers
		const flatData = [];
		
		// Add meta tags
		if ( data.metaTags.standard ) {
			const flattened = flattenObject( data.metaTags.standard, 'meta' );
			flatData.push( { section: 'Standard Meta Tags', ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		}
		
		if ( data.metaTags.openGraph ) {
			const flattened = flattenObject( data.metaTags.openGraph, 'og' );
			flatData.push( { section: 'Open Graph Tags', ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		}
		
		if ( data.metaTags.twitter ) {
			const flattened = flattenObject( data.metaTags.twitter, 'twitter' );
			flatData.push( { section: 'Twitter Tags', ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		}
		
		// Add schemas
		data.schemas.forEach( ( schema, index ) => {
			const flattened = flattenObject( schema, `schema${ index + 1 }` );
			flatData.push( { section: `Schema ${ index + 1 } (${ schema[ '@type' ] || 'Unknown' })`, ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		} );

		// Add headings
		data.headings.forEach( ( heading, index ) => {
			const flattened = {
				[`heading${ index + 1 }.level`]: heading.level,
				[`heading${ index + 1 }.text`]: heading.text
			};
			flatData.push( { section: `Heading ${ index + 1 } (H${ heading.level })`, ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		} );

		// Add issues
		data.issues.forEach( ( issue, index ) => {
			const flattened = {
				[`issue${ index + 1 }.type`]: issue.type,
				[`issue${ index + 1 }.category`]: issue.category,
				[`issue${ index + 1 }.message`]: issue.message,
				[`issue${ index + 1 }.fix`]: issue.fix
			};
			flatData.push( { section: `Issue ${ index + 1 } (${ issue.type })`, ...flattened } );
			Object.keys( flattened ).forEach( key => headers.add( key ) );
		} );
		
		const allHeaders = [ 'section', ...Array.from( headers ).sort() ];
		rows.push( allHeaders.join( ',' ) );
		
		flatData.forEach( row => {
			const csvRow = allHeaders.map( header => {
				const value = row[ header ] || '';
				return `"${ String( value ).replace( /"/g, '""' ) }"`;
			} );
			rows.push( csvRow.join( ',' ) );
		} );
		
		return rows.join( '\n' );
	}

	function exportToText( data ) {
		const lines = [];
		lines.push( `SEO Analysis Report - ${ window.location.href }` );
		lines.push( `Generated: ${ new Date().toLocaleString() }` );
		lines.push( '' );
		
		// Meta Tags
		lines.push( '=== META TAGS ===' );
		if ( data.metaTags.standard ) {
			lines.push( '\nStandard Meta Tags:' );
			Object.entries( data.metaTags.standard ).forEach( ( [ key, value ] ) => {
				lines.push( `  ${ key }: ${ value }` );
			} );
		}
		
		if ( data.metaTags.openGraph ) {
			lines.push( '\nOpen Graph Tags:' );
			Object.entries( data.metaTags.openGraph ).forEach( ( [ key, value ] ) => {
				lines.push( `  ${ key }: ${ value }` );
			} );
		}
		
		if ( data.metaTags.twitter ) {
			lines.push( '\nTwitter Tags:' );
			Object.entries( data.metaTags.twitter ).forEach( ( [ key, value ] ) => {
				lines.push( `  ${ key }: ${ value }` );
			} );
		}
		
		// Schemas
		lines.push( '\n=== STRUCTURED DATA SCHEMAS ===' );
		if ( data.schemas.length === 0 ) {
			lines.push( 'No schemas found.' );
		} else {
			data.schemas.forEach( ( schema, index ) => {
				lines.push( `\nSchema ${ index + 1 }: ${ schema[ '@type' ] || 'Unknown Type' }` );
				Object.entries( schema ).forEach( ( [ key, value ] ) => {
					if ( key !== '@type' ) {
						if ( typeof value === 'object' ) {
							lines.push( `  ${ key }: ${ JSON.stringify( value, null, 2 ).replace( /\n/g, '\n    ' ) }` );
						} else {
							lines.push( `  ${ key }: ${ value }` );
						}
					}
				} );
			} );
		}

		// Headings
		lines.push( '\n=== HEADINGS HIERARCHY ===' );
		if ( data.headings.length === 0 ) {
			lines.push( 'No headings found.' );
		} else {
			data.headings.forEach( heading => {
				const indent = '  '.repeat( heading.level - 1 );
				lines.push( `${ indent }H${ heading.level }: ${ heading.text }` );
			} );
		}

		// Issues
		lines.push( '\n=== SEO ISSUES ===' );
		if ( data.issues.length === 0 ) {
			lines.push( 'No SEO issues found. Great job!' );
		} else {
			const errors = data.issues.filter( issue => issue.type === 'error' );
			const warnings = data.issues.filter( issue => issue.type === 'warning' );
			
			if ( errors.length > 0 ) {
				lines.push( `\nCRITICAL ISSUES (${ errors.length }):` );
				errors.forEach( ( issue, index ) => {
					lines.push( `  ${ index + 1 }. [${ issue.category }] ${ issue.message }` );
					lines.push( `     Fix: ${ issue.fix }` );
				} );
			}
			
			if ( warnings.length > 0 ) {
				lines.push( `\nWARNINGS (${ warnings.length }):` );
				warnings.forEach( ( issue, index ) => {
					lines.push( `  ${ index + 1 }. [${ issue.category }] ${ issue.message }` );
					lines.push( `     Fix: ${ issue.fix }` );
				} );
			}
		}

		// Add footer
		lines.push( '' );
		lines.push( '========================' );
		lines.push( `Generated with SEO Analyzer Tools` );
		lines.push( `${ new Date().toLocaleString() }` );

		return lines.join( '\n' );
	}

	function exportData( format ) {
		const metaTags = getMetaTags();
		const schemas = getSchemas();
		const headings = getHeadings().map(h => ({ level: h.level, text: h.text })); // Strip element reference
		const issues = checkSEOIssues();
		const data = { metaTags, schemas, headings, issues, url: window.location.href, timestamp: new Date().toISOString() };
		
		let content, mimeType;
		const filename = generateFilename( format );
		
		switch ( format ) {
			case 'json':
				content = JSON.stringify( data );
				mimeType = 'application/json';
				break;
			case 'pretty-json':
				content = JSON.stringify( data, null, 2 );
				mimeType = 'application/json';
				break;
			case 'csv':
				content = exportToCSV( data );
				mimeType = 'text/csv';
				break;
			case 'text':
				content = exportToText( data );
				mimeType = 'text/plain';
				break;
			default:
				console.error( 'Unknown export format:', format );
				return;
		}
		
		downloadFile( content, filename, mimeType );
	}

	// --- Main Execution ---
	const hostId = `${ ANALYZER_ID }-host`;

	// Already loaded.
	if ( document.getElementById( hostId ) ) {
		const hostElement = document.getElementById( hostId );
		const panelElement = hostElement.shadowRoot.getElementById( 'panel' );
		panelElement.classList.remove( 'hidden' );
		return;
	}

	createAnalyzerUI( getMaxZIndex() );
} )();