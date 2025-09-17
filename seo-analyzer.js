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

		tabsContainer.appendChild( metaTab );
		tabsContainer.appendChild( schemaTab );

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

		// Assemble Panel
		header.appendChild( tabsContainer );
		header.appendChild( closeButton );
		panel.appendChild( header );
		panel.appendChild( metaTagsPane );
		panel.appendChild( schemasPane );
		shadowRoot.appendChild( panel );

		// Render initial content.
		renderMetaTags( metaTagsPane, getMetaTags() );
		renderSchemas( schemasPane, getSchemas() );

		// Append the host to the document body
		document.body.appendChild( host );

		// Tab switching logic
		[ metaTab, schemaTab ].forEach( tab => tab.addEventListener( 'click', () => {
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