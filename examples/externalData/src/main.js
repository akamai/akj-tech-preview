/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

/**
 * A sample EW onClientRequest that adds a request header.
 *
 * @param {any} request The request object
 */
export function onClientRequest(request) {
	request.addHeader('x-pcdn-test-header', 'onClientRequest');
}

/**
 * A sample EW onClientResponse that adds a response header.
 *
 * @param {any} request The request object
 * @param {any} response The response object
 */
export function onClientResponse(request, response) {
	response.addHeader('x-pcdn-test-header2', 'onClientResponse');
}
