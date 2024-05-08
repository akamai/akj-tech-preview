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

const configuration = require('./config/loader');
const {Property} = require('akj-tech-preview');

/**
 * An `onConfig` function that will read the configuration from an external source and apply the rules based on custom
 * functions.
 *
 * @param {Property} config The top level of the property
 */
function onConfig(config) {
	const rulesConfiguration = configuration.loader();

	// set the default caching and CP code for the property
	config
		.comment(`Configuration: ${rulesConfiguration.file}.  Version: ${rulesConfiguration.sha256}`)
		.setOrigin({
			originType: 'CUSTOMER',
			hostname: 'example.com',
		})
		.setCaching({
			ttl: '0d',
		})
		.setCpCode({
			value: {
				id: 1234,
			},
		});

	// Add EdgeWorker to your property
	config.setEdgeWorker({
		enabled: true,
		edgeWorkerId: '1234',
	});

	if ('rules' in rulesConfiguration.loaded) {
		rulesConfiguration.loaded.rules.forEach(rule => {
			let pathMatch = config
				.onPath({
					matchOperator: 'MATCHES_ONE_OF',
					values: rule.paths,
				})
				.setCpCode({
					value: {
						id: rule.cpCode,
					},
				})
				.setOrigin({
					originType: 'CUSTOMER',
					hostname: rule.origin,
				});

			// caching override
			if ('cachingTime' in rule) {
				pathMatch.setCaching({
					ttl: rule.cachingTime,
				});
			}
			// edgeworker override
			if ('edgeworkerId' in rule) {
				pathMatch.setEdgeWorker({
					enabled: true,
					edgeWorkerId: `${rule.edgeworkerId}`,
				});
			}

			if ('cacheKey' in rule) {
				if ('cookies' in rule.cacheKey) {
					pathMatch.setCacheId({
						rule: 'INCLUDE_COOKIES',
						includeValue: true,
						optional: true,
						elements: rule.cacheKey.cookies,
					});
				}

				if ('queryParams' in rule.cacheKey) {
					pathMatch.setCacheId({
						rule: 'INCLUDE_QUERY_PARAMS',
						includeValue: true,
						optional: true,
						elements: rule.cacheKey.queryParams,
					});
				}
			}
		});
	}
}

module.exports = {
	onConfig,
};
