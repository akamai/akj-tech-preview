/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */
//@ts-check

const {Property} = require('akj-tech-preview');

/**
 * Call a custom behaviour to insert location data into the page.
 *
 * @param {Property} config The Property to further configure with location data
 */
function injectLocationData(config) {
	config
		.all(criteria => {
			criteria.onMetadataStage({
				value: 'client-response',
			});
			criteria.onContentType({
				values: ['text/html*'],
			});
		})
		.name('Inject Location Data')
		.setSetVariable({
			variableName: 'PMUSER_COUNTRY',
			valueSource: 'EXTRACT',
			extractLocation: 'EDGESCAPE',
			locationId: 'COUNTRY_CODE',
		})
		.setSetVariable({
			variableName: 'PMUSER_CONTINENT',
			valueSource: 'EXTRACT',
			extractLocation: 'EDGESCAPE',
			locationId: 'CONTINENT',
		})
		.setCustomBehavior({
			behaviorId: 'cbe_123456',
		});
}

/**
 * Configure a few netstorage origins on the property.
 *
 * @param {Property} config The Property to further configure with location data
 */
function netStorageOrigins(config) {
	// convenience function to setup the netstorage origins
	const setupNetstorage = (
		/** @type {Property} */ config,
		/** @type {string[]} */ paths,
		/** @type {string} */ prefix,
		/** @type {number} */ cpCode,
		/** @type {string} */ basePath,
		/** @type {string} */ ttl,
	) => {
		config
			.onPath({
				values: paths,
			})
			.name(`Nestorage Origin for ${prefix}`)
			.setOrigin({
				originType: 'NET_STORAGE',
				netStorage: {
					cpCode: cpCode,
					downloadDomainName: `${prefix}.download.akamai.com`,
				},
			})
			.setBaseDirectory({
				value: basePath,
			})
			.setCaching({
				ttl: ttl,
			})
			.setCacheError({
				ttl: '30s',
			})
			.setCacheKeyQueryParams({
				behavior: 'IGNORE_ALL',
			});

		return config;
	};

	// setup a netstorage origin with specific rules for JSON files that are more dynamic
	setupNetstorage(config, ['/dv*'], 'dv', 12345, '/static/files/', '1h')
		.onFileExtension({values: ['json']})
		.name('JSON Caching')
		.setCaching({ttl: '10m'});

	//setup a second netstorage origin
	setupNetstorage(config, ['/client*', '/??/client*'], 'client', 23456, '/static/client/', '7d');

	// setup another netstorage origin.  Traffic in this case should receive a separate CP Code to be tracked separately.
	setupNetstorage(config, ['x-failover*'], 'failover', 34567, '/static/failover/', '1d').setCpCode({
		value: {id: 45678},
	});

	// setup yet another netstorage origin.
	setupNetstorage(config, ['/parner/*'], 'partner', 56789, '/static/partner/', '4h');
}

/**
 * Set the API path with CORS and a specific CP code for tracking.
 *
 * @param {Property} config The Property to add the API configuration
 */
function setupAPIPath(config) {
	config
		.onPath({values: ['/api/*']})
		.name('API CORS')
		.setAllowOptions({})
		.setCorsSupport({
			allowCredentials: true,
			allowOrigins: 'ANY',
			methods: ['POST', 'GET'],
			allowHeaders: 'ANY',
			preflightMaxAge: '86400s',
		});

	config.setCpCode({
		value: {
			id: 44444,
		},
	});
}

/**
 * Setup the rules hiearchy for IVM image integration.
 *
 * @param {Property} config The property to add the IVM settings to
 * @param {string} origin The origin that is being used and is referenced in the IVM policy name
 * @see {@link https://techdocs.akamai.com/ivm/docs/welcome-ivm | The IVM Techdocs}
 */
function setupIVM(config, origin) {
	const group = config.group('IVM Rules', 'Image and Video awesomeness').setCaching({
		ttl: '30d',
	});

	//setup IVM for images
	group
		.onFileExtension({values: ['jpg', 'gif', 'jpeg', 'png', 'imviewer']})
		.name('Images')
		.setImageManager({
			advanced: true,
			applyBestFileType: true,
			enabled: true,
			resize: true,
			superCacheRegion: 'US',
			useExistingPolicySet: false,
			cpCodeOriginal: {
				id: 88888,
			},
			cpCodeTransformed: {
				id: 99999,
			},
			policyToken: `prod-${origin}`,
		})
		.setFailAction({
			enabled: false,
		})
		.onMatchResponseCode({
			values: ['500'],
		})
		.name('Turn 500 into 404 with magic')
		.setResponseCode({statusCode: 404});

	// setup IVM for videos
	group
		.onFileExtension({
			values: ['mp4'],
		})
		.name('Videos')
		.setImageManagerVideo({
			advanced: true,
			applyBestFileType: true,
			enabled: true,
			resize: true,
			superCacheRegion: 'US',
			useExistingPolicySet: false,
			cpCodeOriginal: {
				id: 11111,
			},
			cpCodeTransformed: {
				id: 222222,
			},
			policyToken: `prod-${origin}`,
		});
}

module.exports = {
	injectLocationData,
	netStorageOrigins,
	setupAPIPath,
	setupIVM,
};
