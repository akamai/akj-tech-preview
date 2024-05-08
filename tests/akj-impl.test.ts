/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import * as cli from '../src/akj/akj-impl';
import {Property} from '../src/types';
import {
	PropertyCoordinates,
	PropertyManagerAPI,
	ValidationErrors,
	VersionInfo,
	ConnectOrLoginError,
} from '../src/api/papi';
import {runWithNoChalk} from '../src/utils/pretty';
import {validate} from 'class-validator';
import path from 'node:path';
import {selectOrCreatePropertyVersion} from '../src/api/property-manager';
import {mockStoreHttpRequestFn} from './agreement.test';

/**
 * Test that an array contains the specified REGEX
 *
 * @param {string[]} values The array of values
 * @param {RegExp} regex The regex
 * @returns {boolean} True if one item matches the regex
 */
function testArrayContains(values: string[], regex: RegExp) {
	return values.some(string => regex.test(string));
}

/** Sample content of property.json file */
const TRIVIAL_PROPERTY_JS: PropertyCoordinates = {
	contractId: 'c',
	groupId: '5',
	propertyId: 'pI',
	accountSwitchKey: 'a',
	edgeWorkerId: 6,
	authorEmail: 'noreply@akamai.com',
	autoSemVer: false,
};

/** Helper for {@link expectTermination()} that bundles the output streams into the exception. */
class HasStreamsException extends Error {
	public stdout: string[];
	public stderr: string[];

	constructor(msg: string, stdout: string[], stderr: string[]) {
		super(msg);
		this.stdout = stdout;
		this.stderr = stderr;
	}
}

/**
 * Run the CLI. Allows you to write a test by switching defaults easily.
 *
 * @param {object} root0 The parameters needed to run the CLI
 * @param {function(Property): Property} root0.onConfig The onConfig property
 * @param {function(string): Promise<object>} root0.loadFile The sample property json
 * @param {boolean} root0.isDryRun True to not actually do the command
 * @param {boolean} root0.printPapiJson True to print papi JSON to the output
 * @param {function(): PropertyManagerAPI} root0.papiApi The PAPI to call. Mocked of course.
 * @param {(primitives: cli.CliPrimitives, ewId: number, codePath: string) => Promise<Uint8Array>} root0.buildTarballInMemory
 *   Function that pretends to build the EdgeWorker bundle in memory.
 * @param {string} root0.createEdgeHostNameOption How to create the edge hostname
 * @param {string[]} root0.argvs Arguments to be passed to `pcdn`'s {@link parseArgs()}. This defaults to run the tool.
 * @param {boolean} root0.hasLocalAgreement `true` if the user has an agreement file in their home dir, `false`
 *   otherwise.
 * @returns {Promise<{stdout: string; stderr: string}>} Stdout and stderr that collect outputs
 */
async function run({
	// These are default values - notice that each one gets an actual value.
	onConfig = (c: Property): Property => c,
	loadFile = (_arg: string) => Promise.resolve(JSON.stringify(TRIVIAL_PROPERTY_JS)),
	isDryRun = true,
	printPapiJson = true,
	papiApi = () => {
		throw new Error('Mock PAPI API undefined. You should define your own.');
	},
	buildTarballInMemory = () => Promise.resolve(new Uint8Array()),
	createEdgeHostNameOption = 'standard',
	argvs = ['activate', '-p', 'path to property.json'],
	hasLocalAgreement = true,
}: {
	// This is the definition of arguments. Each is declared as optional the callers can replace one or more of them.
	onConfig?: (_: Property) => Property;
	loadFile?: (_: string) => Promise<{toString: () => string}>;
	isDryRun?: boolean;
	printPapiJson?: boolean;
	papiApi?: () => PropertyManagerAPI;
	buildTarballInMemory?: {(primitives: cli.CliPrimitives, ewId: number, codePath: string): Promise<Uint8Array>};
	createEdgeHostNameOption?: string;
	argvs?: string[];
	hasLocalAgreement?: boolean;
}): Promise<{stdout: string[]; stderr: string[]}> {
	const primitives: cli.CliPrimitives = {
		importer: () => Promise.resolve({onConfig: onConfig}),
		terminate: msg => {
			throw new HasStreamsException(msg, primitives.stdout.saved(), primitives.stderr.saved());
		},
		loadFile,
		papiApi,
		buildTarballInMemory,
		stdout: new cli.StdOutCollector(),
		stderr: new cli.StdErrCollector(),
		statusUpdator: new cli.NoopStatusUpdator(),

		printOutput: () => {
			primitives.stdout.print();
			primitives.stderr.print();
		},

		httpRequest: mockStoreHttpRequestFn as unknown as cli.HttpRequestFn,
		storeLocalAgreementInHome: async () => Promise.resolve(),
		checkLocalAgreementInHome: async () => Promise.resolve(hasLocalAgreement),
	};

	const argv = ['/usr/local/bin/node', 'akj.js'].concat(argvs);
	if (isDryRun) {
		argv.push('--dry-run');
	}

	// print the papi json in tests
	if (printPapiJson) {
		argv.push('--print-papi-json');
	}

	const cb = async function (): Promise<{stdout: string[]; stderr: string[]}> {
		const args = cli.parseArgs(argv, primitives.terminate);

		if (args.init) {
			await cli.getOrCreateEdgeHostName('contract', 'group', createEdgeHostNameOption, 'hello.com', papiApi());
		} else {
			await cli.runActivation(args, primitives);
		}

		return {
			stdout: primitives.stdout.saved(),
			stderr: primitives.stderr.saved(),
		};
	};

	return await runWithNoChalk(cb());
}

/**
 * Creates a mock PropertyManagerAPI with sane values for a creation workflow
 *
 * @returns {any} The mock API
 */
function mockPapiApi(): {
	latestPropertyVersion: jest.Mock;
	createPropertyVersion: jest.Mock;
	saveRulesIntoPropertyVersion: jest.Mock;
	activatePropertyVersion: jest.Mock;
	validateEdgeWorkerBundle: jest.Mock;
	createEdgeWorkerVersion: jest.Mock;
	activateEdgeWorkerVersion: jest.Mock;
	createEdgeHostNames: jest.Mock;
	listEdgeHostNames: jest.Mock;
	viewProfile: jest.Mock;
} {
	const api = {
		latestPropertyVersion: jest.fn(),
		createPropertyVersion: jest.fn(),
		saveRulesIntoPropertyVersion: jest.fn(),
		activatePropertyVersion: jest.fn(),
		validateEdgeWorkerBundle: jest.fn(),
		createEdgeWorkerVersion: jest.fn(),
		activateEdgeWorkerVersion: jest.fn(),
		createEdgeHostNames: jest.fn(),
		listEdgeHostNames: jest.fn(),
		viewProfile: jest.fn(),
	};

	api.latestPropertyVersion.mockResolvedValue({
		propertyVersion: 6,
		productionStatus: 'ACTIVE',
		stagingStatus: 'INACTIVE',
	} as VersionInfo);

	api.saveRulesIntoPropertyVersion.mockResolvedValue(ValidationErrors.for_test());
	api.createPropertyVersion.mockResolvedValue(7);
	api.activatePropertyVersion.mockResolvedValue({
		status: 200,
		body: 'body',
		activationLink: '/papi/v1/properties/pI/activations/6666',
	});

	api.validateEdgeWorkerBundle.mockResolvedValue({errors: [], warnings: []});
	api.createEdgeWorkerVersion.mockResolvedValue({edgeWorkerId: 10, version: 'v5'});
	api.activateEdgeWorkerVersion.mockResolvedValue(undefined);
	api.createEdgeHostNames.mockResolvedValue('ehn_1332');
	api.listEdgeHostNames.mockResolvedValue([]);

	api.viewProfile.mockResolvedValue({uiUserName: 'vpName', uiIdentityId: 'vpId', accountId: 'vpAcctId'});

	return api;
}

/**
 * Helper for {@link run} that ensures termination occurs and passes back the output streams in the
 * {@link HasStreamsException}.
 *
 * @param {Promise<{stdout: string; stderr: string}>} runPromise The promise to run and check for exceptions
 * @returns {Promise<HasStreamsException>} The exception that is caught.
 */
async function expectTermination(
	runPromise: Promise<{stdout: string[]; stderr: string[]}>,
): Promise<HasStreamsException> {
	let ex: HasStreamsException | undefined;

	try {
		await runPromise;
	} catch (exception) {
		expect(exception).toBeInstanceOf(HasStreamsException);
		ex = exception as HasStreamsException;
	}

	if (typeof ex === 'undefined') {
		throw new Error("CLI didn't terminate()");
	}

	return ex;
}

describe('CLI Unit Tests', () => {
	test('Verify --print-papi-json being not provided does not print PAPI json to the output', async () => {
		const onConfig = function (cfg: Property): Property {
			cfg.setModifyOutgoingResponseHeader({
				action: 'ADD',
				avoidDuplicateHeaders: false,
				customHeaderName: 'x-custom-header-name',
				headerValue: 'header value',
				matchMultiple: false,
				newHeaderValue: 'new header value',
				regexHeaderMatch: 'regex header match',
				regexHeaderReplace: 'false',
				standardAddHeaderName: 'OTHER',
				standardDeleteHeaderName: 'OTHER',
				standardModifyHeaderName: 'OTHER',
			});
			return cfg;
		};

		const output = await run({onConfig, printPapiJson: false});
		expect(output.stdout.length).toBe(0);
	});

	test('Verify --version/-V emits a version', async () => {
		const err = await expectTermination(
			run({
				argvs: ['-V'],
				isDryRun: true,
			}),
		);

		expect(err.message).toMatch(/\d+\.\d+\.\d+/);
	});

	test('Verify we can run a given file', async () => {
		const onConfig = function (cfg: Property): Property {
			cfg.setModifyOutgoingResponseHeader({
				action: 'ADD',
				avoidDuplicateHeaders: false,
				customHeaderName: 'x-custom-header-name',
				headerValue: 'header value',
				matchMultiple: false,
				newHeaderValue: 'new header value',
				regexHeaderMatch: 'regex header match',
				regexHeaderReplace: 'false',
				standardAddHeaderName: 'OTHER',
				standardDeleteHeaderName: 'OTHER',
				standardModifyHeaderName: 'OTHER',
			});
			return cfg;
		};

		const output = await run({onConfig});

		expect(JSON.parse(output.stdout.join('/n'))).toMatchObject({
			rules: {
				behaviors: [
					{
						name: 'modifyOutgoingResponseHeader',
						options: {
							action: 'ADD',
						},
					},
				],
			},
		});
	});

	test('Verify base argument is optional', async () => {
		const api = mockPapiApi();
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				papiApi: () => api as unknown as PropertyManagerAPI,
				argvs: ['activate', 'path to base directory'],
			});
		};
		expect(t).not.toThrow();
	});

	test('Verify options for property activation does not show in pcdn -help command', async () => {
		const err = await expectTermination(
			run({
				argvs: ['--help'],
			}),
		);

		expect(err.message).not.toContain('-p, --property <path>');
		expect(err.message).not.toContain('-d, --dry-run');
		expect(err.message).not.toContain('-w, --ignore-warnings');
		expect(err.message).not.toContain('-j, --print-papi-json');
	});
	test('Verify options for property activation are not available for init command', async () => {
		const err = await expectTermination(
			run({
				argvs: ['init', '-w'],
			}),
		);
		expect(err.message).toContain("error: unknown option '-w'");
	});

	describe('PropertyInfo Validation Tests', () => {
		const propertyId = 'prp_1028771';
		const contractId = 'ctr_M-28TSPSQ';
		const groupId = 'grp_117225';
		const edgeWorkerId = 1;
		const accountSwitchKey = 'B-M-28QYF3M:1-8BYUX';
		const authorEmail = 'email@address.com';

		test('Verify PropertyInfo Loads Valid file', async () => {
			const temp = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const prop = cli.PropertyInfo.createPropertyInfo(temp);
			expect(prop.propertyId).toBe(propertyId);
			expect(prop.contractId).toBe(contractId);
			expect(prop.groupId).toBe(groupId);
			expect(prop.edgeWorkerId).toBe(edgeWorkerId);
			expect(prop.accountSwitchKey).toBe(accountSwitchKey);
			expect(prop.authorEmail).toBe(authorEmail);

			const validationErrors = await validate(prop);
			expect(validationErrors.length).toBe(0);
		});

		test('Verify PropertyInfo Fails to Load with invalid propertyId', async () => {
			const emptyPropertyId = JSON.parse(`
				{
					"propertyId": "",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const emptyPropertyIdInfo = cli.PropertyInfo.createPropertyInfo(emptyPropertyId);
			const emptyPropertyIdValidationErrors = await validate(emptyPropertyIdInfo);
			expect(emptyPropertyIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(emptyPropertyIdValidationErrors)).toBe(
				'propertyId should not be empty.',
			);

			const missingPropertyId = JSON.parse(`
				{
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const missingPropertyIdInfo = cli.PropertyInfo.createPropertyInfo(missingPropertyId);
			const missingPropertyIdValidationErrors = await validate(missingPropertyIdInfo);
			expect(missingPropertyIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(missingPropertyIdValidationErrors)).toBe(
				'propertyId should not be empty.',
			);
		});

		test('Verify PropertyInfo Fails to Load with invalid contractId', async () => {
			const emptyContractId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const emptyContractIdInfo = cli.PropertyInfo.createPropertyInfo(emptyContractId);
			const emptyContractIdValidationErrors = await validate(emptyContractIdInfo);
			expect(emptyContractIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(emptyContractIdValidationErrors)).toBe(
				'contractId should not be empty.',
			);

			const missingContractId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const missingContractIdInfo = cli.PropertyInfo.createPropertyInfo(missingContractId);
			const missingContractIdValidationErrors = await validate(missingContractIdInfo);
			expect(missingContractIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(missingContractIdValidationErrors)).toBe(
				'contractId should not be empty.',
			);
		});

		test('Verify PropertyInfo Fails to Load with invalid groupId', async () => {
			const emptyGroupId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const emptyGroupIdInfo = cli.PropertyInfo.createPropertyInfo(emptyGroupId);
			const emptyGroupIdValidationErrors = await validate(emptyGroupIdInfo);
			expect(emptyGroupIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(emptyGroupIdValidationErrors)).toBe(
				'groupId should not be empty.',
			);

			const missingGroupId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const missingGroupIdInfo = cli.PropertyInfo.createPropertyInfo(missingGroupId);
			const missingGroupIdValidationErrors = await validate(missingGroupIdInfo);
			expect(missingGroupIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(missingGroupIdValidationErrors)).toBe(
				'groupId should not be empty.',
			);
		});

		test('Verify PropertyInfo Fails to Load with invalid edgeWorkerId', async () => {
			const negativeGroupId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": -1,
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const negativeGroupIdInfo = cli.PropertyInfo.createPropertyInfo(negativeGroupId);
			const negativeGroupIdValidationErrors = await validate(negativeGroupIdInfo);
			expect(negativeGroupIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(negativeGroupIdValidationErrors)).toBe(
				'edgeWorkerId must be a positive number.',
			);

			const missingEdgeWorkerId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const missingEdgeWorkerIdInfo = cli.PropertyInfo.createPropertyInfo(missingEdgeWorkerId);
			const missingEdgeWorkerIdValidationErrors = await validate(missingEdgeWorkerIdInfo);
			expect(missingEdgeWorkerIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(missingEdgeWorkerIdValidationErrors)).toBe(
				'edgeWorkerId must be a positive number.',
			);

			const stringEdgeWorkerId = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": "1",
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}"
				}
			`);
			const stringEdgeWorkerIdInfo = cli.PropertyInfo.createPropertyInfo(stringEdgeWorkerId);
			const stringEdgeWorkerIdValidationErrors = await validate(stringEdgeWorkerIdInfo);
			expect(stringEdgeWorkerIdValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(stringEdgeWorkerIdValidationErrors)).toBe(
				'edgeWorkerId must be a positive number.',
			);
		});

		test('Verify PropertyInfo Fails to Load with invalid authorEmail', async () => {
			const emptyAuthorEmail = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": ""
				}
			`);
			const emptyAuthorEmailInfo = cli.PropertyInfo.createPropertyInfo(emptyAuthorEmail);
			const emptyAuthorEmailValidationErrors = await validate(emptyAuthorEmailInfo);
			expect(emptyAuthorEmailValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(emptyAuthorEmailValidationErrors)).toBe(
				'authorEmail must be an email.',
			);

			const missingAuthorEmail = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}"
				}
			`);
			const missingAuthorEmailInfo = cli.PropertyInfo.createPropertyInfo(missingAuthorEmail);
			const missingAuthorEmailValidationErrors = await validate(missingAuthorEmailInfo);
			expect(missingAuthorEmailValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(missingAuthorEmailValidationErrors)).toBe(
				'authorEmail must be an email.',
			);

			const invalidAuthorEmail = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"edgeWorkerId": ${edgeWorkerId},
					"groupId": "${groupId}",
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "iamnotanemail"
				}
			`);
			const invalidAuthorEmailInfo = cli.PropertyInfo.createPropertyInfo(invalidAuthorEmail);
			const invalidAuthorEmailValidationErrors = await validate(invalidAuthorEmailInfo);
			expect(invalidAuthorEmailValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(invalidAuthorEmailValidationErrors)).toBe(
				'authorEmail must be an email.',
			);
		});

		test('Verify PropertyInfo Fails to Load with invalid accountSwitchKey', async () => {
			const emptyAccountSwitchKey = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "",
					"authorEmail": "${authorEmail}"
				}
			`);
			const emptyAccountSwitchKeyInfo = cli.PropertyInfo.createPropertyInfo(emptyAccountSwitchKey);
			const emptyAccountSwitchKeyValidationErrors = await validate(emptyAccountSwitchKeyInfo);
			expect(emptyAccountSwitchKeyValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(emptyAccountSwitchKeyValidationErrors)).toBe(
				'accountSwitchKey should not be empty.',
			);

			const invalidAccountSwitchKeyType = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": 1234,
					"authorEmail": "${authorEmail}"
				}
			`);
			const invalidAccountSwitchKeyTypeInfo = cli.PropertyInfo.createPropertyInfo(invalidAccountSwitchKeyType);
			const invalidAccountSwitchKeyTypeValidationErrors = await validate(invalidAccountSwitchKeyTypeInfo);
			expect(invalidAccountSwitchKeyTypeValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(invalidAccountSwitchKeyTypeValidationErrors)).toBe(
				'accountSwitchKey must be a string.',
			);
		});

		test('Verify PropertyInfo deals with an invalid autoSemVer', async () => {
			const invalidAutoSemVerType = JSON.parse(`
				{
					"propertyId": "${propertyId}",
					"contractId": "${contractId}",
					"groupId": "${groupId}",
					"edgeWorkerId": ${edgeWorkerId},
					"accountSwitchKey": "${accountSwitchKey}",
					"authorEmail": "${authorEmail}",
					"autoSemVer":"true"
				}
			`);
			const invalidAutoSemVerTypeInfo = cli.PropertyInfo.createPropertyInfo(invalidAutoSemVerType);
			const invalidAutoSemVerTypeValidationErrors = await validate(invalidAutoSemVerTypeInfo);
			expect(invalidAutoSemVerTypeValidationErrors.length).toBe(1);
			expect(cli.PropertyInfo.formatValidationErrors(invalidAutoSemVerTypeValidationErrors)).toBe(
				'autoSemVer must be a boolean value.',
			);
		});
	});
});

describe('Data integrity tests for property.json', () => {
	test('Raise an error when property.json cannot load', async () => {
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: unknown) => {
					throw new Error('my reason');
				},
			});
		};

		await expect(t).rejects.toThrow(/Failed to read .*: my reason/);
	});

	test('Raise an error when property.json is not JSON', async () => {
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: unknown) => Promise.resolve('not json'),
			});
		};

		await expect(t).rejects.toThrow(/Could not parse .* as JSON/);
	});

	test('Raise an error when property.json is missing fields', async () => {
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: unknown) =>
					Promise.resolve(
						JSON.stringify({
							contractId: 'c',
							groupId: 'g',
							// propertyId is missing
						}),
					),
			});
		};

		await expect(t).rejects.toThrow(/.*edgeWorkerId must be a positive number,.*authorEmail must be an email/);
	});

	test('Raise an error when accountSwitchKey has non-string value in property.json', async () => {
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: string) =>
					Promise.resolve(
						JSON.stringify({
							propertyId: 'p',
							contractId: 'c',
							groupId: 'g',
							accountSwitchKey: 124,
							authorEmail: 'test@akamai.com',
						}),
					),
			});
		};
		await expect(t).rejects.toThrow(
			/.*accountSwitchKey must be a string,.*edgeWorkerId must be a positive number./,
		);
	});

	test('Verify that accountSwitchKey can be added in property.json', async () => {
		const papiMock = mockPapiApi();
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: string) =>
					Promise.resolve(
						JSON.stringify({
							propertyId: 'p',
							contractId: 'c',
							groupId: 'g',
							accountSwitchKey: 'a',
							edgeWorkerId: 92,
							authorEmail: 'test@akamai.com',
						} as PropertyCoordinates),
					),
				papiApi: () => papiMock as unknown as PropertyManagerAPI,
			});
		};
		await expect(t).not.toThrow();
	});

	test('Verify accountSwitchKey in property.json can be passed in to the papiApi', async () => {
		const papiMock = mockPapiApi();

		await run({
			loadFile: () =>
				Promise.resolve(
					JSON.stringify({
						propertyId: 'p',
						contractId: 'c',
						groupId: 'g',
						accountSwitchKey: 'accountSwitchKey in Json',
						edgeWorkerId: 12,
						authorEmail: 'test@akamai.com',
					} as PropertyCoordinates),
				),
			papiApi: () => papiMock as unknown as PropertyManagerAPI,
			isDryRun: false,
		});

		expect(papiMock.latestPropertyVersion).toHaveBeenCalledWith(
			expect.objectContaining({accountSwitchKey: 'accountSwitchKey in Json'}),
		);
	});
	test('Raise an error when authorEmail is missing in property.json', async () => {
		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				loadFile: (_: unknown) =>
					Promise.resolve(
						JSON.stringify({
							contractId: 'c',
							groupId: '5',
							propertyId: 'pI',
							accountSwitchKey: 'a',
							edgeWorkerId: 6,
							// authorEmail is missing
						}),
					),
			});
		};

		await expect(t).rejects.toThrow(/.* Error: authorEmail must be an email./);
	});
	test('Verify authorEmail in property.json can be passed in to the papiApi', async () => {
		const papiMock = mockPapiApi();

		await run({
			loadFile: () => Promise.resolve(JSON.stringify(TRIVIAL_PROPERTY_JS as PropertyCoordinates)),
			papiApi: () => papiMock as unknown as PropertyManagerAPI,
			isDryRun: false,
		});

		expect(papiMock.activatePropertyVersion).toHaveBeenCalledWith(
			expect.objectContaining({authorEmail: 'noreply@akamai.com'}),
			expect.anything(),
			'STAGING',
		);
	});
});

// Verify PCDN CLI's use of PAPI
describe('PAPI Tests', () => {
	test('Verify we respect --dry-run', async () => {
		const papiMock = mockPapiApi();
		const out = await run({
			isDryRun: true,
			papiApi: () => papiMock as unknown as PropertyManagerAPI,
			loadFile: () => {
				throw new Error('Config files should not be loaded');
			},
		});

		expect(out.stderr).toContain('--dry-run is set. Not uploading PAPI JSON to Property Manager.\n');
		expect(papiMock.validateEdgeWorkerBundle).not.toHaveBeenCalled();
		expect(papiMock.validateEdgeWorkerBundle).not.toHaveBeenCalled();
	});

	test('Verify that a bundle validation failure is displayed, and it prevents EW activation', async () => {
		const api = mockPapiApi();
		// Initialize the error result
		api.validateEdgeWorkerBundle.mockResolvedValue({
			errors: [
				{
					type: 'INVALID_FILE_PERMISSION',
					message: 'Invalid file permission : The main.js file cannot be executable.',
				},
				{
					type: 'STATIC_VALIDATION_FAILED',
					message: "Static validation failed : main.js::2:3 SyntaxError: Unexpected identifier 'x'",
				},
			],
			warnings: [],
		});

		// Execute the EdgeWorker portion of the CLI
		const {stderr} = await expectTermination(
			run({
				isDryRun: false,
				papiApi: () => api as unknown as PropertyManagerAPI,
			}),
		);

		// Validate that we got error messages
		expect(testArrayContains(stderr, /INVALID_FILE_PERMISSION/)).toBeTruthy();
		expect(
			testArrayContains(stderr, /Invalid file permission : The main.js file cannot be executable./),
		).toBeTruthy();

		expect(testArrayContains(stderr, /STATIC_VALIDATION_FAILED/)).toBeTruthy();
		expect(
			testArrayContains(stderr, /Static validation failed : main.js::2:3 SyntaxError: Unexpected identifier 'x'/),
		).toBeTruthy();

		// Verify that we terminated before creating/activating the EdgeWorker
		expect(api.createEdgeWorkerVersion).not.toHaveBeenCalled();
		expect(api.activateEdgeWorkerVersion).not.toHaveBeenCalled();
	});

	test('Verify we activate EdgeWorkers on STAGING when --prod is missing', async () => {
		const api = mockPapiApi();

		await run({
			isDryRun: false,
			papiApi: () => api as unknown as PropertyManagerAPI,
		});

		expect(api.activatePropertyVersion).toHaveBeenCalledWith(expect.anything(), expect.anything(), 'STAGING');
		expect(api.activateEdgeWorkerVersion).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
			'STAGING',
		);
	});

	test('Verify error message is displayed when --prod is specified but not enabled in environment variable ', async () => {
		const api = mockPapiApi();

		const err = await expectTermination(
			run({
				isDryRun: false,
				papiApi: () => api as unknown as PropertyManagerAPI,
				argvs: ['--prod', '.'],
			}),
		);

		expect(err.message).toContain("unknown option '--prod'");

		expect(api.activatePropertyVersion).not.toHaveBeenCalledWith();
		expect(api.activateEdgeWorkerVersion).not.toHaveBeenCalled();
	});

	test('Verify we create new property versions when necessary', async () => {
		const api = mockPapiApi();

		const version = await selectOrCreatePropertyVersion(
			api as unknown as PropertyManagerAPI,
			{} as PropertyCoordinates,
		);

		expect(version).toEqual(7);
		expect(api.latestPropertyVersion).toHaveBeenCalledTimes(1);
		expect(api.createPropertyVersion).toHaveBeenCalledTimes(1);
	});

	test('Verify we reuse property versions when possible', async () => {
		const api = {
			latestPropertyVersion: jest.fn(),
			createPropertyVersion: jest.fn(),
		};

		api.latestPropertyVersion.mockResolvedValue({
			propertyVersion: 3,
			productionStatus: 'INACTIVE',
			stagingStatus: 'INACTIVE',
		} as VersionInfo);

		api.createPropertyVersion.mockResolvedValue(7);

		const version = await selectOrCreatePropertyVersion(
			api as unknown as PropertyManagerAPI,
			{} as PropertyCoordinates,
		);

		expect(version).toEqual(3);
		expect(api.latestPropertyVersion).toHaveBeenCalledTimes(1);
		expect(api.createPropertyVersion).toHaveBeenCalledTimes(0);
	});

	test('Verify a new standard TLS edge hostname will be created if customer chooses to create one', async () => {
		const api = mockPapiApi();
		await run({
			isDryRun: false,
			printPapiJson: false,
			papiApi: () => api as unknown as PropertyManagerAPI,
			argvs: ['init'],
		});
		expect(api.listEdgeHostNames).not.toHaveBeenCalled();
		expect(api.createEdgeHostNames).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
			false,
		);
	});

	test('Verify a new enhanced TLS edge hostname will be created if customer chooses to create one', async () => {
		const api = mockPapiApi();
		await run({
			isDryRun: false,
			printPapiJson: false,
			papiApi: () => api as unknown as PropertyManagerAPI,
			argvs: ['init'],
			createEdgeHostNameOption: 'enhanced',
		});
		expect(api.listEdgeHostNames).not.toHaveBeenCalled();
		expect(api.createEdgeHostNames).toHaveBeenCalledWith(
			expect.anything(),
			expect.anything(),
			expect.anything(),
			true,
		);
	});
});

describe('Line-of-code mapping', () => {
	// The leading hash is not compliant with the JSON pointer spec, or the JSON error spec. Ignore it.
	test('Ignore leading hash', () => {
		const obj = {
			behaviors: [
				{
					name: 'a',
					__loc: 'a-loc',
				},
			],
		};

		expect(cli.resolveLineOfCode(obj, '#/behaviors/0')).toEqual('a-loc');
	});

	test('Verify lookup in the targeted object', () => {
		const obj = {
			behaviors: [
				{
					name: 'a',
					__loc: 'a-loc',
				},
				{
					name: 'b',
					__loc: 'b-loc',
				},
			],
			__loc: 'outer-loc',
		};

		expect(cli.resolveLineOfCode(obj, '/behaviors/0')).toEqual('a-loc');
		expect(cli.resolveLineOfCode(obj, '/behaviors/1')).toEqual('b-loc');

		// I'm not sure we would ever walk this far up, but let's pretend.
		expect(cli.resolveLineOfCode(obj, '#')).toEqual('outer-loc');
	});

	test('Verify lookup in an ancestor object', () => {
		const obj = {
			rules: {
				name: 'default',
				behaviors: [
					{
						name: 'caching',
						options: {
							mustRevalidate: false,
							ttl: '7d',
							behavior: 'CACHE_CONTROL',
							defaultTtl: '3d',
						},
						__loc: '/config.js:17',
					},
				],
			},
		};

		expect(cli.resolveLineOfCode(obj, '/rules/behaviors/0/options/httpsPort')).toEqual('/config.js:17');
		expect(cli.resolveLineOfCode(obj, '/rules/behaviors/')).toEqual(undefined);
	});
});

describe('CLI Display of Errors/Warnings', () => {
	test('terminate() must show a message', () => {
		const primitives = new cli.PCDNCliPrimitives();

		const mockExit = jest.spyOn(process, 'exit').mockImplementationOnce(() => {
			return undefined as never;
		});
		const mockStdErrPrint = jest.spyOn(primitives.stderr, 'print').mockImplementation(() => {
			expect(primitives.stderr.saved()).toMatchObject([
				// We match the substring because terminate adds some whitespace.
				expect.stringContaining('MessagE'),
			]);
		});

		primitives.terminate('MessagE');

		expect(mockExit).toHaveBeenCalledWith(1);
		expect(mockStdErrPrint).toHaveBeenCalledTimes(1);
		mockExit.mockRestore();
		mockStdErrPrint.mockRestore();
	});

	test('Display 403s as login errors', async () => {
		const papiMock = {
			latestPropertyVersion: jest.fn(() => {
				throw new ConnectOrLoginError('ignored', 403, {});
			}),
		};

		const t: () => Promise<void> = async () => {
			await run({
				isDryRun: false,
				papiApi: () => papiMock as unknown as PropertyManagerAPI,
			});
		};

		await expect(t).rejects.toThrow(/Login failed. Check your credentials./);
	});

	test('Display property and edgeworker activation success info when both succeed.', async () => {
		const propertyVersion = 999;
		const activationID = 2222;
		const edgeworkerVersion = '2.5.6';
		const edgeworkerID = 333;
		const papiMock = {
			latestPropertyVersion: jest.fn(() => {
				return {
					propertyVersion,
					productionStatus: 'INACTIVE',
					stagingStatus: 'INACTIVE',
				};
			}),
			saveRulesIntoPropertyVersion: jest.fn(() => {
				return {
					errors: [],
					warnings: [],
				};
			}),
			activatePropertyVersion: jest.fn(() => {
				return {
					status: 201,
					body: 'test',
					activationLink: `/papi/v1/properties/${propertyVersion}/activations/${activationID}`,
				};
			}),
			validateEdgeWorkerBundle: jest.fn(() => {
				return {
					errors: [],
				};
			}),
			createEdgeWorkerVersion: jest.fn(() => {
				return {edgeWorkerId: edgeworkerID, version: edgeworkerVersion};
			}),
			activateEdgeWorkerVersion: jest.fn(() => {}),
		};

		const activationResults = await run({
			isDryRun: false,
			papiApi: () => papiMock as unknown as PropertyManagerAPI,
		});
		const stderr = activationResults.stderr;
		// The returned stderr length should be 2, for property and edgeworker.
		expect(stderr).toHaveLength(2);

		// Inpect property activation log.
		const propertyLog = stderr[0];
		expect(propertyLog).toContain(`Activating version ${propertyVersion} of property pI`);

		// Inspect edgeworker activation log.
		const edgeworkerLog = stderr[1];
		expect(edgeworkerLog).toContain(`Activating version ${edgeworkerVersion} of EdgeWorker ${edgeworkerID}.`);
	});

	test('Still display property activation success info when property activation succeeds but edgeworker activation failed', async () => {
		const propertyVersion = 999;
		const activationID = 2222;
		const edgeworkerErr = 'EdgeWorker bundle validation should fail.';
		const papiMock = {
			latestPropertyVersion: jest.fn(() => {
				return {
					propertyVersion,
					productionStatus: 'INACTIVE',
					stagingStatus: 'INACTIVE',
				};
			}),
			saveRulesIntoPropertyVersion: jest.fn(() => {
				return {
					errors: [],
					warnings: [],
				};
			}),
			activatePropertyVersion: jest.fn(() => {
				return {
					status: 201,
					body: 'test',
					activationLink: `/papi/v1/properties/${propertyVersion}/activations/${activationID}`,
				};
			}),
			validateEdgeWorkerBundle: jest.fn(() => {
				return {
					errors: [
						{
							type: 'not-important',
							message: edgeworkerErr,
						},
					],
				};
			}),
		};

		const err = await expectTermination(
			run({
				isDryRun: false,
				papiApi: () => papiMock as unknown as PropertyManagerAPI,
			}),
		);

		const combinedStdErr = err.stderr.join('');
		expect(combinedStdErr).toContain(`Activating version ${propertyVersion} of property pI`);
		expect(combinedStdErr).toContain(edgeworkerErr);
	});

	test('Errors have errorLocation property mapped and output text emitted', async () => {
		const papiMock = {
			// Ugh. We need this to get as far as saving the rules (next call).
			latestPropertyVersion: jest.fn(
				(): Promise<VersionInfo> =>
					Promise.resolve({
						propertyVersion: 999,
						productionStatus: 'INACTIVE',
						stagingStatus: 'INACTIVE',
					}),
			),
			saveRulesIntoPropertyVersion: jest.fn(
				(): Promise<ValidationErrors> =>
					Promise.resolve(
						ValidationErrors.from_validation_results({
							errors: [
								{
									// Verify that we append option names. The type must be set so the errorLocation will be used to determine the missing attribute name.
									type: 'https://problems.luna.akamaiapis.net/papi/v0/validation/attribute_required',
									errorLocation: '#/rules/behaviors/0/options/nonexistent-option',
									detail: 'detailText',
								},
								{
									// This is a bad type - we don't know what it is, but it should still display.
									type: 'unknown type, should break some mappings',
									// The errorLocation is an invalid pointer. It should be written into the output verbatim.
									errorLocation: '#/invalid/location',
									detail: 'unmapped error',
								},
								{
									// This caused EW-20559 - omitting `errorLocation` shouldn't be fatal.
									title: 'Unstable rule format',
									type: 'https://problems.luna.akamaiapis.net/papi/v0/unstable_rule_format',
									detail: 'This property is using `latest` rule format, which is designed to reflect interface changes immediately. We suggest converting the property to a stable rule format such as `v2024-02-12` to minimize the risk of interface changes breaking your API client program.',
									currentRuleFormat: 'latest',
									suggestedRuleFormat: 'v2024-02-12',
								},
							],
							warnings: [],
						}),
					),
			),
		};

		const ex = await expectTermination(
			run({
				isDryRun: false,
				papiApi: () => papiMock as unknown as PropertyManagerAPI,
				onConfig: (prop: Property): Property => {
					// We need to include a command so the `.__loc` property is generated, since that's needed to map the `errorLocation` to a line of code.
					prop.setAllowPut({enabled: true});
					return prop;
				},
			}),
		);

		expect(
			testArrayContains(
				ex.stderr,
				new RegExp(
					`.*ERROR ${path.relative(process.cwd(), __filename)}:[0-9]+ - detailText \\(Add option nonexistent-option\\).*`,
					's',
				),
			),
		).toBeTruthy();
		expect(testArrayContains(ex.stderr, new RegExp(`ERROR #/invalid/location - unmapped error`))).toBeTruthy();

		expect(
			testArrayContains(
				ex.stderr,
				/ERROR {2}This property is using `latest` rule format, which is designed to reflect interface changes immediately. We suggest converting the property to a stable rule format such as `v2024-02-12` to minimize the risk of interface changes breaking your API client program./,
			),
		).toBeTruthy();
		expect(ex.message).toEqual(`Errors prevent activation of the property. Fix them and rerun.`);
	});

	test('Warnings stop execution', async () => {
		const papiMock = {
			// Ugh. We need this to get as far as saving the rules (next call).
			latestPropertyVersion: jest.fn(
				(): Promise<VersionInfo> =>
					Promise.resolve({
						propertyVersion: 999,
						productionStatus: 'INACTIVE',
						stagingStatus: 'INACTIVE',
					}),
			),
			saveRulesIntoPropertyVersion: jest.fn(
				(): Promise<ValidationErrors> =>
					Promise.resolve(
						ValidationErrors.from_validation_results({
							errors: [],
							warnings: [
								{
									type: 'does not matter',
									errorLocation: '#/loc',
									detail: 'warn text 1',
								},
							],
						}),
					),
			),
		};

		const ex = await expectTermination(
			run({
				isDryRun: false,
				papiApi: () => papiMock as unknown as PropertyManagerAPI,
				onConfig: (prop: Property): Property => {
					// We need to include a command so the `.__loc` property is generated, since that's needed to map the `errorLocation` to a line of code.
					prop.setAllowPut({enabled: true});
					return prop;
				},
			}),
		);

		expect(testArrayContains(ex.stderr, /.*WARNING #\/loc - warn text 1.*/)).toBeTruthy();
		expect(ex.message).toContain(
			`Warnings prevent activation of the property. Either ignore errors with \`-w\` or fix them and rerun.`,
		);
	});
});

describe('Ensure the local agreement file is present for activation', () => {
	test('Verify activation requires an agreement file in the homedir', async () => {
		const err = await expectTermination(
			run({
				argvs: ['activate'],
				hasLocalAgreement: false,
			}),
		);

		expect(err.message).toMatch(
			/Activation is available after you agree to the terms and conditions shown by 'npx akj init'. If you have, but there is no .akj-agreed file in your home directory, then contact your Akamai rep./,
		);
	});
});
