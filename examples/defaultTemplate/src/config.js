/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */
// @ts-check

// change these to setup default origins
const defaultOriginHostname = 'example.com';
const defaultCPCode = 1234;
const defaultEWId = '1234';
const mPulseAPIKey = '';

// Change this constant to assign the staging `breakconnect` header value.
const breakConnectionHeaderValue = '1234';

/**
 * Create the Augment Insites grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config The top level of the property
 */
function augmentInsights(config) {
	const augmentInsightsGroup = config.group(
		'Augment insights',
		'Control the settings related to monitoring and reporting. This gives you additional visibility into your traffic and audiences.',
	);

	augmentInsightsGroup.group('Traffic Reporting').setCpCode({
		value: {
			id: defaultCPCode,
		},
	});

	augmentInsightsGroup
		.group('mPulse RUM', 'Collect and analyze real-user data to monitor the performance of your website.')
		.setMPulse({
			enabled: true,
			apiKey: mPulseAPIKey,
			bufferSize: '',
		});

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
		.setReport({
			logHost: false,
		});
}

/**
 * Create the Accelerate Delivery grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config The top level of the property
 */
function accelerateDelivery(config) {
	const accelerateDeliveryGroup = config.group(
		'Accelerate Delivery',
		'Control the settings related to improving the performance of delivering objects to your users.',
	);

	accelerateDeliveryGroup
		.group('Origin connectivity', 'Optimize the connection between edge and origin.')
		.setDnsAsyncRefresh({
			enabled: true,
			timeout: '1h',
		})
		.setTimeout({
			value: '5s',
		})
		.setReadTimeout({
			value: '120s',
		});

	accelerateDeliveryGroup
		.group('Protocol optimizations', 'Serve your website using modern and fast protocols.')
		.setEnhancedAkamaiProtocol()
		.setHttp3({
			enable: true,
		})
		.setHttp2()
		.setAllowTransferEncoding({
			enabled: true,
		})
		.setSureRoute({
			testObjectUrl: '/akamai/sureroute-test-object.html',
		});

	const prefetchingGroup = accelerateDeliveryGroup.group(
		'Prefetching',
		'Instruct edge servers to retrieve embedded resources before the browser requests them.',
	);
	prefetchingGroup
		.group('Prefetching Objects', 'Define for which HTML pages prefetching should be enabled.')
		.setPrefetch({enabled: true})
		.onUserAgent({values: ['*bot*', '*crawl*', '*spider*']})
		.name('Bots')
		.comment(
			'Disable prefetching for specific clients identifying themselves as bots and crawlers. This avoids requesting unnecessary resources from the origin.',
		)
		.setPrefetch({enabled: false});

	prefetchingGroup
		.onFileExtension({
			values: [
				'css',
				'js',
				'jpg',
				'jpeg',
				'jp2',
				'png',
				'gif',
				'svg',
				'svgz',
				'webp',
				'eot',
				'woff',
				'woff2',
				'otf',
				'ttf',
			],
		})
		.name('Prefetchable objects')
		.comment('Define which resources should be prefetched.')
		.setPrefetchable({enabled: true});

	accelerateDeliveryGroup
		.group(
			'Adaptive acceleration',
			'Automatically and continuously apply performance optimizations to your website using machine learning.',
		)
		.setAdaptiveAcceleration({});
}

/**
 * Create the Offload Origin grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config The top level of the property
 */
function offloadOrigin(config) {
	const offloadOriginGroup = config
		.group(
			'Offload origin',
			'Control the settings related to caching content at the edge and in the browser. As a result, fewer requests go to your origin, fewer bytes leave your data centers, and your assets are closer to your users.',
		)
		.setCaching({
			behavior: 'NO_STORE',
		})
		.setTieredDistribution({})
		.setValidateEntityTag({
			enabled: false,
		})
		.setRemoveVary({
			enabled: false,
		})
		.setCacheError({})
		.setCacheKeyQueryParams({})
		.setPrefreshCache({})
		.setDownstreamCache({
			sendHeaders: 'CACHE_CONTROL',
			sendPrivate: false,
		});

	offloadOriginGroup
		.onFileExtension({
			values: ['css', 'js'],
		})
		.name('CSS and JavaScript')
		.comment('Override the default caching behavior for CSS and JavaScript')
		.setCaching({
			ttl: '7d',
		});

	offloadOriginGroup
		.onFileExtension({
			values: ['eot', 'woff', 'woff2', 'otf', 'ttf'],
		})
		.name('Fonts')
		.comment('Override the default caching behavior for fonts.')
		.setCaching({
			ttl: '30d',
		});

	offloadOriginGroup
		.onFileExtension({
			values: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'jp2', 'ico', 'svg', 'svgz'],
		})
		.name('Images')
		.comment('Override the default caching behavior for images.')
		.setCaching({
			ttl: '30d',
		});

	offloadOriginGroup
		.onFileExtension({
			values: ['pdf', 'doc', 'docx', 'odt'],
		})
		.name('Files')
		.comment(
			'Override the default caching behavior for files. Files containing Personal Identified Information (PII) should require Edge authentication or not be cached at all.',
		)
		.setCaching({
			ttl: '7d',
		});

	offloadOriginGroup
		.onFileExtension({
			values: [
				'aif',
				'aiff',
				'au',
				'avi',
				'bin',
				'bmp',
				'cab',
				'carb',
				'cct',
				'cdf',
				'class',
				'dcr',
				'dtd',
				'exe',
				'flv',
				'gcf',
				'gff',
				'grv',
				'hdml',
				'hqx',
				'ini',
				'mov',
				'mp3',
				'nc',
				'pct',
				'ppc',
				'pws',
				'swa',
				'swf',
				'txt',
				'vbs',
				'w32',
				'wav',
				'midi',
				'wbmp',
				'wml',
				'wmlc',
				'wmls',
				'wmlsc',
				'xsd',
				'zip',
				'pict',
				'tif',
				'tiff',
				'mid',
				'jxr',
				'jar',
			],
		})
		.name('Other static objects')
		.comment('Override the default caching behavior for other static objects')
		.setCaching({
			ttl: '7d',
		});

	offloadOriginGroup
		.onFileExtension({
			values: ['html', 'htm', 'php', 'jsp', 'aspx', 'EMPTY_STRING'],
		})
		.name('HTML pages')
		.comment('Override the default caching behavior for HTML pages cached on edge servers.')
		.setCaching({
			behavior: 'NO_STORE',
		})
		.setCacheKeyQueryParams({
			behavior: 'IGNORE',
			exactMatch: true,
			parameters: ['gclid', 'fbclid', 'utm_source', 'utm_campaign', 'utm_medium', 'utm_content'],
		});

	offloadOriginGroup
		.group(
			'Redirects',
			'Configure caching for HTTP redirects. The redirect is cached for the same TTL as a 200 HTTP response when this feature is enabled.',
		)
		.setCacheRedirect({
			enabled: 'false',
		})
		.setChaseRedirects({
			enabled: false,
		});

	offloadOriginGroup
		.group(
			'POST Responses',
			'Define when HTTP POST requests should be cached. You should enable it under a criteria match.',
		)
		.setCachePost({
			enabled: false,
		});

	offloadOriginGroup
		.onPath({
			values: ['/graphql'],
		})
		.name('GraphQL')
		.comment('Define when your GraphQL queries should be cached.')
		.setGraphqlCaching({
			enabled: false,
		});

	offloadOriginGroup
		.onCacheability({
			matchOperator: 'IS_NOT',
		})
		.name('Uncacheable objects')
		.comment('Configure the default client caching behavior for uncacheable content at the edge.')
		.setDownstreamCache({
			behavior: 'BUST',
		});
}

/**
 * Create the Strengthen Security grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config The top level of the property
 */
function strengthenSecurity(config) {
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

	allowedMethodsGroup.group('POST', 'Allow use of the POST HTTP request method.').setAllowPost({});
	allowedMethodsGroup.group('OPTIONS', 'Allow use of the OPTIONS HTTP request method.').setAllowOptions({});
	allowedMethodsGroup.group('PUT', 'Allow use of the PUT HTTP request method.').setAllowPut({enabled: false});
	allowedMethodsGroup
		.group('DELETE', 'Allow use of the DELETE HTTP request method.')
		.setAllowDelete({enabled: false});
	allowedMethodsGroup.group('PATCH', 'Allow use of the PATCH HTTP request method.').setAllowPatch({enabled: false});

	strengthenSecurityGroup
		.group(
			'Obfuscate debug info',
			'Do not expose back-end information unless the request contains the Pragma debug header.',
		)
		.setCacheTagVisible({
			behavior: 'PRAGMA_HEADER',
		});
	strengthenSecurityGroup
		.onRequestHeader({
			headerName: 'X-Akamai-Debug',
			matchOperator: 'IS_NOT_ONE_OF',
			values: ['true'],
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
			enable: false,
		});
}

/**
 * Create the Strengthen Security grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config The top level of the property
 */
function increaseAvailability(config) {
	const increaseAvailabilityGroup = config.group(
		'Increase availability',
		'Control how to respond when your origin or third parties are slow or even down to minimize the negative impact on user experience.',
	);

	increaseAvailabilityGroup
		.all(builder => {
			builder.onContentDeliveryNetwork({network: 'STAGING'});
			builder.onRequestHeader({
				headerName: 'breakconnection',
				values: [breakConnectionHeaderValue],
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

	increaseAvailabilityGroup
		.group(
			'Script Management',
			'Enable Script Management to minimize performance and availability impacts from third-party JavaScripts.',
		)
		.setScriptManagement({
			enabled: false,
		});
}

/**
 * Create the Minimize Payload grouping on the default rule
 *
 * @param {import('../../../types/src/types').Property} config A builder that controls the configuration of the
 *   property.
 */
function minimizePayload(config) {
	config
		.group(
			'Minimize payload',
			'Control the settings that reduce the size of the delivered content and decrease the number of bytes sent by your properties. This allows you to cut down the network overhead of your website or API.',
		)
		.onContentType({
			values: [
				'application/*javascript*',
				'application/*json*',
				'application/*xml*',
				'application/text*',
				'application/vnd-ms-fontobject',
				'application/vnd.microsoft.icon',
				'application/x-font-opentype',
				'application/x-font-truetype',
				'application/x-font-ttf',
				'application/xml*',
				'font/eot*',
				'font/eot',
				'font/opentype',
				'font/otf',
				'image/svg+xml',
				'image/vnd.microsoft.icon',
				'image/x-icon',
				'text/*',
				'application/octet-stream*',
				'application/x-font-eot*',
				'font/ttf',
				'application/font-ttf',
				'application/font-sfnt',
				'application/x-tgif',
			],
		})
		.name('Compressible objects')
		.comment('Serve gzip compressed content for text-based formats.')
		.setGzipResponse({behavior: 'ALWAYS'});
}

/**
 * Called by the PCDN runner to configure the property referenced in `property.json`. To activate the configuring on
 * staging, run `npx pcdn` in the parent directory.
 *
 * @param {import('../../../types/src/types').Property} config A builder that controls the configuration of the
 *   property.
 */
function onConfig(config) {
	// setup the default origin
	config.setOrigin({
		originType: 'CUSTOMER',
		hostname: defaultOriginHostname,
		forwardHostHeader: 'REQUEST_HOST_HEADER',
		cacheKeyHostname: 'REQUEST_HOST_HEADER',
	});

	augmentInsights(config);
	accelerateDelivery(config);
	offloadOrigin(config);
	strengthenSecurity(config);
	increaseAvailability(config);
	minimizePayload(config);

	// Add EdgeWorker to your property
	config.setEdgeWorker({
		enabled: true,
		edgeWorkerId: defaultEWId,
	});
}

module.exports = {
	onConfig,
};
