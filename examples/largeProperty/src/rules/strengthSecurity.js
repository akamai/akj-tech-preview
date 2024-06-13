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
 */
function strengthenSecurity(config) {
	// create a top level grouping
	const strengthenSecurityGroup = config.group(
		'Strengthen security',
		'Control the settings that minimize the information your website shares with clients and malicious entities to reduce your exposure to threats.',
	);

	const allowedMethodsGroup = strengthenSecurityGroup
		.group(
			'Allowed methods',
			'Allow the use of HTTP methods. Consider enabling additional methods under a path match for increased origin security.',
		)
		.setAllHttpInCacheHierarchy({});

	allowedMethodsGroup
		.onPath({
			values: ['/*/email*', '/email/*', '/api/'],
		})
		.name('POST')
		.comment('Allow POST on certain URLS')
		.setAllowPost({});

	// allow OPTIONS, but disable PUT, DELTE and PATCH
	allowedMethodsGroup.group('OPTIONS', 'Allow use of the OPTIONS HTTP request method.').setAllowOptions({});
	allowedMethodsGroup.group('PUT', 'Allow use of the PUT HTTP request method.').setAllowPut({enabled: false});
	allowedMethodsGroup
		.group('DELETE', 'Allow use of the DELETE HTTP request method.')
		.setAllowDelete({enabled: false});
	allowedMethodsGroup.group('PATCH', 'Allow use of the PATCH HTTP request method.').setAllowPatch({enabled: false});

	// hide debug information
	strengthenSecurityGroup
		.group(
			'Obfuscate debug info',
			'Do not expose back-end information unless the request contains the Pragma debug header.',
		)
		.setCacheTagVisible({
			behavior: 'PRAGMA_HEADER',
		});

	strengthenSecurityGroup
		.all(criteria => {
			criteria.onRequestHeader({
				headerName: 'X-Akamai-Debug',
				matchOperator: 'IS_NOT_ONE_OF',
				values: ['true'],
			});
			criteria.onAdvancedImMatch({
				matchOperator: 'IS_NOT',
			});
		})
		.name('Obfuscate backend info')
		.comment(
			'Do not expose back-end information unless the request contains an additional secret header. Regularly change the criteria to use a specific unique value for the secret header.',
		)
		.setModifyOutgoingResponseHeader({
			action: 'DELETE',
			customHeaderName: 'X-Powered-By',
			standardDeleteHeaderName: 'OTHER',
		})
		.setModifyOutgoingResponseHeader({
			action: 'DELETE',
			customHeaderName: 'Server',
			standardDeleteHeaderName: 'OTHER',
		});

	strengthenSecurityGroup
		.group('HSTS', 'Require all browsers to connect to your site using HTTPS.')
		.setHttpStrictTransportSecurity({
			maxAge: 'ONE_YEAR',
			includeSubDomains: true,
			preload: true,
			redirect: true,
		});
}

module.exports = {
	strengthenSecurity,
};
