// ExtPay integration
// ExtPay is loaded via manifest.json scripts array
const extpay = ExtPay('seo-analyzer-tools');
console.log('ExtPay initialized successfully');

// Handle messages from content script
browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
	if (message.action === 'checkPremiumAccess') {
		if (extpay) {
			extpay.getUser().then(user => {
				console.log('ExtPay user:', user);
				const hasPremium = user.paid || user.trialStartedAt;
				sendResponse({ hasPremium, user });
			}).catch(error => {
				console.error('ExtPay getUser failed:', error);
				sendResponse({ hasPremium: false, error: error.message });
			});
		} else {
			sendResponse({ hasPremium: false, error: 'ExtPay not available' });
		}
		return true; // Will respond asynchronously
	}

	if (message.action === 'openPaymentPage') {
		if (extpay) {
			extpay.openPaymentPage();
		} else {
			console.error('ExtPay not available for payment page');
		}
	}
});

browser.action.onClicked.addListener( tab => {
	browser.scripting.executeScript( {
		target: { tabId: tab.id },
		files: [ 'seo-analyzer.js' ]
	} );
} );
