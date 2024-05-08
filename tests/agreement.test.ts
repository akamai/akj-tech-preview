/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */
import * as ag from '../src/agreement';
import {subtle} from 'node:crypto';
import {HttpRequestFn} from '../src/akj/akj-impl';

import {mkDirInTmp} from './ew.test';

/**
 * Create a mock {@link HttpRequestFn} that generates a digest that can be consumed by {@link ag.storeAgreementRemotely}.
 *
 * @returns {object} An async function that will similate a successful response from Store.
 */
export function mockStoreHttpRequestFn() {
	const reqMock = jest.fn();
	reqMock.mockImplementation(async (input: {data: string}) => {
		const digestBuffer = await subtle.digest(ag.DIGEST_ALG, Buffer.from(input.data));
		const digestHex = Buffer.from(digestBuffer).toString('hex');

		return {status: 200, data: digestHex};
	});

	return reqMock;
}

describe('Communication between the Reporter and the Store', () => {
	test('The Reporter succeeds on a 202 with the appropriate digest()', async () => {
		const payload = {text: 'doesNotMatter'};

		const reqMock = mockStoreHttpRequestFn();

		// Run
		const resp = await ag.storeAgreementRemotely(reqMock, payload);

		expect(resp).toBe(undefined);
		expect(reqMock).toHaveBeenCalled();
	});

	test('The Reporter fails if the Store returns something other than 204', async () => {
		const reqMock = jest.fn();
		reqMock.mockResolvedValue({status: 500, data: 'not used'});

		// Run
		await expect(async () => ag.storeAgreementRemotely(reqMock, {})).rejects.toThrow(
			'Unexpected 500 from endpoint',
		);
	});

	test('Nonstring from endpoint', async () => {
		const reqMock = jest.fn();
		reqMock.mockResolvedValue({status: 200, data: {iAm: 'json'}});

		// Run
		await expect(async () => ag.storeAgreementRemotely(reqMock, {})).rejects.toThrow(
			'Expected string - not object',
		);
	});

	test('The Reporter fails if the Store provides an incorrect digest() of the payload', async () => {
		const reqMock = jest.fn();
		reqMock.mockResolvedValue({status: 200, data: 'deadbeef'});

		// Run
		await expect(async () => ag.storeAgreementRemotely(reqMock, {})).rejects.toThrow(
			'Endpoint handshake did not match',
		);
	});

	test('The Reporter fails if the Store returns a non-hex payload', async () => {
		const reqMock = jest.fn();
		reqMock.mockResolvedValue({status: 200, data: '🤪not hex'});

		// Run
		await expect(async () => ag.storeAgreementRemotely(reqMock, {})).rejects.toThrow(
			'Endpoint handshake did not match',
		);
	});
});

describe('Local storage of agreement', () => {
	test('Empty dir does not contain agreement', async () => {
		const dir = mkDirInTmp();
		expect(await ag.hasLocalAgreement(dir)).toBeFalsy();
	});

	test('Agreement is detected', async () => {
		const dir = mkDirInTmp();
		await ag.storeAgreementLocally(dir);

		expect(await ag.hasLocalAgreement(dir)).toBeTruthy();
	});

	test("Overwrite doesn't cause an error", async () => {
		const dir = mkDirInTmp();

		// Sign once
		await ag.storeAgreementLocally(dir);
		expect(await ag.hasLocalAgreement(dir)).toBeTruthy();

		// Sign again
		await ag.storeAgreementLocally(dir);
		expect(await ag.hasLocalAgreement(dir)).toBeTruthy();

		// We've checked once, yes. What about third signature?
		await ag.storeAgreementLocally(dir);
		expect(await ag.hasLocalAgreement(dir)).toBeTruthy();
	});
});
