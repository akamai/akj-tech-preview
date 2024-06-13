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

const {readFileSync} = require('fs');
const {Property} = require('akj-tech-preview');
const {DEFAULT_SHARED_POLICY_LOCATION} = require('../dynamicRedirector/redirector');

const GEO_REDIRECT_PATTERN = 'prod_geo_';
const WWW_REDIRECT_PATTERN = 'prod_www_';

/**
 * @typedef {Function} PolicyFetcher
 * @param {string} [location] The location of the policies on disk
 * @returns {object[]} The policies to use
 */

/**
 * Setup the EdgeRedirector rules on the Property. The rules will be setup in whichever `property` is provided. This
 * could be the main property or a group with a matcher.
 *
 * @param {Property} property The property where the redirections will be configured.
 * @param {PolicyFetcher} policyFetcher A function to get the shared policies
 */
function setupRedirects(property, policyFetcher = loadPoliciesFromDisk) {
	const policies = policyFetcher();

	// in this example, the shared policies are based on a naming convention
	// prod_geo_a_b_c where a,b,c are paths segments
	const geoRedirects = policies
		.filter(policy => {
			return (policy.policyType = 'SHARED' && policy.name.startsWith(GEO_REDIRECT_PATTERN));
		})
		.map(policy => {
			// transform a rule like prod_geo_a_b_c to /a/b/c/*
			const pathMatch = `/${policy.name.split(GEO_REDIRECT_PATTERN)[1].replace('_', '/')}/*`;
			return {
				pathMatch: pathMatch,
				policy: policy.id,
			};
		});

	const geoRedirectMatchConditions = geoRedirects.map(redirect => redirect.pathMatch);
	const geoRedirectGroup = property
		.onPath({
			values: geoRedirectMatchConditions,
		})
		.name('Geo Redirects')
		.comment('Geo Redirects for specific countries');

	// for each redirect that exists with the specified pattern, create a path match an link to the redirection shared policy
	geoRedirects.forEach(redirect => {
		geoRedirectGroup
			.onPath({
				values: [redirect.pathMatch],
			})
			.name(`Dynamic Redirect ${redirect.pathMatch}`)
			.setEdgeRedirector({
				isSharedPolicy: true,
				cloudletSharedPolicy: redirect.policy,
			});
	});

	// setup another group of redirects that exist if one of the previous rules is not present.
	const wwwRedirectGroup = property
		.onPath({
			matchOperator: 'DOES_NOT_MATCH_ONE_OF',
			values: geoRedirectMatchConditions,
		})
		.name('www redirects')
		.comment('Non Geo redirects');

	// in this example, the shared policies are based on a naming convention
	// prod_www_a_b_c where a,b,c are paths segments
	const wwwRedirects = policies
		.filter(policy => {
			return (policy.policyType = 'SHARED' && policy.name.startsWith(WWW_REDIRECT_PATTERN));
		})
		.map(policy => {
			// transform a rule like prod_geo_a_b_c to /a/b/c/*
			const pathMatch = `/${policy.name.split(WWW_REDIRECT_PATTERN)[1].replace('_', '/')}/*`;
			return {
				pathMatch: pathMatch,
				policy: policy.id,
			};
		});

	wwwRedirects.forEach(redirect => {
		wwwRedirectGroup
			.onPath({
				values: [redirect.pathMatch],
			})
			.setEdgeRedirector({
				isSharedPolicy: true,
				cloudletSharedPolicy: redirect.policy,
			});
	});
}

/**
 * Load the shared policies from disk.
 *
 * @param {string} [location] The location of the shared policies to load. Default is `'./temp/sharedPolicies.json'`
 * @returns {object[]} The policies are loaded from disk
 */
function loadPoliciesFromDisk(location = DEFAULT_SHARED_POLICY_LOCATION) {
	const file = readFileSync(location, 'utf-8');
	return JSON.parse(file);
}

module.exports = {
	loadPoliciesFromDisk,
	setupRedirects,
	GEO_REDIRECT_PATTERN,
	WWW_REDIRECT_PATTERN,
};
