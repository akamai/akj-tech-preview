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
 * Create the Minimize Payload grouping on the default rule
 *
 * @param {Property} config A builder that controls the configuration of the property.
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

module.exports = {
	minimizePayload,
};
