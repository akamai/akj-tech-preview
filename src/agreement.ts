/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE
 */

import {subtle} from 'node:crypto';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';
import {HttpRequestFn} from './akj/akj-impl';

/** Hash algorithm to we use to validate the content has gone both ways. */
export const DIGEST_ALG = 'SHA-256';

/** Name of the file that we write the agreement to. */
export const AGREEMENT_FILENAME = '.akj-agreed';

const ENDPOINT = 'https://akj-telemetry.edgekey.net/tc/';

/**
 * Encrypt the given text.
 *
 * @param {string} text Text to encrypt.
 * @returns {Promise<string>} The string is a JSON-formatted object that includes the key id and the encrypted text.
 */
async function encrypt(text: string): Promise<string> {
	const textAsBytes = new TextEncoder().encode(text);

	const publicJwk = {
		key_ops: ['encrypt'],
		ext: true,
		kty: 'RSA',
		n: 'rYkDW2ATEciUFqpIk2dfxuTSj3-BHissK-0cB9ahiUZ5Qaz1oGj__QtGWMEQiLjaf9VWYPgXdS7TZcOp-4s9HGseo0sA1QkXZ1FfCn5lqUToVGemPK4Bv1E6pvfv80UhjGg8JIs6Q9uh3JWPjoOsUsnF8Mid4TivYC_WkF9V2s7XwsyrLe-fcVx-a-uM-SsW-AZ4DbRttXLP-UJeiGowWRkKN4w3OT5hPIifXyJLKayXeKrmIen53hzQBwutUX_zI4wSMI6scEOGMOCTl6lA1M1kQbWOjCloZ-ayMUcRi0r2xuSGvGkR7QlcoGauU2ildkRHGOV7pSsuSxU1ytnXThH1XUwt3dXA8UHXPnBkZoeD27cDDnBhETb9agZ5mncBtYIhdfYU187sTCu0duopd9En_0-pFHaGrmgJndsNfUlS8rqnrN9Ywyrneb4mOaGzi1UP4LiH6Y9x4nQQwz3jqAKgHRDKXiWWA0f6Rtlm_PfbO1j3robQIQcUHORxtX_SrBGnekf1-ZRnvzrzbpiU63RfzaYd8_dvIAYfPt_Dk7bvX6jle3XiuJZSUu0_GrfVN9FM1wxx2R5AGElzsc1LtFIdbJMH21BqcB-X3oVgGcON81wU1LnxDGM02xcKgdXLFYtpDXz5-0HhdeAUrjbkea7K68ZBn60jqVSkreC1s-s',
		e: 'AQAB',
		alg: 'RSA-OAEP-512',
	};
	const key = await crypto.subtle.importKey('jwk', publicJwk, {name: 'RSA-OAEP', hash: 'SHA-512'}, false, [
		'encrypt',
	]);
	const encryptedText = await crypto.subtle.encrypt(
		{
			name: 'RSA-OAEP',
		},
		key,
		textAsBytes,
	);

	const versionedPayload = {
		key: 0,
		data: Buffer.from(encryptedText).toString('hex'),
	};

	return JSON.stringify(versionedPayload);
}

/**
 * Record a Terms-and-Conditions agreement.
 *
 * If you want to run this against the actual endpoint, use
 *
 *     import * as axios from 'axios';
 *     recordAgreement(axios.default.request, {});
 *
 * @param {HttpRequestFn} httpReq Function used to reach our endpoint. This should be the Axios request object -
 *   https://axios-http.com/docs/api_intro.
 * @param {object} payload An object to be serialized and passed to the endpoint.
 * @returns {Promise<undefined>} Resolves to `undefined` on success, or rejects with an `Error` if something goes wrong.
 *   On an Error, the CLI should terminate.
 */
export async function storeAgreementRemotely(httpReq: HttpRequestFn, payload: object): Promise<undefined> {
	const text = JSON.stringify(payload);

	const encryptedText = await encrypt(text);

	// Make the request
	const response = await httpReq({
		method: 'POST',
		url: ENDPOINT,
		data: encryptedText,
		// Prevent Axios from rejecting on a non-2xx response.
		validateStatus: null,
	});

	// Validate the response
	if (response.status !== 200) {
		throw new Error(`Unexpected ${response.status} from endpoint`);
	}

	if (typeof response.data !== 'string') {
		throw new Error(`Expected string - not ${typeof response.data}`);
	}

	// Make sure the endpoint dealt with the right data
	const remoteDigest = Buffer.from(response.data as string, 'hex');

	const digest = await subtle.digest(DIGEST_ALG, Buffer.from(encryptedText));

	if (!remoteDigest.equals(Buffer.from(digest))) {
		throw new Error(`Endpoint handshake did not match`);
	}

	return;
}

/**
 * Write a local agreement file into the passed directory.
 *
 * @param {string} homeDir The user's home directory.
 * @returns {Promise<void>} Nothing!
 */
export async function storeAgreementLocally(homeDir: string) {
	const target = path.join(homeDir, AGREEMENT_FILENAME);
	await fs.writeFile(target, '');
}

/**
 * Check that the local agreement exists in the passed directory.
 *
 * @param {string} homeDir The user's home directory.
 * @returns {Promise<boolean>} `true` if the file exists.
 */
export async function hasLocalAgreement(homeDir: string): Promise<boolean> {
	const target = path.join(homeDir, AGREEMENT_FILENAME);

	return fs
		.access(target, fs.constants.F_OK)
		.then(() => true)
		.catch(() => false);
}
