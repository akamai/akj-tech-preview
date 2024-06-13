/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */
/// <reference types="akamai-edgeworkers" />

type OnClientRequestHandler = (request: EW.IngressClientRequest) => void;
type OnOriginRequestHandler = (request: EW.IngressOriginRequest) => void;
type OnOriginResponseHandler = (request: EW.EgressOriginRequest, response: EW.EgressOriginResponse) => void;
type OnClientResponseHandler = (request: EW.EgressClientRequest, response: EW.EgressClientResponse) => void;

export const onClientRequest: OnClientRequestHandler = request => {
	request.addHeader('x-akamai-oCRq', 'onClientRequestTestHeader');
};

export const onOriginRequest: OnOriginRequestHandler = request => {
	request.addHeader('x-akamai-oORq', 'onOriginRequestTestHeader');
};

export const onOriginResponse: OnOriginResponseHandler = (request, response) => {
	const checkHeader = request.getHeader('x-akamai-oORq');
	if (checkHeader) {
		response.addHeader('x-akamai-oORs', 'onOriginResponseTestHeader');
	}
};

export const onClientResponse: OnClientResponseHandler = (request, response) => {
	const checkHeader = request.getHeader('x-akamai-oCRq');
	if (checkHeader) {
		response.addHeader('x-akamai-oCRs', 'onClientResponseTestHeader');
	}
};
