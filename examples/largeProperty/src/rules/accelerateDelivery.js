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
 * Create the Accelerate Delivery grouping on the default rule
 *
 * @param {Property} config The top level of the property
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
		})
		.setDnsPrefresh({});

	accelerateDeliveryGroup
		.group('Protocol optimizations', 'Serve your website using modern and fast protocols.')
		.setEnhancedAkamaiProtocol()
		.setHttp3({})
		.setHttp2()
		.setAllowTransferEncoding({})
		.setSureRoute({
			testObjectUrl: '/site/srt.html',
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
		.setAdaptiveAcceleration({
			enablePush: false,
		});

	accelerateDeliveryGroup.group('Script Manager', 'Manage scripts.').setScriptManagement({});
}

module.exports = {
	accelerateDelivery,
};
