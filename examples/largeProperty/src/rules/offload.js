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

// putting this as a constant to make the later code more concise/readable.
const staticFileExtensions = [
	'css',
	'js',
	'eot',
	'woff',
	'woff2',
	'otf',
	'ttf',
	'jpg',
	'jpeg',
	'png',
	'gif',
	'webp',
	'jp2',
	'ico',
	'svg',
	'svgz',
	'pdf',
	'doc',
	'docx',
	'odt',
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
	'dot',
	'ics',
	'mp4',
	'json',
	'xml',
];

/**
 * Create the Offload Origin grouping on the default rule
 *
 * @param {Property} config The top level of the property
 * @param {string} hostname The hostname for the property
 */
function offloadOrigin(config, hostname) {
	// setup some basic caching/distribution rules to build on
	const offloadOriginGroup = config
		.group(
			'Offload origin',
			'Control the settings related to caching content at the edge and in the browser. As a result, fewer requests go to your origin, fewer bytes leave your data centers, and your assets are closer to your users.',
		)
		.setCaching({
			behavior: 'NO_STORE',
		})
		.setTieredDistribution({})
		.setValidateEntityTag({})
		.setRemoveVary({})
		.setCacheError({})
		.setCacheKeyQueryParams({
			behavior: 'IGNORE_ALL',
		})
		.setPrefreshCache({})
		.setDownstreamCache({
			sendHeaders: 'CACHE_CONTROL',
		});

	// Cache all the static file extensions for 30 days (except some fonts that change more often)
	offloadOriginGroup
		.onFileExtension({
			values: staticFileExtensions,
		})
		.name('Static Files')
		.comment('Override the default caching behavior all static file types')
		.setCaching({
			ttl: '30d',
		})
		.onPath({
			values: ['/fonts/icons.css', '/fonts/font.ttf', '/fonts/font.woff2'],
		})
		.name('Override Font Caching')
		.setCaching({
			ttl: '4h',
		});

	// track the user device in variables
	offloadOriginGroup
		.group('Track Device Profile')
		.setSetVariable({
			variableName: 'PMUSER_DEVICE_OS',
			valueSource: 'EXTRACT',
			extractLocation: 'DEVICE_PROFILE',
			deviceProfile: 'DEVICE_OS',
		})
		.all(criteria => {
			criteria.onMatchVariable({
				variableName: 'PMUSER_DEVICE_OS',
				variableValues: ['*android*'],
			});
		})
		.setSetVariable({
			variableName: 'PMUSER_ANDROID_DEVICE',
			valueSource: 'EXPRESSION',
			variableValue: 'true',
		});

	// Cache HTML pages by file extension for 7 days
	offloadOriginGroup
		.onFileExtension({
			values: ['html', 'htm', 'php', 'jsp', 'aspx', 'EMPTY_STRING'],
		})
		.name('HTML pages')
		.comment(
			'Override the default caching behavior for HTML pages cached on edge servers.  Modify the cache key to divide android etc.',
		)
		.setCaching({
			behavior: 'CACHE_CONTROL',
			ttl: '7d',
		})
		.setCacheId({
			elements: ['filter', 'author'],
		})
		.setCacheId({
			rule: 'INCLUDE_VARIABLE',
			variableName: 'PMUSER_ANDROID_DEVICE',
		});

	// Cache blogs for 1 hour
	offloadOriginGroup
		.onPath({
			values: ['/*/blog*', '/blog*', '/blog/*'],
		})
		.name('Blog Caching')
		.setCaching({
			ttl: '1h',
		})
		.setDownstreamCache({
			allowBehavior: 'FROM_VALUE',
			ttl: '15m',
		});

	// Caching static JSON items for 4 hours
	offloadOriginGroup
		.all(criteria => {
			criteria.onContentType({
				values: ['application/json'],
			});
			criteria.onPath({
				values: ['/data/*'],
			});
		})
		.setCaching({
			ttl: '4h',
		});

	// Some areas should never be cached.  Mark them as such
	offloadOriginGroup
		.onPath({
			values: ['/search'],
		})
		.name('No Store Items')
		.comment('The following paths should never cache.')
		.setCaching({
			behavior: 'NO_STORE',
		});

	// Set sitemaps to have 24 caching
	offloadOriginGroup
		.all(criteria => {
			criteria.onHostname({
				values: [hostname],
			});
			criteria.onPath({
				values: ['/sitemap/*-sitemap.xml', '/sitemap/??/*-sitemap.xml'],
			});
			criteria.onContentType({
				values: ['text/xml', 'application/xml'],
			});
		})
		.name('SiteMaps')
		.setCaching({
			ttl: '24h',
		});

	// Uncacheable content rules
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

module.exports = {
	offloadOrigin,
};
