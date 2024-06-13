/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */
//@ts-check

const {Property} = require('akj-tech-preview');

/**
 * Called by the PCDN runner to configure the property referenced in 
 * `property.json`. To activate the configuring on staging, run `npx pcdn`
 * in the parent directory. 
 * 
 * @param {Property} config A builder used to configure the property. 
 */
function onConfig(config) {

	/**
	 * Add a rule with the content of `scf.json`. That file contains a 
	 * criteria matching requests with an image file type and sets the 
	 * caching on it. 
	 */
	config.importChildRule('scf.json');

    /**
	 *  Configure the property with placeholder values. 
	 */
	config
		.setOrigin({
			originType: 'CUSTOMER',
			hostname: 'www.akamai.com',
			forwardHostHeader: 'REQUEST_HOST_HEADER',
			cacheKeyHostname: 'REQUEST_HOST_HEADER',
		})
		.setCaching({
			behavior: 'MAX_AGE',
			ttl: '1d',
		})
		.setCpCode({
			value: {
				id: 1242,
				description: 'Add some description',
				products: ['prd_Site_Del'],
				cpCodeLimits: null,
				name: 'Cite des Sciences',
			},
		});
}

module.exports = {
    onConfig
}