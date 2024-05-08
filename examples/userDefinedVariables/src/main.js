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
 * An onClientRequest event handler that will access the created PMUSER variable and create a header.
 *
 * @param {any} request The request object
 */
export function onClientRequest(request) {
	// This will add a request header with the default value of `PCDN_TEST_1_VALUE_BASIC`
	request.addHeader('x-test-pcdn-sample-1', request.getVariable('PMUSER_PCDN_TEST_1'));
}

/**
 * An onOriginResponse header that will add a response header.
 *
 * @param {any} request The request object
 * @param {any} response The response object to add the header to
 */
export async function onOriginResponse(request, response) {
	// This will add a response header with the modified value of `PCDN_TEST_1_VALUE_ORIGIN_RESPONSE`
	response.addHeader('x-test-pcdn-sample-2', request.getVariable('PMUSER_PCDN_TEST_1'));
}

/**
 * An onClientResponse header that will add a response header.
 *
 * @param {any} request The request object
 * @param {any} response The response object to add the header to
 */
export async function onClientResponse(request, response) {
	// This will add a response header with the modified value of `PCDN_TEST_1_VALUE_CLIENT_RESPONSE`
	response.addHeader('x-test-pcdn-sample-3', request.getVariable('PMUSER_PCDN_TEST_1'));
}
