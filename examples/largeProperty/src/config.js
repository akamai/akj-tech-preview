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
const {setupRedirects} = require('./rules/redirector');
const {augmentInsights} = require('./rules/insights');
const {accelerateDelivery} = require('./rules/accelerateDelivery');
const {offloadOrigin} = require('./rules/offload');
const {strengthenSecurity} = require('./rules/strengthSecurity');
const {increaseAvailability} = require('./rules/availability');
const {minimizePayload} = require('./rules/minimize');
const {injectLocationData, netStorageOrigins, setupAPIPath, setupIVM} = require('./rules/custom');

const defaultOrigin = 'example.com';
const defaultCPCode = 1234;
const edgeWorkerId = 777;

//super secret header value to allow breaking the forward connection during failover testing
const breakForwardConnection = '1234';
/**
 * Called by the PCDN runner to configure the property referenced in `property.json`. To activate the configuring on
 * staging, run `npx pcdn` in the parent directory.
 *
 * @param {Property} config A builder that controls the configuration of the property.
 */
function onConfig(config) {
	// Setup a sample property with:
	// - a default origin set to www.akamai.com
	// - a default caching behaviour that is caching content for 1 day. This might not be appropriate for your usecase.
	// - the provided CP Code
	// - the provided EdgeWorker.
	// - a sample path match
	config.setOrigin({
		originType: 'CUSTOMER',
		hostname: defaultOrigin,
		verificationMode: 'CUSTOM',
		customValidCnValues: ['{{Origin Hostname}}', '{{Forward Host Header}}', 'other.example.com'],
	});

	// Referencing custom behaviours is possible.  Creation must be done outside this code
	// See https://techdocs.akamai.com/property-mgr/docs/custom-behavior
	// They must be referenced by `behaviorId` including the PAPI prefix.
	// The API https://techdocs.akamai.com/property-mgr/reference/get-custom-behaviors can be used to find these values.
	config.group('Custom Behaviour', 'Add a custom behaviour.').setCustomBehavior({
		behaviorId: 'cbe_1',
	});

	// setup a default redirect to HTTP with a 301
	config.group('WWW Redirect', 'Redirect any requests to www').setRedirect({
		destinationProtocol: 'HTTPS',
		responseCode: 301,
		destinationHostnameOther: `www.${defaultOrigin}`,
	});

	let edgeRedirectionGroup = config
		.onRequestHeader({
			matchOperator: 'DOES_NOT_EXIST',
			headerName: `x-${defaultOrigin}-no-redirect`,
		})
		.name('Edge Redirection')
		.comment('Configure Edge Redirection');

	// Create EdgeRedirects via the Cloudlets API so that anything with specific patterns will get autocreated rules
	setupRedirects(edgeRedirectionGroup);

	config.setForwardRewrite({
		isSharedPolicy: true,
		cloudletSharedPolicy: 123,
	});

	// Add the modified default template sections
	augmentInsights(config, defaultCPCode, {
		dataStreams: ['1234', '2345'],
	});
	accelerateDelivery(config);
	offloadOrigin(config, defaultOrigin);
	strengthenSecurity(config);
	increaseAvailability(config, {
		breakConnectionHeaderValue: breakForwardConnection,
	});
	minimizePayload(config);

	// Use a custom behaviour to add location data to the page
	injectLocationData(config);

	// Setup some netstorage origins for certain paths
	netStorageOrigins(config);

	// Add specific configuration for API calls
	setupAPIPath(config);

	// setup the EdgeWorker that will be configured within this demo
	config.setEdgeWorker({
		edgeWorkerId: `${edgeWorkerId}`,
	});

	// add the IVM rules for images and videos
	setupIVM(config, defaultOrigin);
}

module.exports = {
	onConfig,
};
