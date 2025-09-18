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
		return `.fixed{position:fixed}.relative{position:relative}.right-0{right:0}.top-0{top:0}.mb-4{margin-bottom:1rem}.mt-4{margin-top:1rem}.block{display:block}.flex{display:flex}.table{display:table}.hidden{display:none}.h-full{height:100%}.w-48{width:12rem}.w-full{width:100%}.flex-grow{flex-grow:1}.border-collapse{border-collapse:collapse}.cursor-pointer{cursor:pointer}.flex-col{flex-direction:column}.items-center{align-items:center}.justify-between{justify-content:space-between}.gap-1{gap:.25rem}.gap-4{gap:1rem}.overflow-y-auto{overflow-y:auto}.rounded{border-radius:.25rem}.border{border-width:1px}.border-0{border-width:0}.border-b{border-bottom-width:1px}.border-l{border-left-width:1px}.border-solid{border-style:solid}.border-gray-300{--tw-border-opacity:1;border-color:rgb(209 213 219/var(--tw-border-opacity,1))}.bg-gray-50{--tw-bg-opacity:1;background-color:rgb(249 250 251/var(--tw-bg-opacity,1))}.bg-transparent{background-color:transparent}.bg-white{--tw-bg-opacity:1;background-color:rgb(255 255 255/var(--tw-bg-opacity,1))}.p-2{padding:.5rem}.p-4{padding:1rem}.px-3{padding-left:.75rem;padding-right:.75rem}.px-4{padding-left:1rem;padding-right:1rem}.py-2{padding-top:.5rem;padding-bottom:.5rem}.py-4{padding-top:1rem;padding-bottom:1rem}.text-left{text-align:left}.font-sans{font-family:ui-sans-serif,system-ui,sans-serif,Apple Color Emoji,Segoe UI Emoji,Segoe UI Symbol,Noto Color Emoji}.text-lg{font-size:18px}.text-sm{font-size:14px}.font-bold{font-weight:700}.italic{font-style:italic}.leading-none{line-height:1}.leading-relaxed{line-height:1.625}.text-accent{--tw-text-opacity:1;color:rgb(239 122 55/var(--tw-text-opacity,1))}.text-gray-700{--tw-text-opacity:1;color:rgb(55 65 81/var(--tw-text-opacity,1))}.text-inherit{color:inherit}.shadow{--tw-shadow:0 1px 3px 0 rgba(0,0,0,.1),0 1px 2px -1px rgba(0,0,0,.1);--tw-shadow-colored:0 1px 3px 0 var(--tw-shadow-color),0 1px 2px -1px var(--tw-shadow-color)}.shadow,.shadow-xl{box-shadow:var(--tw-ring-offset-shadow,0 0 #0000),var(--tw-ring-shadow,0 0 #0000),var(--tw-shadow)}.shadow-xl{--tw-shadow:0 20px 25px -5px rgba(0,0,0,.1),0 8px 10px -6px rgba(0,0,0,.1);--tw-shadow-colored:0 20px 25px -5px var(--tw-shadow-color),0 8px 10px -6px var(--tw-shadow-color)}.filter{filter:var(--tw-blur) var(--tw-brightness) var(--tw-contrast) var(--tw-grayscale) var(--tw-hue-rotate) var(--tw-invert) var(--tw-saturate) var(--tw-sepia) var(--tw-drop-shadow)}.transition-all{transition-property:all;transition-timing-function:cubic-bezier(.4,0,.2,1);transition-duration:.15s}.indent-4{text-indent:1rem}.indent-8{text-indent:2rem}.indent-12{text-indent:3rem}.indent-16{text-indent:4rem}.indent-20{text-indent:5rem}.indent-24{text-indent:6rem}:host{--color-gray-300:#d1d5db}*{box-sizing:border-box;margin:0;padding:0}ul{list-stype:none}#panel{width:500px;max-width:95vw}details[open] summary{border-bottom:1px solid var(--color-gray-300)}tr:last-child{border-bottom:none}.hover\:text-accent:hover{--tw-text-opacity:1;color:rgb(239 122 55/var(--tw-text-opacity,1))}`;
	}

	const isPlainObject = obj => obj !== null && typeof obj === 'object' && Object.getPrototypeOf( obj ) === Object.prototype;

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
				ogTags[ property ] = content;
			} else if ( name && name.startsWith( 'twitter:' ) ) {
				twitterTags[ name ] = content;
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
			const { key, value, depth } = pair;

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
			td.className = 'p-2';

			if ( typeof value === 'string' && ( value.startsWith( 'http://' ) || value.startsWith( 'https://' ) ) && forceLink ) {
				const a = document.createElement( 'a' );
				a.href = value;
				a.target = '_blank';
				a.rel = 'noopener noreferrer';
				a.textContent = value;
				td.appendChild( a );
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
		validatorLinksDiv.innerHTML = `
			<strong>Validate:</strong>
			<a class="flex items-center gap-1" href="https://search.google.com/test/rich-results?url=${ encodedUrl }" target="_blank" rel="noopener noreferrer">
				Google Rich Results
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
					<path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
					<path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
				</svg>
			</a>
			<a class="flex items-center gap-1" href="https://validator.schema.org/#url=${ encodedUrl }" target="_blank" rel="noopener noreferrer">
				Schema.org
				<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 16 16">
					<path fill-rule="evenodd" d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"/>
					<path fill-rule="evenodd" d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"/>
				</svg>
			</a>
		`;
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
		summaryTd.innerHTML = `❌ <strong>${ errors.length }</strong> Critical Issues, ⚠️ <strong>${ warnings.length }</strong> Warnings`;
		
		summaryTr.appendChild( summaryTh );
		summaryTr.appendChild( summaryTd );
		summaryTable.appendChild( summaryTr );
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

		const issuesTab = document.createElement( 'button' );
		issuesTab.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent';
		issuesTab.dataset.tab = 'issues';
		issuesTab.textContent = 'Issues';

		// Add pipe separator and export link
		const pipeSeparator = document.createElement( 'span' );
		pipeSeparator.className = 'py-4 text-gray-700';
		pipeSeparator.textContent = ' | ';

		// Export functionality - make it a direct tab element like others
		const exportLink = document.createElement( 'button' );
		exportLink.className = 'tab bg-transparent border-0 transition-all py-4 cursor-pointer font-bold text-gray-700 hover:text-accent relative';
		exportLink.textContent = 'Export';
		exportLink.title = 'Export SEO data';

		const exportDropdown = document.createElement( 'div' );
		exportDropdown.className = 'absolute right-0 mt-1 bg-white border border-solid border-gray-300 rounded shadow-xl hidden';
		exportDropdown.style.minWidth = '140px';
		exportDropdown.style.zIndex = '1000';
		exportDropdown.style.position = 'absolute';
		exportDropdown.style.top = '100%';

		const exportOptions = [
			{ label: 'JSON', format: 'json' },
			{ label: 'Pretty JSON', format: 'pretty-json' },
			{ label: 'CSV', format: 'csv' },
			{ label: 'Text Report', format: 'text' }
		];

		exportOptions.forEach( option => {
			const optionButton = document.createElement( 'button' );
			optionButton.className = 'block w-full text-left px-3 py-2 text-sm bg-transparent border-0 cursor-pointer hover:bg-gray-50';
			optionButton.textContent = option.label;
			optionButton.addEventListener( 'click', () => {
				exportData( option.format );
				exportDropdown.classList.add( 'hidden' );
			} );
			exportDropdown.appendChild( optionButton );
		} );

		exportLink.addEventListener( 'click', () => {
			exportDropdown.classList.toggle( 'hidden' );
		} );

		// Close dropdown when clicking outside (use shadowRoot for proper event handling)
		shadowRoot.addEventListener( 'click', ( e ) => {
			if ( !exportLink.contains( e.target ) && !exportDropdown.contains( e.target ) ) {
				exportDropdown.classList.add( 'hidden' );
			}
		} );

		exportLink.appendChild( exportDropdown );

		tabsContainer.appendChild( metaTab );
		tabsContainer.appendChild( schemaTab );
		tabsContainer.appendChild( issuesTab );
		tabsContainer.appendChild( pipeSeparator );
		tabsContainer.appendChild( exportLink );

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

		const issuesPane = document.createElement( 'div' );
		issuesPane.dataset.tab = 'issues';
		issuesPane.className = 'pane flex-grow overflow-y-auto p-4 hidden';
		issuesPane.innerHTML = `<em class="text-muted">Analyzing SEO Issues...</em>`;

		// Assemble Panel
		header.appendChild( tabsContainer );
		header.appendChild( closeButton );
		panel.appendChild( header );
		panel.appendChild( metaTagsPane );
		panel.appendChild( schemasPane );
		panel.appendChild( issuesPane );
		shadowRoot.appendChild( panel );

		// Render initial content.
		renderMetaTags( metaTagsPane, getMetaTags() );
		renderSchemas( schemasPane, getSchemas() );
		renderIssues( issuesPane, checkSEOIssues() );

		// Append the host to the document body
		document.body.appendChild( host );

		// Tab switching logic
		[ metaTab, schemaTab, issuesTab ].forEach( tab => tab.addEventListener( 'click', () => {
			shadowRoot.querySelectorAll( '.tab' ).forEach( t => {
				t.classList.remove( 'text-accent' );
				t.classList.add( 'text-gray-700' );
			} );
			tab.classList.remove( 'text-gray-700' );
			tab.classList.add( 'text-accent' );

			shadowRoot.querySelectorAll( '.pane' ).forEach( p => p.classList.add( 'hidden' ) );
			shadowRoot.querySelector( `.pane[data-tab=${ tab.dataset.tab }]` ).classList.remove( 'hidden' );
		} ) );
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
		
		return lines.join( '\n' );
	}

	function exportData( format ) {
		const metaTags = getMetaTags();
		const schemas = getSchemas();
		const issues = checkSEOIssues();
		const data = { metaTags, schemas, issues, url: window.location.href, timestamp: new Date().toISOString() };
		
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