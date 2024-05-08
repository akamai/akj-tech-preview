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

/**
 * An `onConfig` function featuring the bare minimum needed to create a Property:
 *
 * - Caching
 * - CP Code
 * - Origin
 *
 * @param {import('../../../types/src/types').Property} config The Property object
 */
function onConfig(config) {
	config.setCaching({
		ttl: '7d',
	});
	config.setOrigin({
		originType: 'CUSTOMER',
		hostname: 'example.com',
	});
	config.setCpCode({
		value: {
			id: 1234,
		},
	});
	config.setEdgeWorker({
		enabled: true,
		edgeWorkerId: '1234',
	});
}

module.exports = {onConfig};
