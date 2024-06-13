/**
 * Akamai PCDN
 *
 * Copyright 2024 Akamai Technologies, Inc.
 *
 * You may not use this file except in compliance with the License. You may obtain a copy of the License at
 *
 * https://github.com/akamai/akj-tech-preview/blob/main/LICENSE.md
 */

import {RULE_FORMAT} from '../types';
import {CliPrimitives} from '../akj/akj-impl';
import {ConnectOrLoginError, PropertyCoordinates, PropertyManagerAPI} from './papi';
import {emitValidationErrors} from '../utils/errors';

/**
 * Activate the given property on STAGING.
 *
 * @param {CliPrimitives} primitives Dependency injection of needed dependencies
 * @param {PropertyManagerAPI} api The API to call
 * @param {PropertyCoordinates} propertyMeta The identifier for the property
 * @param {object} papiJson The Papi JSON
 * @param {boolean} ignoreWarnings True to ignore warnings during activation. I too like to live dangerously.
 * @param {'PRODUCTION' | 'STAGING'} network Network that we should activate onto.
 * @param {boolean} stopPropertyActivation True to stop property activation.
 * @returns {Promise<{propertyId: string; version: number; activationID: string | number}>} Information about the
 *   activated property version.
 */
export async function uploadAndActivateProperty(
	primitives: CliPrimitives,
	api: PropertyManagerAPI,
	propertyMeta: PropertyCoordinates,
	papiJson: object,
	ignoreWarnings: boolean,
	network: 'PRODUCTION' | 'STAGING',
	stopPropertyActivation: boolean,
): Promise<{propertyId: string; version: number; activationID: string | number}> {
	try {
		primitives.statusUpdator.increment(0, 'Creating property version.');

		// Choose an appropriate version to edit.
		const versionToEdit = await selectOrCreatePropertyVersion(api, propertyMeta);

		primitives.statusUpdator.increment(1, 'Saving property version.');

		// Write the PAPI JSON to Property Manager
		const validationResult = await api.saveRulesIntoPropertyVersion(
			propertyMeta,
			RULE_FORMAT,
			versionToEdit,
			JSON.stringify(papiJson),
		);

		primitives.statusUpdator.increment(1, 'Validating property warnings/errors.');

		if (validationResult.warnings.length > 0) {
			emitValidationErrors(primitives, 'WARNING', validationResult.warnings, papiJson);
		}

		if (validationResult.errors.length > 0) {
			emitValidationErrors(primitives, 'ERROR', validationResult.errors, papiJson);
			primitives.terminate('Errors prevent activation of the property. Fix them and rerun.');
		}

		if (!ignoreWarnings && validationResult.warnings.length > 0) {
			// We terminate after the error output because we want that to take precedence if there are
			// both errors and warnings.
			primitives.terminate(
				'Warnings prevent activation of the property. Either ignore errors with `-w` or fix them and rerun.',
			);
		}
		if (stopPropertyActivation) {
			primitives.terminate(`--save-only is set. Not activating property version ${versionToEdit}.`);
		}

		primitives.statusUpdator.increment(1, 'Activating property version.');

		// Activate the given version
		const {activationId} = await api.activatePropertyVersion(propertyMeta, versionToEdit, network);

		primitives.statusUpdator.increment(1, 'Property Activation started.');
		return {propertyId: propertyMeta.propertyId, version: versionToEdit, activationID: activationId};
	} catch (err) {
		if (err instanceof ConnectOrLoginError) {
			const pmErr = err as ConnectOrLoginError;
			if (pmErr.status === 403) {
				primitives.terminate(`Login failed. Check your credentials.`);
			} else {
				primitives.terminate(pmErr.message);
			}
		} else {
			throw err;
		}
	}
}

/**
 * Chooses a version of the property that will be updated and activated. If the latest version is active on staging or
 * production, a new version will be created.
 *
 * @param {PropertyManagerAPI} api The API to call
 * @param {PropertyCoordinates} propertyMeta The identifier for the property
 * @returns {Promise<number>} The new property version id.
 */
export async function selectOrCreatePropertyVersion(
	api: PropertyManagerAPI,
	propertyMeta: PropertyCoordinates,
): Promise<number> {
	const latestVersion = await api.latestPropertyVersion(propertyMeta);

	let versionToEdit: number;
	if (latestVersion.stagingStatus === 'INACTIVE' && latestVersion.productionStatus === 'INACTIVE') {
		versionToEdit = latestVersion.propertyVersion;
	} else {
		versionToEdit = await api.createPropertyVersion(propertyMeta, latestVersion.propertyVersion);
	}

	return versionToEdit;
}
