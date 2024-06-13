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
 * Create the Strengthen Security grouping on the default rule
 *
 * @param {Property} config The top level of the property
 * @param {object} options Options to provide
 * @param {string} options.breakConnectionHeaderValue The value to provide to break the forward connection when
 *   simulating failover
 */
function increaseAvailability(config, options) {
	const increaseAvailabilityGroup = config.group(
		'Increase availability',
		'Control how to respond when your origin or third parties are slow or even down to minimize the negative impact on user experience.',
	);

	increaseAvailabilityGroup
		.all(builder => {
			builder.onContentDeliveryNetwork({network: 'STAGING'});
			builder.onRequestHeader({
				headerName: 'breakconnection',
				values: [options.breakConnectionHeaderValue],
			});
		})
		.name('Simulate failover')
		.comment(
			'Simulate an origin connection problem and test the site failover configuration on the CDN staging network.',
		)
		.setBreakConnection({
			enabled: true,
		});

	increaseAvailabilityGroup
		.onOriginTimeout({})
		.name('Site Failover')
		.comment('Specify how edge servers respond when the origin is not available.')
		.setFailAction({
			enabled: false,
		});

	increaseAvailabilityGroup
		.group('Origin Health', 'Monitor the health of your origin by tracking unsuccessful IP connection attempts.')
		.setHealthDetection({
			retryInterval: '10s',
		});
}

module.exports = {
	increaseAvailability,
};
