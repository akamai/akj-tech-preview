/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import EdgeGrid from 'akamai-edgegrid';
import * as pcdnPackage from '../../package.json';

// This is necessary because `akamai-edgegrid` doesn't re-export the response.
import {AxiosResponse} from 'axios';
import {FullErrorBlob, StructuredError} from '../utils/errors';

// We are targeting Ion Standard which has common code 'prd_Fresca'
// https://techdocs.akamai.com/property-mgr/reference/id-prefixes#common-product-ids
export const productId = 'prd_Fresca';

/** Information about a property that seems necessary for the API. */
export interface PropertyCoordinates {
	/** A bunch of digits, optionally prefixed with `prp_`. */
	propertyId: string;
	contractId: string;
	groupId: string;
	accountSwitchKey?: string;
	edgeWorkerId: number;
	authorEmail: string;

	// True to have bundle.json edgeworker-version to be automagically incremented.
	autoSemVer?: boolean;
}

export type NetworkStatus =
	| 'ACTIVE'
	| 'INACTIVE'
	| 'PENDING'
	| 'ABORTED'
	| 'DEACTIVATED'
	| 'PENDING_DEACTIVATION'
	| 'PENDING_CANCELLATION';

/**
 * A version field returned from https://techdocs.akamai.com/property-mgr/reference/get-property-version (in the
 * versions/items array).
 */
export interface VersionInfo {
	propertyVersion: number;
	productionStatus: NetworkStatus;
	stagingStatus: NetworkStatus;
}

export interface ContractInfo {
	contractId: string;
	contractTypeName: string;
}

export interface GroupInfo {
	groupId: string;
	groupName: string;
}

export interface PropertyInfo {
	accountId: string;
	assetId: string;
	contractId: string;
	groupId: string;
	latestVersion: string;
	note: string;
	productionVersion: number | undefined;
	propertyId: string;
	propertyName: string;
	stagingVersion: number | undefined;
}

export interface EdgeWorkerInfo {
	accountId: string;
	createdBy: string;
	createdTime: string;
	description: string;
	edgeWorkerId: number;
	groupId: number;
	lastModifiedBy: string;
	lastModifiedTime: string;
	name: string;
	resourceTierId: number;
}

export interface edgeHostNameInfo {
	edgeHostnameDomain: string;
	edgeHostnameId: string;
}
export interface cpCodeInfo {
	cpcodeId: string;
	cpcodeName: string;
	productIds: string[];
}

/** Helper type that represents the internal types we pass to the HTTP layer. */
type RequestArgs = {[key: string]: string | boolean | number};

/**
 * Inquirer can have name, value pairs rather just simple strings. This allows for us to display a nicer name and have
 * the correct value
 */
export interface NameValuePromptQuestions {
	name: string;
	value: string;
	extraInfo?: string[];
}

/** Indicates that the API was unable to connect, probably due to a login or network issue. */
export class ConnectOrLoginError extends Error {
	/** HTTP Status of the response */
	readonly status: number;
	readonly data: object;

	constructor(message: string, status: number, data: object) {
		super(message);
		this.status = status;
		this.data = data;
	}

	toString(): string {
		return `Unable to login: ${this.message}, ${this.status}, ${JSON.stringify(this.data, undefined, 2)}`;
	}
}

/**
 * Defines the shape of the https://datatracker.ietf.org/doc/html/rfc7807 inspired error objects the PM API lobs back at
 * us.
 */
export interface ErrorInstance {
	type: string;
	detail: string;
	[key: string]: string;
}

/** Describes validation errors in a PAPI JSON tree, mapped back to the PAPI JS lines of code. */
export class ValidationErrors {
	public errors: Array<ErrorInstance> = [];
	public warnings: Array<ErrorInstance> = [];

	private constructor() {}

	/**
	 * A builder for use during tests. Allows us to create an empty set of errors/warnings.
	 *
	 * @returns {ValidationErrors} Always returns an empty set of validation errors.
	 */
	static for_test(): ValidationErrors {
		return new ValidationErrors();
	}

	/**
	 * Sanitize validation errors from the PAPI response.
	 *
	 * @param {PropertyValidationPayload} payload - The errors and warnings generated
	 * @returns {ValidationErrors} The errors that occurred
	 */
	static from_validation_results(payload: PropertyValidationPayload): ValidationErrors {
		const ret = new ValidationErrors();
		if (payload.errors) {
			ret.errors = payload.errors;
		}

		if (payload.warnings) {
			ret.warnings = payload.warnings;
		}

		return ret;
	}

	/**
	 * Converts the output of a JSON validation error into a common error format that is shared with validation
	 * failures.
	 *
	 * @param {JsonSchemaInvalidPayload} payload The validation errors to convert.
	 * @returns {ValidationErrors} The converted json validation errors
	 */
	static from_json_schema_invalid(payload: JsonSchemaInvalidPayload): ValidationErrors {
		const ret = new ValidationErrors();

		for (const error of payload.errors) {
			ret.errors.push({
				// We just rename the errorLocation. It's unclear if this is a good idea.
				type: payload.type,
				errorLocation: error.location,
				detail: error.detail,
			});
		}

		return ret;
	}
}

interface JsonSchemaInvalidPayload {
	/** URI of the type of error. */
	type: string;

	errors: Array<{
		/** JSON pointer to the error. */
		location: string;

		/** Kinda/sorta human readable text. */
		detail: string;
	}>;
}

interface PropertyValidationPayload {
	errors: Array<ErrorInstance>;
	warnings: Array<ErrorInstance>;
}

/**
 * The object returned from an EdgeWorker's validation call.
 *
 * @see PropertyManagerAPI.validateEdgeWorkerBundle
 * @see https://techdocs.akamai.com/edgeworkers/reference/post-validations
 */
export interface EdgeWorkerValidationResult {
	errors: Array<{
		type: string;
		message: string;
	}>;

	warnings?: Array<{
		type: string;
		message: string;
	}>;
}
export interface ActivatePropertyResponse {
	status: number;
	body: any;
	// TODO: activationId only use type string.
	// https://track.akamai.com/jira/browse/EW-22448
	activationId: string | number;
}

export interface ActivateEdgeWorkerResponse {
	status: number;
	body: any;
	activationId: number | string;
}

/**
 * An API to Property Manager.
 *
 * @see https://techdocs.akamai.com/property-mgr/reference/api
 * @see https://techdocs.akamai.com/property-mgr/reference/post-property-activations
 * @see https://git.source.akamai.com/users/afaden/repos/programmable-cdn-examples/browse/js-ghost-transformer/akamai_apis.js
 */
export class PropertyManagerAPI {
	readonly eg: EdgeGrid;
	readonly accountSwitchKey?: string;

	constructor(eg: EdgeGrid, accountSwitchKey?: string) {
		this.eg = eg;
		this.accountSwitchKey = accountSwitchKey;
	}

	/**
	 * Calls `send()` on the EdgeGrid API (which dispatches the previously configured call), then normalizes the
	 * response to a status code and a JSON-parsed body.
	 *
	 * @param {EdgeGrid} eg The instance to use for sending to EdgeGrid
	 * @param {string} structuredFailureDescription A message that should be shown if the request fails.
	 * @returns {Promise<{status: number; body: any}>} The status code and the body from the Axios response.
	 */
	private sendInPromise(eg: EdgeGrid, structuredFailureDescription: string): Promise<{status: number; body: any}> {
		return new Promise((resolve, reject) => {
			eg.send(function (error, response: AxiosResponse<unknown, unknown> | undefined, _body) {
				if (error) {
					if (typeof error.response !== 'object') {
						// The response is missing when we fail to connect to the server.
						reject(new ConnectOrLoginError(error.message, -1, {}));
						return;
					}

					// Check if there is an RFC7807-compliant "problem detail" that should be exposed to users.
					// The detail is indicated by the `application/problem+json` MIME type.
					const contentType = error.response?.headers['content-type'];
					if (typeof contentType === 'string' && contentType.indexOf('application/problem+json') > -1) {
						reject(
							new StructuredError(
								structuredFailureDescription || 'failure',
								error.response.data as unknown as FullErrorBlob,
							),
						);
						return;
					}

					if (error.response.status === 403) {
						// It appears that 403 always means login failure.
						reject(
							new ConnectOrLoginError(
								error.message,
								error.response.status,
								error.response.data as object,
							),
						);
						return;
					}

					resolve({status: error.response.status || -1, body: error.response.data || {}});
					return;
				}

				resolve({status: response?.status || -1, body: response?.data || {}});
			});
		});
	}

	/**
	 * Create a new EdgeWorker version with the given tarball.
	 *
	 * @param {PropertyCoordinates} propertyCoords Contains the accountSwitchKey, which we may need.
	 * @param {Uint8Array} bundleByteArray The contents of the EdgeWorker version tarball.
	 * @returns {EdgeWorkerValidationResult} Return the validation errors and warnings.
	 */
	async validateEdgeWorkerBundle(
		propertyCoords: PropertyCoordinates,
		bundleByteArray: Uint8Array,
	): Promise<EdgeWorkerValidationResult> {
		const qs: {[key: string]: string} = {};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		this.eg.auth({
			path: `/edgeworkers/v1/validations`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/gzip',
				Accept: 'application/json',
			},
			qs,
			body: bundleByteArray,
		});
		const {status} = await this.sendInPromise(this.eg, `EdgeWorker bundle validation failed`);

		if (status === 200) {
			return {
				errors: [],
			};
		}

		return {
			errors: [
				{
					type: 'UNHANDLED_STATUS',
					message: `EdgeWorker bundle validation failed. API call failed with unhandled status ${status}`,
				},
			],
		};
	}

	/**
	 * Create a new EdgeWorker version with the given tarball.
	 *
	 * @param {PropertyCoordinates} propertyCoords Contains the accountSwitchKey, which we may need.
	 * @param {number} edgeWorkerId Identifies the EdgeWorker.
	 * @param {Uint8Array} bundleByteArray The contents of the EdgeWorker version tarball.
	 * @returns {{edgeWorkerId: number; version: string}} Eventually the validation errors from the rules.
	 */
	async createEdgeWorkerVersion(
		propertyCoords: PropertyCoordinates,
		edgeWorkerId: number,
		bundleByteArray: Uint8Array,
	): Promise<{edgeWorkerId: number; version: string}> {
		const qs: {[key: string]: string} = {};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		this.eg.auth({
			path: `/edgeworkers/v1/ids/${edgeWorkerId}/versions`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/gzip',
				Accept: 'application/json',
			},
			qs,
			body: bundleByteArray,
		});
		const {status, body} = await this.sendInPromise(
			this.eg,
			`Failed to upload bundle for EdgeWorker ${edgeWorkerId}`,
		);

		if (status === 201) {
			return {edgeWorkerId: body.edgeWorkerId, version: body.version};
		}

		throw new Error(`unhandled status ${status}`);
	}

	/**
	 * Activate the given EdgeWorker version on the requested network.
	 *
	 * @param {PropertyCoordinates} propertyCoords Carries the accountSwitchKey.
	 * @param {number} edgeWorkerId The EW to activate.
	 * @param {string} version The version of the EW to activate.
	 * @param {'PRODUCTION' | 'STAGING'} network Where the EdgeWorker should be activated.
	 * @returns {void} Returns nothing onsuccess.
	 */
	async activateEdgeWorkerVersion(
		propertyCoords: PropertyCoordinates,
		edgeWorkerId: number,
		version: string,
		network: 'PRODUCTION' | 'STAGING',
	): Promise<ActivateEdgeWorkerResponse> {
		const qs: {[key: string]: string} = {};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		this.eg.auth({
			path: `/edgeworkers/v1/ids/${edgeWorkerId}/activations`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			qs,
			body: {
				network,
				version,
				note: `Activated by the PCDN Tech Preview ${pcdnPackage.version}`,
			},
		});

		const response = await this.sendInPromise(
			this.eg,
			`Failed to activate version ${version} for EdgeWorker ${edgeWorkerId}`,
		);

		if (!('activationId' in response.body)) {
			throw new Error('Missing `activationId` in edgeworker activation response body.');
		}

		if (response.status === 201) {
			return {
				...response,
				activationId: response.body.activationId,
			};
		} else {
			throw new Error(`Unhandled edgeworker activation return status ${response.status}`);
		}
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-latest-property-version
	 *
	 * @param {PropertyCoordinates} propertyCoords The identifier for the property
	 * @returns {Promise<VersionInfo>} Eventually the latest version info of the property
	 */
	async latestPropertyVersion(propertyCoords: PropertyCoordinates): Promise<VersionInfo> {
		const qs: {[key: string]: string} = {
			contractId: propertyCoords.contractId,
			groupId: propertyCoords.groupId,
		};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/properties/${propertyCoords.propertyId}/versions/latest`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
		});

		// TODO
		const body = (
			await this.sendInPromise(this.eg, `Failed to find latest version for property ${propertyCoords.propertyId}`)
		).body;

		return (body as any).versions.items[0] as VersionInfo;
	}

	/**
	 * Creates a new version of a property. It doesn't set the text of it, it just creates the new version.
	 *
	 * https://techdocs.akamai.com/property-mgr/reference/post-property-versions
	 *
	 * @param {PropertyCoordinates} propertyCoords The identifiers needed for the property
	 * @param {number} baseVersion - The version that we should build upon.
	 * @returns {Promise<number>} The new version number
	 */
	async createPropertyVersion(propertyCoords: PropertyCoordinates, baseVersion: number): Promise<number> {
		const qs: {[key: string]: string} = {
			contractId: propertyCoords.contractId,
			groupId: propertyCoords.groupId,
			validateMode: 'full',
			validateRules: 'true',
			dryRun: 'false',
		};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/properties/${propertyCoords.propertyId}/versions`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
			body: {
				createFromVersion: baseVersion,
			},
		});
		const result = await this.sendInPromise(
			this.eg,
			`Failed to create property version for ${propertyCoords.propertyId}`,
		);

		return parseInt(result.body.versionLink.match(/.*\/versions\/(.*)\?.*/)[1]);
	}

	/**
	 * Upload the given set of rules into the named property.
	 *
	 * @param {PropertyCoordinates} propertyCoords The identifer for the property
	 * @param {string} ruleFormat The ruleFormat to specify for this property.
	 * @param {number} versionToWrite The version number of the property to write the rules to
	 * @param {string} rules The rules to write
	 * @returns {Promise<ValidationErrors>} Eventually the validation errors from the rules.
	 */
	async saveRulesIntoPropertyVersion(
		propertyCoords: PropertyCoordinates,
		ruleFormat: string,
		versionToWrite: number,
		rules: string,
	): Promise<ValidationErrors> {
		const qs: {[key: string]: string} = {
			contractId: propertyCoords.contractId,
			groupId: propertyCoords.groupId,
			validateMode: 'full',
			validateRules: 'true',
			dryRun: 'false',
		};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/properties/${propertyCoords.propertyId}/versions/${versionToWrite}/rules`,
			method: 'PUT',
			headers: {
				// The MIME tomfoolery is described on https://techdocs.akamai.com/property-mgr/reference/rule-format-schemas
				// Fix in EW-20251
				'Content-Type': ` application/vnd.akamai.papirules.${ruleFormat}+json`,
				Accept: `application/vnd.akamai.papirules.${ruleFormat}+json`,
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
			body: rules,
		});

		try {
			const {status, body} = await this.sendInPromise(
				this.eg,
				`Failed to save PAPI JSON for ${propertyCoords.propertyId}`,
			);

			if (status === 200) {
				// We get a 200 when the new property payload is uploaded. But validation may still fail.
				const payload = body as PropertyValidationPayload;

				return ValidationErrors.from_validation_results(payload);
			}

			throw new Error(`unhandled status ${status}`);
		} catch (e) {
			if (e instanceof StructuredError) {
				const structuredError = e as StructuredError;

				if (structuredError.data?.type === 'https://problems.luna.akamaiapis.net/papi/v0/json-schema-invalid') {
					const payload = structuredError.data as unknown as JsonSchemaInvalidPayload;
					return ValidationErrors.from_json_schema_invalid(payload);
				}
			}

			throw e;
		}
	}

	async activatePropertyVersion(
		propertyCoords: PropertyCoordinates,
		versionToWrite: number,
		network: 'PRODUCTION' | 'STAGING',
	): Promise<ActivatePropertyResponse> {
		const qs: {[key: string]: string} = {
			contractId: propertyCoords.contractId,
			groupId: propertyCoords.groupId,
			validateMode: 'full',
			validateRules: 'true',
			dryRun: 'false',
		};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/properties/${propertyCoords.propertyId}/activations`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
			body: {
				propertyVersion: versionToWrite,
				network,
				notifyEmails: [propertyCoords.authorEmail],
				acknowledgeAllWarnings: true,
				complianceRecord: {noncomplianceReason: 'NO_PRODUCTION_TRAFFIC'},
				note: `Activated by the PCDN Tech Preview ${pcdnPackage.version}`,
			},
		});

		// Extract the activation link from the `data` of a successful response.
		const response = await this.sendInPromise(
			this.eg,
			`Failed to activate version ${versionToWrite} of property ${propertyCoords.propertyId}`,
		);

		if (!('activationLink' in response.body)) {
			throw new Error('Missing `activationLink` from the property activation response.');
		}

		const activationId = getActivationID(response.body.activationLink);

		return {
			...response,
			activationId,
		};
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-property-version-rules
	 *
	 * @param {PropertyCoordinates} propertyCoords The identifiers for the property
	 * @param {number} versionToFetch The version of the property to fetch
	 * @returns {Promise<{status: number; body: any}>} The status and body of the property
	 */
	async fetchPropertyVersion(
		propertyCoords: PropertyCoordinates,
		versionToFetch: number,
	): Promise<{
		status: number;
		body: any;
	}> {
		const qs: {[key: string]: string} = {
			contractId: propertyCoords.contractId,
			groupId: propertyCoords.groupId,
			validateMode: 'full',
			validateRules: 'true',
			dryRun: 'false',
		};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		} else if (propertyCoords.accountSwitchKey) {
			qs.accountSwitchKey = propertyCoords.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/properties/${propertyCoords.propertyId}/versions/${versionToFetch}/rules`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
		});

		return this.sendInPromise(this.eg, `Failed to fetch version of property ${propertyCoords.propertyId}`);
	}

	/**
	 * Creates a new property from scratch. Version 1 of a new property is created automatically.
	 *
	 * https://techdocs.akamai.com/property-mgr/reference/post-properties
	 *
	 * @param {string} contractId The contract id for the property
	 * @param {string} groupId The group id for the property
	 * @param {string} propertyName A descriptive name for the property
	 * @param {string} ruleFormat The ruleFormat to specify for this property.
	 * @returns {Promise<string>} The property id
	 */
	async createProperty(
		contractId: string,
		groupId: string,
		propertyName: string,
		ruleFormat: string,
	): Promise<string> {
		const qs: RequestArgs = {
			contractId: contractId,
			groupId: groupId,
		};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}
		await this.eg.auth({
			path: '/papi/v1/properties',
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'PAPI-Use-Prefixes': 'true',
				Accept: '*/*',
			},
			body: {
				propertyName: propertyName,
				productId: productId,
				ruleFormat: ruleFormat,
			},
			qs,
		});

		const result = await this.sendInPromise(this.eg, `Failed to create property ${propertyName}`);
		return result.body.propertyLink.match(/\/papi\/v1\/properties\/(.*)\?.*/)[1];
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-contracts
	 *
	 * @returns {Promise<NameValuePromptQuestions[]>} The list of contracts identifiers
	 */
	async listContracts(): Promise<Array<NameValuePromptQuestions>> {
		const qs: RequestArgs = {};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: '/papi/v1/contracts',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'PAPI-Use-Prefixes': 'true',
			},
			qs,
		});
		const items = (await this.sendInPromise(this.eg, 'Failed to list available contracts')).body.contracts
			.items as ContractInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: `${item.contractId} - ${item.contractTypeName}`,
			value: item.contractId,
		}));

		return mappedItems;
	}

	/**
	 * Search for the properties that exist
	 *
	 * @param {string} contractId The contract ID to search
	 * @param {string} groupId The group ID to search
	 * @returns {Promise<NameValuePromptQuestions[]>} The list of name/value for the properties
	 */
	async listProperties(contractId: string, groupId: string): Promise<Array<NameValuePromptQuestions>> {
		const queryString: RequestArgs = {};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}

		queryString.contractId = contractId;
		queryString.groupId = groupId;

		await this.eg.auth({
			path: '/papi/v1/properties',
			method: 'GET',
			headers: {
				'PAPI-Use-Prefixes': 'true',
			},
			qs: queryString,
		});

		const items = (await this.sendInPromise(this.eg, 'Failed to list available properties.')).body.properties
			.items as PropertyInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: item.propertyName,
			value: item.propertyId,
		}));

		return mappedItems;
	}

	async listEdgeWorkers(groupId: string): Promise<Array<NameValuePromptQuestions>> {
		const queryString: RequestArgs = {};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}

		// remove the grp_ prefix for the group because our open apis don't line up
		queryString.groupId = groupId.replaceAll('grp_', '');

		await this.eg.auth({
			path: '/edgeworkers/v1/ids',
			method: 'GET',
			qs: queryString,
		});

		const items = (await this.sendInPromise(this.eg, 'Failed to list available EdgeWorkers.')).body
			.edgeWorkerIds as EdgeWorkerInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: `${item.name}${item.description ? ' - ' + item.description : ''}`,
			value: `${item.edgeWorkerId}`,
		}));

		return mappedItems;
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-groups
	 *
	 * @returns {Promise<NameValuePromptQuestions[]>} The group ids that may contain properties
	 */
	async listGroups(): Promise<Array<NameValuePromptQuestions>> {
		const qs: RequestArgs = {};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: '/papi/v1/groups',
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				'PAPI-Use-Prefixes': 'true',
			},
			qs,
		});
		const items = (await this.sendInPromise(this.eg, 'Failed to list available groups')).body.groups
			.items as GroupInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: `${item.groupId} - ${item.groupName}`,
			value: item.groupId,
		}));

		return mappedItems;
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/patch-property-version-hostnames
	 *
	 * @param {string} contractId The contract id for the property
	 * @param {string} groupId The group id for the property
	 * @param {string} cnameFrom The hostname that your end users see
	 * @param {string} edgeHostnameId The edge hostname identifier
	 * @param {string} propertyId The property id for the property
	 * @returns {Promise<any>} A promise to get some property version hostname objects
	 */
	async addPropertyHostNames(
		contractId: string,
		groupId: string,
		cnameFrom: string,
		edgeHostnameId: string,
		propertyId: string,
	): Promise<any> {
		const qs: RequestArgs = {
			contractId: contractId,
			groupId: groupId,
			validateHostnames: false,
			includeCertStatus: false,
		};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}
		const hostname = {
			cnameType: 'EDGE_HOSTNAME',
			cnameFrom: cnameFrom,
			edgeHostnameId: edgeHostnameId,
		};
		await this.eg.auth({
			path: `/papi/v1/properties/${propertyId}/versions/1/hostnames`,
			method: 'PATCH',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'PAPI-Use-Prefixes': 'true',
			},
			body: {
				add: [hostname],
			},
			qs,
		});

		return await this.sendInPromise(this.eg, `Failed to add hostname ${cnameFrom} to property ${propertyId}`);
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/post-cpcodes
	 *
	 * @param {string} contractId The contract id for the property
	 * @param {string} groupId The group id for the property
	 * @param {string} cpcodeName TA descriptive label for the CP code
	 * @returns {Promise<string>} The created CP Code
	 */
	async createCpcode(contractId: string, groupId: string, cpcodeName: string): Promise<string> {
		const qs: RequestArgs = {
			contractId: contractId,
			groupId: groupId,
		};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/cpcodes`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'PAPI-Use-Prefixes': 'true',
			},
			body: {
				cpcodeName: cpcodeName,
				productId: productId,
			},
			qs,
		});
		const result = await this.sendInPromise(this.eg, `Failed to create CP code with name ${cpcodeName}`);
		return result.body.cpcodeLink.match(/\/papi\/v1\/cpcodes\/(.*)\?.*/)[1];
	}

	/**
	 * https://techdocs.akamai.com/edgeworkers/reference/post-ids
	 *
	 * @param {string} groupId Identifies a group to assign to the EdgeWorker.
	 * @param {string} EdgeWorkerName A name you assign to the EdgeWorker.
	 * @returns {Promise<number>} The new Edgeworker ID
	 */
	async createEdgeWorkerId(groupId: string, EdgeWorkerName: string): Promise<number> {
		const qs: RequestArgs = {};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/edgeworkers/v1/ids`,
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				'PAPI-Use-Prefixes': 'true',
			},
			body: {
				groupId: groupId,
				name: EdgeWorkerName,
				resourceTierId: 200,
			},
			qs,
		});
		const result = await this.sendInPromise(this.eg, `Failed to create Edgeworker ID for ${EdgeWorkerName}`);
		return result.body.edgeWorkerId;
	}

	/**
	 * Search for the edge hostnames that exist
	 *
	 * https://techdocs.akamai.com/property-mgr/reference/get-edgehostnames
	 *
	 * @param {string} contractId The contract ID to search
	 * @param {string} groupId The group ID to search
	 * @returns {Promise<NameValuePromptQuestions[]>} The list of name/value for the edge hostnames
	 */
	async listEdgeHostNames(contractId: string, groupId: string): Promise<Array<NameValuePromptQuestions>> {
		const queryString: RequestArgs = {
			contractId: contractId,
			groupId: groupId,
		};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: '/papi/v1/edgehostnames',
			method: 'GET',
			headers: {
				'PAPI-Use-Prefixes': 'true',
			},
			qs: queryString,
		});

		const items = (await this.sendInPromise(this.eg, 'Failed to list available edge hostnames.')).body.edgeHostnames
			.items as edgeHostNameInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: item.edgeHostnameDomain,
			value: item.edgeHostnameId,
		}));

		return mappedItems;
	}

	/**
	 * Create a new edge hostname
	 *
	 * https://techdocs.akamai.com/property-mgr/reference/post-edgehostnames
	 *
	 * @param {string} contractId The contract ID to search
	 * @param {string} groupId The group ID to search
	 * @param {string} domainPrefix The origin domain portion of the edge hostname
	 * @param {boolean} is_enhanced Whether to create enhance TLS edge hostname or standard TLS edge hostname
	 * @returns {Promise<string>} The newly created edge hostname ID
	 */
	async createEdgeHostNames(
		contractId: string,
		groupId: string,
		domainPrefix: string,
		is_enhanced: boolean,
	): Promise<string> {
		const queryString: RequestArgs = {
			contractId: contractId,
			groupId: groupId,
		};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}
		const body: RequestArgs = {
			domainPrefix: domainPrefix,
			productId: productId,
		};
		if (is_enhanced) {
			body.domainSuffix = 'edgekey.net';
			body.ipVersionBehavior = 'IPV6_COMPLIANCE';
			body.secureNetwork = 'ENHANCED_TLS';
			body.certEnrollmentId = await this.getCertEnrollmentId(contractId);
			body.secure = true;
		} else {
			body.domainSuffix = 'edgesuite.net';
			body.ipVersionBehavior = 'IPV4';
			body.secureNetwork = 'STANDARD_TLS';
		}

		await this.eg.auth({
			path: '/papi/v1/edgehostnames',
			method: 'POST',
			headers: {
				'PAPI-Use-Prefixes': 'true',
				'Content-Type': 'application/json',
				Accept: 'application/json',
			},
			body,
			qs: queryString,
		});

		const result = await this.sendInPromise(this.eg, `Failed to create edge hostname`);
		return result.body.edgeHostnameLink.match(/\/papi\/v1\/edgehostnames\/(.*)\?.*/)[1];
	}

	/**
	 * Get the certificate enrollment ID
	 *
	 * https://techdocs.akamai.com/cps/reference/get-enrollments
	 *
	 * @param {string} contractId The contract ID to search
	 * @returns {Promise<number>} The certificate enrollment ID
	 */
	async getCertEnrollmentId(contractId: string): Promise<number> {
		const queryString: {[key: string]: string} = {
			contractId: contractId.replace(/^(ctr_)/, ''),
		};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: 'cps/v2/enrollments',
			method: 'GET',
			headers: {
				Accept: 'application/vnd.akamai.cps.enrollments.v11+json',
			},
			qs: queryString,
		});

		const result = await this.sendInPromise(this.eg, `Failed to get certification enrollment id`);
		return parseInt(result.body.enrollments[0].id);
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-schemas-product-rule-format
	 *
	 * @param {string} schema Name of the rule format we're passing to the endpoint. Of the form `vYYYY-MM-DD`, eg.
	 *   `v2013-02-21`.
	 * @returns {object} The Rule Format.
	 */
	async fetchSchema(schema: string): Promise<object> {
		const qs: {accountSwitchKey?: string} = {};

		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		await this.eg.auth({
			path: `/papi/v1/schemas/products/${productId}/${schema}`,
			method: 'GET',
			headers: {
				'Content-Type': 'application/json',
				Accept: '*/*',
				'PAPI-Use-Prefixes': 'false',
			},
			qs,
		});
		return (await this.sendInPromise(this.eg, 'Getting property version')).body;
	}

	/**
	 * https://techdocs.akamai.com/property-mgr/reference/get-cpcodes
	 *
	 * @param {string} contractId The contract ID to search
	 * @param {string} groupId The group ID to search
	 * @returns {Promise<NameValuePromptQuestions[]>} The list of the available CP Codes
	 */
	async listCpCodes(contractId: string, groupId: string): Promise<Array<NameValuePromptQuestions>> {
		const queryString: RequestArgs = {};
		if (this.accountSwitchKey) {
			queryString.accountSwitchKey = this.accountSwitchKey;
		}

		queryString.contractId = contractId;
		queryString.groupId = groupId;

		await this.eg.auth({
			path: '/papi/v1/cpcodes',
			method: 'GET',
			headers: {
				'PAPI-Use-Prefixes': 'true',
			},
			qs: queryString,
		});

		const items = (await this.sendInPromise(this.eg, 'Failed to list available CP codes.')).body.cpcodes
			.items as cpCodeInfo[];

		const mappedItems: NameValuePromptQuestions[] = items.map(item => ({
			name: item.cpcodeName,
			value: item.cpcodeId,
			extraInfo: item.productIds,
		}));

		return mappedItems;
	}

	/**
	 * https://techdocs.akamai.com/iam-api/reference/get-user-profile
	 *
	 * @returns {Promise<{uiUserName: string; uiIdentityId: string}>} The user's username in Control Center and Unique
	 *   identifier for the user.
	 */
	async viewProfile(): Promise<{uiUserName: string; uiIdentityId: string; accountId: string}> {
		const qs: RequestArgs = {};
		if (this.accountSwitchKey) {
			qs.accountSwitchKey = this.accountSwitchKey;
		}

		this.eg.auth({
			path: 'identity-management/v3/user-profile',
			method: 'GET',
			headers: {
				Accept: 'application/json',
			},
			qs,
		});
		const result = await this.sendInPromise(this.eg, `Failed to get profile information`);
		const body = result.body;
		return {
			uiUserName: body.uiUserName,
			uiIdentityId: body.uiIdentityId,
			accountId: body.accountId,
		};
	}
}

/**
 * Extract the property activationID from the activationLink.
 *
 * @param {string} activationLink The activationLink when launching a new activation.
 * @returns {string | number} Activation ID.
 * @see {@link https://techdocs.akamai.com/property-mgr/reference/get-property-activation}
 */
function getActivationID(activationLink: string): string | number {
	// activationLink format: /papi/v1/properties/{propertyId}/activations/{activationId}...
	const regex = /\/papi\/v1\/properties\/\w+\/activations\/(\w+)/;
	const match = activationLink.match(regex);
	if (match && match.length > 1) {
		return match[1];
	}

	throw new Error('Did not find `activationID` in `activationLink`.');
}
