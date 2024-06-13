/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

/**
 * An
 * {@link https://techdocs.akamai.com/edgeworkers/docs/event-handler-functions#onclientrequest | onClientRequest handler.}
 *
 * @param {object} _request {@link https://techdocs.akamai.com/edgeworkers/docs/request-object|the request object}
 */
export function onClientRequest(_request) {}
/**
 * An onClientResponse handler
 *
 * @param {object} _request {@link https://techdocs.akamai.com/edgeworkers/docs/request-object|the request object}
 * @param {object} response {@link https://techdocs.akamai.com/edgeworkers/docs/response-object|the response object}
 */
export function onClientResponse(_request, response) {
	// if a successful response is returned, and it is text/html, and there is no Accept-CH header, add one.
	if (response.status === 200) {
		const contentType = response.getHeader('Content-Type');
		if (contentType && contentType[0].includes('text/html') && !response.getHeader('Accept-CH')) {
			response.addHeader('Accept-CH', 'DPR, Width, Viewport-Width, Downlink, Save-Data');
		}
	}
}

/**
 * An
 * {@link https://techdocs.akamai.com/edgeworkers/docs/event-handler-functions#onoriginrequest | onOriginRequest handler}
 *
 * @param {object} _request {@link https://techdocs.akamai.com/edgeworkers/docs/request-object|the request object}
 */
export async function onOriginRequest(_request) {}

/**
 * An
 * {@link https://techdocs.akamai.com/edgeworkers/docs/event-handler-functions#onoriginresponse | onOriginResponse handler}
 *
 * @param {object} _request {@link https://techdocs.akamai.com/edgeworkers/docs/request-object|the request object}
 * @param {object} _response {@link https://techdocs.akamai.com/edgeworkers/docs/response-object|the response object}
 */
export async function onOriginResponse(_request, _response) {}

/**
 * A {@link https://techdocs.akamai.com/edgeworkers/docs/event-handler-functions#responseprovider| ResponseProvider}
 *
 * @param {object} _request {@link https://techdocs.akamai.com/edgeworkers/docs/request-object|the request object}
 * @see {@link https://techdocs.akamai.com/edgeworkers/docs/response-orchestration | Response orchestration for more details}
 */
export async function responseProvider(_request) {}
