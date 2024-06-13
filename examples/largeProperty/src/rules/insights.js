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
 * Create the Augment Insites grouping on the default rule. This is slightly different than in the `defaultTemplate`
 * example.
 *
 * @param {Property} config The property to add the parameters to
 * @param {number} cpCode The cp code to associate property traffic to
 * @param {object} [options] Options for configuring additional behaviours
 * @param {string} [options.mPulseAPIKey] The API key for associating traffic. If not present, mPulse is not added.
 * @param {string[]} [options.dataStreams] The list of StreamIds
 */
function augmentInsights(config, cpCode, options) {
	const augmentInsightsGroup = config.group(
		'Augment insights',
		'Control the settings related to monitoring and reporting. This gives you additional visibility into your traffic and audiences.',
	);

	augmentInsightsGroup.group('Traffic Reporting').setCpCode({
		value: {
			id: cpCode,
		},
	});

	if (options && options.mPulseAPIKey) {
		augmentInsightsGroup
			.group('mPulse RUM', 'Collect and analyze real-user data to monitor the performance of your website.')
			.setMPulse({
				enabled: true,
				apiKey: options.mPulseAPIKey,
				bufferSize: '',
			});
	}

	augmentInsightsGroup
		.onRequestType({})
		.name('Geolocation')
		.comment(
			"Receive data about a user's geolocation and connection speed in a request header. If you change cached content based on the values of the X-Akamai-Edgescape request header, contact your account representative.",
		)
		.setEdgeScape({
			enabled: false,
		});

	augmentInsightsGroup
		.group(
			'Log Delivery',
			'Specify the level of detail you want to be logged in your Log Delivery Service reports. Log User-Agent Header to obtain detailed information in the Traffic by Browser and OS report.',
		)
		.setReport({});

	if (options && options.dataStreams && options.dataStreams.length > 0) {
		augmentInsightsGroup.group('DataStream', 'Configure log delivery').setDatastream({
			streamType: 'LOG',
			logStreamName: options.dataStreams,
		});
	}
}

module.exports = {
	augmentInsights,
};
